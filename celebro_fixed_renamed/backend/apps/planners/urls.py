from rest_framework.routers import DefaultRouter
from .views import PlannerProfileViewSet, PackageViewSet

router = DefaultRouter()
router.register("packages", PackageViewSet, basename="package")
router.register("", PlannerProfileViewSet, basename="planner")

urlpatterns = router.urls
