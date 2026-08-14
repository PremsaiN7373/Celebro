from django.db import models
from apps.events.models import Event


class TimelineItem(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        DONE = "done", "Done"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="timeline_items")
    label = models.CharField(max_length=200)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "scheduled_at"]

    def __str__(self):
        return f"{self.label} ({self.event.name})"
