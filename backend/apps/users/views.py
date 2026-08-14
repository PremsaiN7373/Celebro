import random
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, EmailOTP
from .serializers import EmailTokenObtainPairSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — open to anyone, creates a customer or planner."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"


class LoginView(APIView):
    """
    POST /api/v1/auth/login/ — validates email+password.
    If the account has two_factor_enabled, this does NOT return tokens —
    instead it emails a 6-digit code and returns {"requires_2fa": true,
    "user_id": ...}; the frontend then calls Verify2FAView with that code
    to get the actual JWT pair. Accounts without 2FA get tokens directly,
    exactly as before — this is fully backward compatible.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    def post(self, request):
        serializer = EmailTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user

        if user.two_factor_enabled:
            code = f"{random.randint(0, 999999):06d}"
            EmailOTP.objects.create(user=user, code=code)
            send_mail(
                subject="Your Celebro login code",
                message=(
                    f"Your login code is: {code}\n\n"
                    "This code expires in 10 minutes. If you didn't try to "
                    "log in, you can ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            return Response({"requires_2fa": True, "user_id": user.id})

        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)})


class Verify2FAView(APIView):
    """
    POST /api/v1/auth/verify-2fa/
    Body: { "user_id": ..., "code": "123456" }
    Exchanges a valid, unused, unexpired code for the actual JWT pair.
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"

    def post(self, request):
        user_id = request.data.get("user_id")
        code = request.data.get("code")

        otp = (
            EmailOTP.objects.filter(user_id=user_id, code=code, is_used=False)
            .order_by("-created_at")
            .first()
        )
        if not otp or (timezone.now() - otp.created_at).total_seconds() > 600:
            return Response({"detail": "Invalid or expired code."}, status=400)

        otp.is_used = True
        otp.save()

        user = User.objects.get(id=user_id)
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)})


class Toggle2FAView(APIView):
    """POST /api/v1/auth/toggle-2fa/ — turn two-factor auth on/off for yourself."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        user.two_factor_enabled = not user.two_factor_enabled
        user.save()
        return Response({"two_factor_enabled": user.two_factor_enabled})


class MeView(generics.RetrieveAPIView):
    """GET /api/v1/auth/me/ — the logged-in user's own profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
