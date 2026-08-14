from rest_framework import serializers
from .models import Invitation, InvitationSend


class InvitationSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.name", read_only=True)

    class Meta:
        model = Invitation
        fields = ["id", "event", "event_name", "uuid", "custom_message", "created_at"]
        read_only_fields = ["id", "event_name", "uuid", "created_at"]


class PublicEventSerializer(serializers.Serializer):
    """What an anonymous guest sees when opening an invite link — no sensitive fields."""
    name = serializers.CharField()
    event_type = serializers.CharField()
    date = serializers.DateField()
    time = serializers.TimeField(allow_null=True)
    venue = serializers.CharField()
    theme = serializers.CharField()
    custom_message = serializers.CharField()


class RsvpSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    contact = serializers.CharField(max_length=100, required=False, allow_blank=True)
    rsvp_status = serializers.ChoiceField(choices=["confirmed", "declined"])
