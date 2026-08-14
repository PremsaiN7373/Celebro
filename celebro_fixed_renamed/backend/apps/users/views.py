from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import EmailTokenObtainPairSerializer, RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/ — open to anyone, creates a customer or planner."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "auth"


class LoginView(TokenObtainPairView):
    """POST /api/v1/auth/login/ — returns access + refresh JWT pair."""
    serializer_class = EmailTokenObtainPairSerializer
    throttle_scope = "auth"


class MeView(generics.RetrieveAPIView):
    """GET /api/v1/auth/me/ — the logged-in user's own profile."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
