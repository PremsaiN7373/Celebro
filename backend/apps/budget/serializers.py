from rest_framework import serializers
from .models import BudgetItem


class BudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetItem
        fields = ["id", "event", "category", "planned_amount", "actual_amount", "created_at"]
        read_only_fields = ["id", "created_at"]
