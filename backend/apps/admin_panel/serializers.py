from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.planners.models import PlannerProfile
from apps.bookings.models import Booking

User = get_user_model()


class AdminBookingSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="event.name", read_only=True)
    event_date = serializers.DateField(source="event.date", read_only=True)
    event_time = serializers.TimeField(source="event.time", read_only=True)
    event_venue = serializers.CharField(source="event.venue", read_only=True)
    event_budget = serializers.DecimalField(source="event.budget", max_digits=10, decimal_places=2, read_only=True)
    event_guests = serializers.IntegerField(source="event.guest_count", read_only=True)
    event_theme = serializers.CharField(source="event.theme", read_only=True)
    event_description = serializers.CharField(source="event.description", read_only=True)
    planner_name = serializers.CharField(source="planner.business_name", read_only=True)
    customer_name = serializers.CharField(source="event.customer.username", read_only=True)
    package_title = serializers.CharField(source="package.title", default="—", read_only=True)
    package_description = serializers.CharField(source="package.description", default="—", read_only=True)
    package_price = serializers.DecimalField(source="package.price", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "event_name", "event_date", "event_time", "event_venue",
            "event_budget", "event_guests", "event_theme", "event_description",
            "planner_name", "customer_name", "package_title", "package_description",
            "package_price", "status", "advance_paid"
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    bookings = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "role", "is_active", "date_joined",
            "phone_number", "two_factor_enabled", "referral_code", "bookings"
        ]
        read_only_fields = [
            "id", "date_joined",
            "two_factor_enabled", "referral_code", "bookings"
        ]

    def get_bookings(self, obj):
        if obj.role == "planner":
            try:
                profile = obj.planner_profile
                queryset = Booking.objects.filter(planner=profile).select_related("event", "planner", "package")
            except:
                return []
        else:
            queryset = Booking.objects.filter(event__customer=obj).select_related("event", "planner", "package")
        
        return AdminBookingSerializer(queryset, many=True).data


class AdminPlannerSerializer(serializers.ModelSerializer):
    owner_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = PlannerProfile
        fields = [
            "id", "business_name", "category", "city", "owner_email",
            "is_verified", "is_featured", "created_at",
        ]
        read_only_fields = ["id", "business_name", "category", "city", "owner_email", "created_at"]
