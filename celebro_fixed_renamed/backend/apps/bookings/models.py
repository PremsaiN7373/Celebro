from django.db import models
from apps.events.models import Event
from apps.planners.models import PlannerProfile, Package


class Booking(models.Model):
    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="bookings")
    planner = models.ForeignKey(PlannerProfile, on_delete=models.CASCADE, related_name="bookings")
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, related_name="bookings")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    advance_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.event.name} x {self.planner.business_name} ({self.status})"
