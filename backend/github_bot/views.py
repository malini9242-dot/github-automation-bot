from rest_framework.decorators import api_view
from rest_framework.response import Response

from accounts.models import GitHubUser
from accounts.github_service import get_user_repositories
from .models import Repository   # <-- Add this import


@api_view(["GET"])
def repositories(request):
    user = GitHubUser.objects.last()

    if not user:
        return Response(
            {"error": "No user found"},
            status=404
        )

    repos = get_user_repositories(
        user.access_token
    )

    # ==========================
    # SAVE REPOSITORIES TO MYSQL
    # ==========================
    for repo in repos:
        Repository.objects.update_or_create(
            repo_id=repo["id"],
            defaults={
                "user": user,
                "name": repo["name"],
                "full_name": repo["full_name"],
                "private": repo["private"],
                "html_url": repo["html_url"],
                "default_branch": repo.get(
                    "default_branch",
                    "main"
                ),
            }
        )

    # Map the DB webhook status back onto the GitHub API items
    db_repos = Repository.objects.filter(user=user)
    webhook_map = {r.repo_id: r.webhook_installed for r in db_repos}
    for repo in repos:
        repo["webhook_installed"] = webhook_map.get(repo["id"], False)

    # Return repos to frontend
    return Response(repos)