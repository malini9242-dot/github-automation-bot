#!/usr/bin/env python3
"""Create a Render service from this repo and set env vars.

This script will:
- Read `RENDER_API_KEY` from the environment.
- Create a web service on Render configured to build using the repo's `Dockerfile`.
- Optionally set `SECRET_KEY`, `DATABASE_URL`, and `ALLOWED_HOSTS` as env vars.

IMPORTANT: The Render API shape can change. The script prints the curl payloads
for review and will prompt before executing any API calls.

Usage:
  Set `RENDER_API_KEY` in your environment and run:
    python scripts/render_create_service.py

You will be prompted for values for `SECRET_KEY` and `DATABASE_URL`.
"""
import os
import json
import requests
import getpass

RENDER_API = "https://api.render.com/v1"

def get_env(name):
    v = os.environ.get(name)
    if not v:
        print(f"Environment variable {name} is required.")
    return v

def prompt_yesno(msg):
    val = input(msg + " [y/N]: ").strip().lower()
    return val == "y" or val == "yes"

def main():
    api_key = get_env("RENDER_API_KEY")
    if not api_key:
        print("Set RENDER_API_KEY and re-run the script.")
        return

    # Repo defaults (from your workspace)
    owner = input("GitHub owner (default: malini-portfolio): ").strip() or "malini-portfolio"
    repo = input("GitHub repo (default: github-automation-bot): ").strip() or "github-automation-bot"
    branch = input("Branch to deploy (default: main): ").strip() or "main"

    service_name = input(f"Service name (default: {repo}): ").strip() or repo

    secret_key = getpass.getpass("SECRET_KEY (input will be hidden; press enter to generate): ")
    if not secret_key:
        import secrets
        secret_key = secrets.token_urlsafe(50)
        print("Generated SECRET_KEY (keep this secret):", secret_key)

    database_url = input("DATABASE_URL (mysql://user:pass@host:3306/dbname): ").strip()
    allowed_hosts = input("ALLOWED_HOSTS (comma-separated, e.g. your-app.onrender.com): ").strip()

    payload = {
        "name": service_name,
        "repo": {
            "provider": "github",
            "org": owner,
            "name": repo
        },
        "branch": branch,
        "env": "docker",
        "type": "web_service",
        "dockerfilePath": "Dockerfile",
        "startCommand": "gunicorn backend.wsgi --bind 0.0.0.0:8000 --log-file -",
        "plan": "free"
    }

    print("\nWill create Render service with the following payload:\n")
    print(json.dumps(payload, indent=2))

    if not prompt_yesno("Proceed to create service on Render?"):
        print("Aborted by user.")
        return

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    create_url = f"{RENDER_API}/services"

    resp = requests.post(create_url, headers=headers, json=payload)
    if resp.status_code not in (200, 201):
        print("Service creation failed:", resp.status_code, resp.text)
        print("You can inspect the payload and try manually via Render dashboard.")
        return

    service = resp.json()
    service_id = service.get("id")
    service_url = service.get("serviceDetailsUrl") or service.get("url") or service.get("defaultDomain")
    print("Service created:", service_id)
    print("Service info:", json.dumps(service, indent=2))

    # Optionally create a managed database on Render
    if prompt_yesno("Would you like to create a managed database on Render (Postgres or MySQL)?"):
        db_type = input("Database type ('postgres' or 'mysql', default: postgres): ").strip().lower() or "postgres"
        db_name = input(f"Database name (default: {service_name.replace('-', '_')}_db): ").strip() or f"{service_name.replace('-', '_')}_db"
        db_plan = input("Database plan (default: starter): ").strip() or "starter"
        db_region = input("Region (default: oregon): ").strip() or "oregon"

        db_payload = {
            "name": db_name,
            "plan": db_plan,
            "region": db_region,
            # Render's API may expect 'databaseType' or similar; try common key
            "databaseType": db_type,
        }

        print("\nWill attempt to create a managed database with payload:\n")
        print(json.dumps(db_payload, indent=2))

        if prompt_yesno("Proceed to create the managed database on Render?"):
            db_create_url = f"{RENDER_API}/databases"
            try:
                rdb = requests.post(db_create_url, headers=headers, json=db_payload)
            except Exception as e:
                print("Database creation request failed:", e)
                rdb = None

            if not rdb or rdb.status_code not in (200,201):
                print("Managed database creation failed or API rejected the request.")
                if rdb is not None:
                    print(rdb.status_code, rdb.text)
                print("If Render's API requires different fields, please create the DB in the Render dashboard and paste the DATABASE_URL when asked earlier.")
            else:
                db_info = rdb.json()
                db_id = db_info.get("id")
                print("Database created (id):", db_id)
                print(json.dumps(db_info, indent=2))

                # Poll for connection info
                if db_id:
                    print("Waiting for database to become available (this may take a few minutes)...")
                    import time
                    db_status_url = f"{RENDER_API}/databases/{db_id}"
                    conn_info = None
                    for _ in range(40):
                        rr = requests.get(db_status_url, headers=headers)
                        if rr.status_code == 200:
                            info = rr.json()
                            # Try common fields
                            conn_info = info.get("connectionInfo") or info.get("database_url") or info.get("credentials")
                            state = info.get("state") or info.get("status")
                            print("DB state:", state)
                            if conn_info:
                                break
                        time.sleep(10)

                    if conn_info:
                        # Normalize connection info to DATABASE_URL if possible
                        if isinstance(conn_info, dict):
                            # try to find a uri field
                            db_url = conn_info.get("uri") or conn_info.get("databaseUrl") or conn_info.get("connectionString")
                        else:
                            db_url = conn_info

                        if db_url:
                            print("Found database URL:", db_url)
                            # set as env var on service
                            if prompt_yesno("Set this DATABASE_URL on the created service?"):
                                ev = {"key": "DATABASE_URL", "value": db_url, "secure": True}
                                ev_url = f"{RENDER_API}/services/{service_id}/env-vars"
                                rset = requests.post(ev_url, headers=headers, json=ev)
                                if rset.status_code in (200,201):
                                    print("DATABASE_URL set on service.")
                                else:
                                    print("Failed to set DATABASE_URL:", rset.status_code, rset.text)
                        else:
                            print("Could not locate a database connection URL in the response; please retrieve it from Render dashboard and set it as `DATABASE_URL`.")


    # Set environment variables
    env_vars = []
    if secret_key:
        env_vars.append({"key": "SECRET_KEY", "value": secret_key, "secure": True})
    if database_url:
        env_vars.append({"key": "DATABASE_URL", "value": database_url, "secure": True})
    if allowed_hosts:
        env_vars.append({"key": "ALLOWED_HOSTS", "value": allowed_hosts, "secure": False})

    if env_vars:
        print("\nWill set the following env vars:")
        print(json.dumps(env_vars, indent=2))
        if prompt_yesno("Proceed to set these env vars on the created service?"):
            for ev in env_vars:
                ev_url = f"{RENDER_API}/services/{service_id}/env-vars"
                r = requests.post(ev_url, headers=headers, json=ev)
                if r.status_code not in (200,201):
                    print(f"Failed to set {ev['key']}:", r.status_code, r.text)
                else:
                    print(f"Set {ev['key']}")
    else:
        print("No env vars to set.")

    print("\nDone. Visit your service in the Render dashboard to watch the build/deploy.")
    if service_url:
        print("Likely URL:", service_url)

if __name__ == '__main__':
    main()
