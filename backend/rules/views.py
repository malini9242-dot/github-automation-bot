from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import AutomationRule
from github_bot.models import Repository

@api_view(["GET", "POST"])
def rule_list(request):
    if request.method == "GET":
        rules = AutomationRule.objects.all().order_by("-created_at")
        data = [{
            "id": r.id,
            "repository_id": r.repository.repo_id,
            "repository_name": r.repository.name,
            "event_type": r.event_type,
            "action_type": r.action_type,
            "active": r.active,
            "created_at": r.created_at,
        } for r in rules]
        return Response(data)
        
    elif request.method == "POST":
        repo_id = request.data.get("repository_id")
        event_type = request.data.get("event_type")
        action_type = request.data.get("action_type")
        
        if not repo_id or not event_type or not action_type:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            repository = Repository.objects.get(repo_id=repo_id)
        except Repository.DoesNotExist:
            return Response({"error": "Repository not found"}, status=status.HTTP_404_NOT_FOUND)
            
        rule = AutomationRule.objects.create(
            repository=repository,
            event_type=event_type,
            action_type=action_type
        )
        return Response({
            "id": rule.id,
            "repository_id": rule.repository.repo_id,
            "repository_name": rule.repository.name,
            "event_type": rule.event_type,
            "action_type": rule.action_type,
            "active": rule.active,
            "created_at": rule.created_at,
        }, status=status.HTTP_201_CREATED)

@api_view(["DELETE", "PATCH"])
def rule_detail(request, pk):
    try:
        rule = AutomationRule.objects.get(pk=pk)
    except AutomationRule.DoesNotExist:
        return Response({"error": "Rule not found"}, status=status.HTTP_404_NOT_FOUND)
        
    if request.method == "DELETE":
        rule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    elif request.method == "PATCH":
        rule.active = request.data.get("active", rule.active)
        rule.save()
        return Response({
            "id": rule.id,
            "repository_id": rule.repository.repo_id,
            "repository_name": rule.repository.name,
            "event_type": rule.event_type,
            "action_type": rule.action_type,
            "active": rule.active,
            "created_at": rule.created_at,
        })
