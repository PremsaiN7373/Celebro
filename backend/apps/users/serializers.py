from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import AuthenticationFailed

User = get_user_model()


class EmailTokenObtainPairSerializer(serializers.Serializer):
    """
    Validates email+password and exposes the matched user as `self.user`
    for the view to decide what happens next (issue tokens directly, or
    require a 2FA code first) — doesn't issue tokens itself, unlike a
    plain SimpleJWT serializer, since that decision now depends on the
    user's two_factor_enabled flag.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    default_error_messages = {
        "no_active_account": "No active account found with the given credentials",
    }

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = None
        if email and password:
            user = User.objects.filter(email__iexact=email).first()
            if user and not user.check_password(password):
                user = None

        if user is None or not user.is_active:
            raise AuthenticationFailed(self.error_messages["no_active_account"])

        self.user = user
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    referral_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "email", "username", "password", "role", "phone_number", "referral_code"]

    def create(self, validated_data):
        referral_code = validated_data.pop("referral_code", "").strip()
        referred_by = None
        if referral_code:
            referred_by = User.objects.filter(referral_code__iexact=referral_code).first()
        user = User.objects.create_user(**validated_data)
        if referred_by:
            user.referred_by = referred_by
            user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    referral_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "role", "phone_number",
            "two_factor_enabled", "referral_code", "referral_count", "created_at",
        ]
        read_only_fields = [
            "id", "email", "username", "role", "phone_number",
            "two_factor_enabled", "referral_code", "referral_count", "created_at",
        ]

    def get_referral_count(self, obj):
        return obj.referrals.count()
