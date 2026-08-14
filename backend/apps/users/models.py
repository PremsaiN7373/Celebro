from django.contrib.auth.models import AbstractUser
from django.db import models
import secrets


def generate_referral_code():
    return secrets.token_hex(4).upper()  # e.g. "A1B2C3D4"


class User(AbstractUser):
    """
    Custom user model so 'role' is a first-class field from day one —
    swapping this in later would require a painful migration.
    """
    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        PLANNER = "planner", "Planner"
        ADMIN = "admin", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    phone_number = models.CharField(max_length=20, blank=True)
    two_factor_enabled = models.BooleanField(default=False)
    referral_code = models.CharField(
        max_length=20, unique=True, default=generate_referral_code, editable=False
    )
    referred_by = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="referrals"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} ({self.role})"


class EmailOTP(models.Model):
    """A one-time login code emailed to a user with two_factor_enabled=True."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otp_codes")
    code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP for {self.user}"
