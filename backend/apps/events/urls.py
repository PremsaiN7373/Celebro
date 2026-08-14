from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventPhotoViewSet, EventTemplateViewSet

router = DefaultRouter()
router.register("photos", EventPhotoViewSet, basename="event-photo")
router.register("templates", EventTemplateViewSet, basename="event-template")
router.register("", EventViewSet, basename="event")

urlpatterns = router.urls
