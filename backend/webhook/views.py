from rest_framework.decorators import api_view
from rest_framework.response import Response
from notifications.models import Notification


@api_view(["POST"])
def github_webhook(request):

    # Get event type from GitHub header
    event = request.headers.get("X-GitHub-Event")

    # Get full payload
    payload = request.data

    # Extract repository name
    repository = payload.get(
        "repository",
        {}
    ).get(
        "full_name",
        "Unknown Repository"
    )

    # Create message
    message = f"{event} event occurred in {repository}"

    # Process actions based on rules
    from github_bot.models import Repository
    from rules.models import AutomationRule
    
    try:
        db_repo = Repository.objects.get(full_name=repository)
        rules = AutomationRule.objects.filter(repository=db_repo, event_type=event, active=True)
        
        if rules.exists():
            for rule in rules:
                if rule.action_type == "notification":
                    Notification.objects.create(
                        event_type=event,
                        repository=repository,
                        message=f"Rule Action ({rule.get_action_type_display()}): {message}"
                    )
                elif rule.action_type == "log":
                    # For log rule, we can create a system log notification or log to stdout
                    print(f"RULE LOG TRIGGERED: {message}")
                    Notification.objects.create(
                        event_type=event,
                        repository=repository,
                        message=f"Rule Logged: {message}"
                    )
        else:
            # Fallback default notification if no rules exist
            Notification.objects.create(
                event_type=event,
                repository=repository,
                message=message
            )
    except Repository.DoesNotExist:
        # Fallback default notification if repository not tracked
        Notification.objects.create(
            event_type=event,
            repository=repository,
            message=message
        )

    print("===================================")
    print(message)
    print("===================================")

    return Response({
        "status": "success"
    })