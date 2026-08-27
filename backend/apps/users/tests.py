from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, EmailOTP

class UserRegistrationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("register")

    def test_customer_registration_success(self):
        data = {
            "username": "testcustomer",
            "email": "customer@example.com",
            "password": "SecurePassword123!",
            "role": "customer",
            "phone_number": "1234567890"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        
        user = User.objects.get()
        self.assertEqual(user.username, "testcustomer")
        self.assertEqual(user.role, User.Role.CUSTOMER)
        self.assertFalse(user.two_factor_enabled)

    def test_planner_registration_success(self):
        data = {
            "username": "testplanner",
            "email": "planner@example.com",
            "password": "SecurePassword123!",
            "role": "planner"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        user = User.objects.get()
        self.assertEqual(user.username, "testplanner")
        self.assertEqual(user.role, User.Role.PLANNER)

    def test_registration_duplicate_username_fails(self):
        User.objects.create_user(
            username="existinguser",
            email="existing@example.com",
            password="Password123!"
        )
        data = {
            "username": "existinguser",
            "email": "new@example.com",
            "password": "SecurePassword123!",
            "role": "customer"
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)


class UserLoginTests(APITestCase):
    def setUp(self):
        self.login_url = reverse("login")
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="CorrectPassword123!"
        )

    def test_login_success_without_2fa(self):
        data = {
            "email": "testuser@example.com",
            "password": "CorrectPassword123!"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertNotIn("requires_2fa", response.data)

    def test_login_incorrect_password_fails(self):
        data = {
            "email": "testuser@example.com",
            "password": "WrongPassword!"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TwoFactorAuthenticationTests(APITestCase):
    def setUp(self):
        self.login_url = reverse("login")
        self.verify_2fa_url = reverse("verify-2fa")
        self.toggle_2fa_url = reverse("toggle-2fa")
        
        self.user = User.objects.create_user(
            username="2fauser",
            email="2fauser@example.com",
            password="Password123!",
            two_factor_enabled=True
        )

    def test_login_with_2fa_enabled_requires_verification(self):
        data = {
            "email": "2fauser@example.com",
            "password": "Password123!"
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("requires_2fa"))
        self.assertEqual(response.data.get("user_id"), self.user.id)
        
        # Verify an OTP code was generated in the database
        self.assertEqual(EmailOTP.objects.filter(user=self.user).count(), 1)

    def test_verify_2fa_success(self):
        # Create a mock OTP code
        otp = EmailOTP.objects.create(user=self.user, code="999999")
        
        data = {
            "user_id": self.user.id,
            "code": "999999"
        }
        response = self.client.post(self.verify_2fa_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        
        # Verify the OTP is now marked as used
        otp.refresh_from_db()
        self.assertTrue(otp.is_used)

    def test_verify_2fa_invalid_code_fails(self):
        EmailOTP.objects.create(user=self.user, code="999999")
        
        data = {
            "user_id": self.user.id,
            "code": "111111"  # Wrong code
        }
        response = self.client.post(self.verify_2fa_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get("detail"), "Invalid or expired code.")

    def test_toggle_2fa_endpoint(self):
        # Log in first to get an authentication token
        login_data = {
            "email": "2fauser@example.com",
            "password": "Password123!"
        }
        # Disable 2FA so we can log in directly in test
        self.user.two_factor_enabled = False
        self.user.save()
        
        login_response = self.client.post(self.login_url, login_data)
        token = login_response.data["access"]
        
        # Set JWT authentication header
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        # Call toggle 2FA endpoint (turns 2FA back on)
        response = self.client.post(self.toggle_2fa_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("two_factor_enabled"))
        
        self.user.refresh_from_db()
        self.assertTrue(self.user.two_factor_enabled)
        
        # Call toggle 2FA endpoint again (turns 2FA off)
        response = self.client.post(self.toggle_2fa_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data.get("two_factor_enabled"))
        
        self.user.refresh_from_db()
        self.assertFalse(self.user.two_factor_enabled)
