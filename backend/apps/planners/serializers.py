from rest_framework import serializers
from .models import PlannerProfile, Package, SavedPlanner, BlockedDate, PortfolioPhoto


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ["id", "title", "description", "price", "created_at"]
        read_only_fields = ["id", "created_at"]


class PortfolioPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioPhoto
        fields = ["id", "image_url", "caption", "created_at"]
        read_only_fields = ["id", "created_at"]


class PlannerProfileSerializer(serializers.ModelSerializer):
    packages = PackageSerializer(many=True, read_only=True)
    portfolio_photos = PortfolioPhotoSerializer(many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()
    avg_response_hours = serializers.SerializerMethodField()
    whatsapp_number = serializers.CharField(source="user.phone_number", read_only=True)

    class Meta:
        model = PlannerProfile
        fields = [
            "id", "business_name", "category", "city", "about",
            "experience_years", "cover_image_url", "logo_url",
            "is_verified", "is_featured", "subscription_tier",
            "packages", "portfolio_photos", "is_saved", "avg_response_hours",
            "whatsapp_number", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_verified", "is_featured", "subscription_tier", "created_at", "updated_at"]

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return SavedPlanner.objects.filter(user=request.user, planner=obj).exists()

    def get_avg_response_hours(self, obj):
        """
        A rough trust signal: average time between a booking being
        requested and the planner responding (accept or reject), using
        the booking's updated_at as a proxy for "when they responded"
        since we don't track a separate responded_at timestamp.
        """
        from django.db.models import F, DurationField, ExpressionWrapper, Avg

        responded = obj.bookings.exclude(status="requested")
        if not responded.exists():
            return None
        avg_duration = responded.annotate(
            response_time=ExpressionWrapper(
                F("updated_at") - F("created_at"), output_field=DurationField()
            )
        ).aggregate(avg=Avg("response_time"))["avg"]
        if not avg_duration:
            return None
        return round(avg_duration.total_seconds() / 3600, 1)


class SavedPlannerSerializer(serializers.ModelSerializer):
    planner = PlannerProfileSerializer(read_only=True)

    class Meta:
        model = SavedPlanner
        fields = ["id", "planner", "created_at"]
        read_only_fields = fields


class BlockedDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockedDate
        fields = ["id", "date", "reason", "created_at"]
        read_only_fields = ["id", "created_at"]
