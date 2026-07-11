from django.urls import path
from . import views

urlpatterns = [
    path("", views.rule_list, name="rule_list"),
    path("<int:pk>/", views.rule_detail, name="rule_detail"),
]
