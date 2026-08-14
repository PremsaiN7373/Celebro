from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Notification, FCMDevice
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    """GET /api/v1/notifications/ — the logged-in user's notifications, newest first."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Notification.objects.filter(user=request.user)
        unread_count = qs.filter(read_at__isnull=True).count()
        return Response({
            "results": NotificationSerializer(qs, many=True).data,
            "unread_count": unread_count,
        })


class MarkNotificationReadView(APIView):
    """POST /api/v1/notifications/<id>/read/ — mark one notification as read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk, user=request.user)
        if not notif.read_at:
            notif.read_at = timezone.now()
            notif.save()
        return Response(NotificationSerializer(notif).data)


class MarkAllNotificationsReadView(APIView):
    """POST /api/v1/notifications/read-all/ — mark all of the user's notifications read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, read_at__isnull=True).update(
            read_at=timezone.now()
        )
        return Response({"detail": "All notifications marked read."})


class RegisterDeviceView(APIView):
    """
    POST /api/v1/notifications/register-device/
    Body: { "token": "<fcm registration token>" }
    Saves (or re-links, if another user previously registered the same
    browser) a device token so push notifications can be sent to it.
    Safe to call even if FCM isn't configured server-side — the token is
    just stored for whenever it is.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"detail": "Token is required."}, status=400)
        FCMDevice.objects.update_or_create(token=token, defaults={"user": request.user})
        return Response({"detail": "Device registered."}, status=201)
