from django.urls import path
from .views import (
    AdminUserListView, AdminUserDetailView, AdminToggleUserActiveView,
    AdminPlannerListView, AdminVerifyPlannerView, AdminUnverifyPlannerView,
    AdminToggleFeaturedPlannerView, AdminStatsView,
    AdminDisputeListView, AdminResolveDisputeView, AdminRejectDisputeView,
)

urlpatterns = [
    path("stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("users/<int:pk>/toggle-active/", AdminToggleUserActiveView.as_view(), name="admin-user-toggle"),
    path("planners/", AdminPlannerListView.as_view(), name="admin-planner-list"),
    path("planners/<int:pk>/verify/", AdminVerifyPlannerView.as_view(), name="admin-planner-verify"),
    path("planners/<int:pk>/unverify/", AdminUnverifyPlannerView.as_view(), name="admin-planner-unverify"),
    path("planners/<int:pk>/toggle-featured/", AdminToggleFeaturedPlannerView.as_view(), name="admin-planner-toggle-featured"),
    path("disputes/", AdminDisputeListView.as_view(), name="admin-dispute-list"),
    path("disputes/<int:pk>/resolve/", AdminResolveDisputeView.as_view(), name="admin-dispute-resolve"),
    path("disputes/<int:pk>/reject/", AdminRejectDisputeView.as_view(), name="admin-dispute-reject"),
]
