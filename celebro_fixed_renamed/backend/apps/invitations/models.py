import uuid
from django.db import models
from apps.events.models import Event
from apps.guests.models import Guest


class Invitation(models.Model):
    """
    One invitation per event — a shareable public link + QR code that
    guests can open to see event details and RSVP without needing an
    account. The uuid in the URL is the access token.
    """
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name="invitation")
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    custom_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invitation for {self.event.name}"


class InvitationSend(models.Model):
    """Tracks whether/when a specific guest's invite was sent, for the sent/opened log."""
    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        WHATSAPP = "whatsapp", "WhatsApp"
        LINK = "link", "Shared Link"

    invitation = models.ForeignKey(Invitation, on_delete=models.CASCADE, related_name="sends")
    guest = models.ForeignKey(Guest, on_delete=models.CASCADE, related_name="invitation_sends")
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.LINK)
    sent_at = models.DateTimeField(auto_now_add=True)
    opened_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.guest.name} via {self.channel}"
