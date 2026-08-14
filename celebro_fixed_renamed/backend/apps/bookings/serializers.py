from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    planner_name = serializers.CharField(source="planner.business_name", read_only=True)
    package_title = serializers.CharField(source="package.title", read_only=True)
    event_name = serializers.CharField(source="event.name", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "event", "event_name", "planner", "planner_name",
            "package", "package_title", "status", "advance_paid",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "advance_paid", "created_at", "updated_at"]
