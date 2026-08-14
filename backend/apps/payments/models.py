from decimal import Decimal
from django.db import models
from apps.bookings.models import Booking

# Platform's cut of every advance payment — a simple flat rate for now.
# In a real system this might vary by planner subscription tier or
# category; kept as one constant here since that's out of scope today.
PLATFORM_COMMISSION_RATE = Decimal("0.10")  # 10%


class Payment(models.Model):
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_commission_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        help_text="Celebro's cut of this payment, computed when it's marked paid.",
    )
    razorpay_order_id = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CREATED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.id} for booking {self.booking_id} ({self.status})"


class PaymentDispute(models.Model):
    """A customer's refund/issue report on a payment, for admin review."""
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        RESOLVED = "resolved", "Resolved (refunded)"
        REJECTED = "rejected", "Rejected"

    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name="disputes")
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Dispute on payment {self.payment_id} ({self.status})"
