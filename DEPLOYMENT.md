# Deployment guide for Render / Railway using Docker

This project contains a `Dockerfile` at the repository root that builds the React frontend and runs the Django backend. Use this to deploy to Render or Railway.

Render (Docker) quick steps:

1. Push this repo to GitHub.
2. Create a new Web Service on Render and connect your GitHub repo.
3. In Render, choose "Docker" as the environment (it will use the `Dockerfile`).
4. Set the following Environment Variables in Render:
   - `SECRET_KEY` — a long random string
   - `DEBUG` — `False`
   - `DATABASE_URL` — your MySQL connection string (e.g. `mysql://user:pass@hostname:3306/dbname`)
   - `ALLOWED_HOSTS` — comma-separated hostnames (e.g. `your-app.onrender.com`)
5. (Optional) Add a managed MySQL database in Render and use that `DATABASE_URL`.
6. Deploy. The app will be available at the Render-provided URL and will serve the React UI at `/` and the API at `/api/...`.

Using `render.yaml` (optional):

- This repo includes `render.yaml` at the project root. Render will detect it and create the service using the `Dockerfile`.
- After connecting the repo in Render, open the service created by the manifest and set the environment variables `SECRET_KEY`, `DATABASE_URL`, and `ALLOWED_HOSTS` in the Render dashboard (the manifest contains placeholders).


Railway quick steps (Docker):

1. Push repo to GitHub.
2. In Railway, create a new project and choose "Deploy from GitHub" or use Docker deploy.
3. Railway will detect the Dockerfile — configure environment variables (same as Render).
4. Provision a MySQL plugin in Railway and set `DATABASE_URL` accordingly.
5. Deploy and get the single URL.

Notes:
- The Dockerfile performs `collectstatic` during image build; ensure `DATABASE_URL` is set in the environment if you rely on DB during collect.
- If you prefer a buildless approach, use the multi-command build on the platform: build frontend, then run backend `pip install` and `collectstatic` during deploy.
