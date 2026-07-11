from django.urls import path
from .views import repositories
from accounts.views import connect_repository

urlpatterns = [
    path(
        "repositories/",
        repositories
    ),
    path(
        "connect/",
        connect_repository
    ),
]