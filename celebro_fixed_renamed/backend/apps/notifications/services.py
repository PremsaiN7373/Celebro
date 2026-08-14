"""
Small helper other apps import to create a notification without needing
to know about the Notification model directly.
"""
from .models import Notification


def notify(user, kind, message, link=""):
    Notification.objects.create(user=user, kind=kind, message=message, link=link)
