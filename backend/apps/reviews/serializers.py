from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    planner_name = serializers.CharField(source="booking.planner.business_name", read_only=True)
    customer_name = serializers.CharField(source="customer.username", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id", "booking", "planner_name", "customer_name",
            "rating", "comment", "created_at",
        ]
        read_only_fields = ["id", "customer_name", "planner_name", "created_at"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_booking(self, booking):
        request = self.context["request"]
        if booking.event.customer != request.user:
            raise serializers.ValidationError("You can only review your own bookings.")
        if booking.status != "completed":
            raise serializers.ValidationError("You can only review completed bookings.")
        return booking
