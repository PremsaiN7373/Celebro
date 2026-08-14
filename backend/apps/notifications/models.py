from django.db import models
from django.conf import settings


class Notification(models.Model):
    class Kind(models.TextChoices):
        BOOKING_REQUESTED = "booking_requested", "Booking Requested"
        BOOKING_ACCEPTED = "booking_accepted", "Booking Accepted"
        BOOKING_REJECTED = "booking_rejected", "Booking Rejected"
        BOOKING_COMPLETED = "booking_completed", "Booking Completed"
        PAYMENT_RECEIVED = "payment_received", "Payment Received"
        NEW_MESSAGE = "new_message", "New Message"
        NEW_REVIEW = "new_review", "New Review"
        EVENT_REMINDER = "event_reminder", "Event Reminder"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    kind = models.CharField(max_length=30, choices=Kind.choices)
    message = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True)  # frontend path to navigate to
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.kind} -> {self.user}"


class FCMDevice(models.Model):
    """A browser/device registered to receive push notifications for a user."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fcm_devices"
    )
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Device for {self.user}"
