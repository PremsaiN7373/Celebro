from django.db import models
from apps.events.models import Event


class Guest(models.Model):
    class RsvpStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        DECLINED = "declined", "Declined"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="guests")
    name = models.CharField(max_length=200)
    contact = models.CharField(max_length=100, blank=True)  # phone or email
    is_vip = models.BooleanField(default=False)
    rsvp_status = models.CharField(
        max_length=20, choices=RsvpStatus.choices, default=RsvpStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.event.name})"
