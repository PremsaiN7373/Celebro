from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.planners.models import PlannerProfile

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "is_active", "date_joined"]
        read_only_fields = ["id", "username", "email", "role", "date_joined"]


class AdminPlannerSerializer(serializers.ModelSerializer):
    owner_email = serializers.CharField(source="user.email", read_only=True)

    class Meta:
        model = PlannerProfile
        fields = [
            "id", "business_name", "category", "city", "owner_email",
            "is_verified", "is_featured", "created_at",
        ]
        read_only_fields = ["id", "business_name", "category", "city", "owner_email", "created_at"]
