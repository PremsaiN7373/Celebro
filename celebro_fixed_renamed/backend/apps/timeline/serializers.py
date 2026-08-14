from rest_framework import serializers
from .models import TimelineItem


class TimelineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineItem
        fields = ["id", "event", "label", "scheduled_at", "status", "order", "created_at"]
        read_only_fields = ["id", "created_at"]
