from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventPhotoViewSet

router = DefaultRouter()
router.register("photos", EventPhotoViewSet, basename="event-photo")
router.register("", EventViewSet, basename="event")

urlpatterns = router.urls
