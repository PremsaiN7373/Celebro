from rest_framework.routers import DefaultRouter
from .views import TimelineItemViewSet

router = DefaultRouter()
router.register("", TimelineItemViewSet, basename="timeline-item")

urlpatterns = router.urls
