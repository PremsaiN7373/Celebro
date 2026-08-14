from django.urls import path
from .views import RegisterView, LoginView, Verify2FAView, Toggle2FAView, MeView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("verify-2fa/", Verify2FAView.as_view(), name="verify-2fa"),
    path("toggle-2fa/", Toggle2FAView.as_view(), name="toggle-2fa"),
    path("me/", MeView.as_view(), name="me"),
]
