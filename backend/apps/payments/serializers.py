from rest_framework import serializers
from .models import Payment, PaymentDispute


class PaymentSerializer(serializers.ModelSerializer):
    planner_name = serializers.CharField(source="booking.planner.business_name", read_only=True)
    event_name = serializers.CharField(source="booking.event.name", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "booking", "planner_name", "event_name", "amount", "razorpay_order_id",
            "razorpay_payment_id", "status", "created_at",
        ]
        read_only_fields = fields


class PaymentDisputeSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source="payment.booking.event.name", read_only=True)
    planner_name = serializers.CharField(source="payment.booking.planner.business_name", read_only=True)
    amount = serializers.DecimalField(source="payment.amount", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = PaymentDispute
        fields = [
            "id", "payment", "event_name", "planner_name", "amount",
            "reason", "status", "admin_notes", "created_at", "resolved_at",
        ]
        read_only_fields = ["id", "status", "admin_notes", "created_at", "resolved_at"]
