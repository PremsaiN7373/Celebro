from django.db import models
from django.conf import settings


class Event(models.Model):
    class EventType(models.TextChoices):
        BIRTHDAY = "birthday", "Birthday Party"
        SURPRISE_BIRTHDAY = "surprise_birthday", "Surprise Birthday"
        ANNIVERSARY = "anniversary", "Anniversary"
        BABY_SHOWER = "baby_shower", "Baby Shower"
        PROPOSAL = "proposal", "Proposal"
        HOUSEWARMING = "housewarming", "Housewarming"
        GRADUATION = "graduation", "Graduation Party"
        FAREWELL = "farewell", "Farewell Party"
        FAMILY_GATHERING = "family_gathering", "Family Gathering"
        CORPORATE_PARTY = "corporate_party", "Corporate Party"
        PRODUCT_LAUNCH = "product_launch", "Product Launch"
        TEAM_CELEBRATION = "team_celebration", "Team Celebration"
        OFFICE_ANNIVERSARY = "office_anniversary", "Office Anniversary"
        EMPLOYEE_APPRECIATION = "employee_appreciation", "Employee Appreciation"
        NETWORKING = "networking", "Networking Event"
        CUSTOM = "custom", "Custom Celebration"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="events"
    )
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    venue = models.CharField(max_length=255, blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    guest_count = models.PositiveIntegerField(default=0)
    theme = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_event_type_display()})"


class EventPhoto(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="photos")
    image_url = models.URLField()
    caption = models.CharField(max_length=200, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="uploaded_photos"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Photo for {self.event.name}"
