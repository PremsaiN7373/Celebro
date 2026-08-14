from rest_framework import serializers
from .models import PlannerProfile, Package


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ["id", "title", "description", "price", "created_at"]
        read_only_fields = ["id", "created_at"]


class PlannerProfileSerializer(serializers.ModelSerializer):
    packages = PackageSerializer(many=True, read_only=True)

    class Meta:
        model = PlannerProfile
        fields = [
            "id", "business_name", "category", "city", "about",
            "experience_years", "cover_image_url", "logo_url",
            "is_verified", "packages", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "is_verified", "created_at", "updated_at"]
