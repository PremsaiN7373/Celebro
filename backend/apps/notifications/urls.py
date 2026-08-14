from django.urls import path
from .views import (
    NotificationListView, MarkNotificationReadView, MarkAllNotificationsReadView,
    RegisterDeviceView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("read-all/", MarkAllNotificationsReadView.as_view(), name="notifications-read-all"),
    path("register-device/", RegisterDeviceView.as_view(), name="notification-register-device"),
    path("<int:pk>/read/", MarkNotificationReadView.as_view(), name="notification-read"),
]
