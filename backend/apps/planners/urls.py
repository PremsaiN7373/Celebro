from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    PlannerProfileViewSet, PackageViewSet, MyPlannerProfileView,
    SavedPlannersListView, BlockedDateViewSet, PortfolioPhotoViewSet,
    ImageUploadView,
)

router = DefaultRouter()
router.register("packages", PackageViewSet, basename="package")
router.register("blocked-dates", BlockedDateViewSet, basename="blocked-date")
router.register("portfolio", PortfolioPhotoViewSet, basename="portfolio-photo")
router.register("", PlannerProfileViewSet, basename="planner")

urlpatterns = [
    path("me/", MyPlannerProfileView.as_view(), name="planner-me"),
    path("saved/", SavedPlannersListView.as_view(), name="planner-saved"),
    path("upload-image/", ImageUploadView.as_view(), name="planner-upload-image"),
] + router.urls
