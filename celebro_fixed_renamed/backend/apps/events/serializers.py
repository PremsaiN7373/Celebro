from rest_framework import serializers
from .models import Event, EventPhoto


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id", "event_type", "name", "description", "date", "time",
            "venue", "budget", "guest_count", "theme", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class EventPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventPhoto
        fields = ["id", "event", "image_url", "caption", "created_at"]
        read_only_fields = ["id", "created_at"]
