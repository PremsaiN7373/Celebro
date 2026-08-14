"""
Small helper other apps import to create a notification without needing
to know about the Notification model directly. Also fires a push
notification via Firebase Cloud Messaging if the user has a registered
device AND FCM_SERVER_KEY is configured in .env — silently does nothing
otherwise, same defensive pattern as the Razorpay/Cloudinary integrations.
"""
import logging
from django.conf import settings
from .models import Notification, FCMDevice

logger = logging.getLogger(__name__)


def notify(user, kind, message, link=""):
    Notification.objects.create(user=user, kind=kind, message=message, link=link)
    _send_push(user, message)


def _send_push(user, message):
    if not settings.FCM_SERVER_KEY:
        return  # not configured — no-op, same as an unconfigured Razorpay/Cloudinary

    tokens = list(FCMDevice.objects.filter(user=user).values_list("token", flat=True))
    if not tokens:
        return

    try:
        import requests

        requests.post(
            "https://fcm.googleapis.com/fcm/send",
            headers={
                "Authorization": f"key={settings.FCM_SERVER_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "registration_ids": tokens,
                "notification": {"title": "Celebro", "body": message},
            },
            timeout=5,
        )
    except Exception:
        # Push notifications are a nice-to-have — never let a failed FCM
        # call break the actual action that triggered this notification.
        logger.warning("FCM push failed for user %s", user.id, exc_info=True)
