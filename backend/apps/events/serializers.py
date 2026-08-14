from rest_framework import serializers
from .models import Event, EventPhoto, EventCollaborator, EventTemplate


class EventSerializer(serializers.ModelSerializer):
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            "id", "event_type", "name", "description", "date", "time",
            "venue", "budget", "guest_count", "theme", "notes",
            "is_owner", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_owner", "created_at", "updated_at"]

    def get_is_owner(self, obj):
        request = self.context.get("request")
        return bool(request and obj.customer_id == request.user.id)


class EventPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventPhoto
        fields = ["id", "event", "image_url", "caption", "created_at"]
        read_only_fields = ["id", "created_at"]


class EventCollaboratorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = EventCollaborator
        fields = ["id", "email", "username", "created_at"]
        read_only_fields = fields


class EventTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventTemplate
        fields = ["id", "name", "event_type", "theme", "notes", "budget_categories", "created_at"]
        read_only_fields = ["id", "created_at"]
