from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class EmailTokenObtainPairSerializer(serializers.Serializer):
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

        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "email", "username", "password", "role", "phone_number"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "role", "phone_number", "created_at"]
        read_only_fields = fields
