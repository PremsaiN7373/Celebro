from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import PlannerProfile, Package, BlockedDate

User = get_user_model()

class PlannerProfileTests(APITestCase):
    def setUp(self):
        # Create planner user and profile
        self.planner_user = User.objects.create_user(
            username="planner1",
            email="planner1@example.com",
            password="Password123!",
            role=User.Role.PLANNER
        )
        self.profile = PlannerProfile.objects.create(
            user=self.planner_user,
            business_name="Elite Decorators",
            category=PlannerProfile.Category.DECORATION,
            city="Coimbatore",
            is_verified=True
        )
        
        # Create standard customer user
        self.customer_user = User.objects.create_user(
            username="customer1",
            email="customer1@example.com",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        
        # Endpoint URLs
        self.me_url = reverse("planner-me")
        self.list_url = reverse("planner-list")
        self.detail_url = reverse("planner-detail", args=[self.profile.id])

    def test_get_own_planner_profile(self):
        self.client.force_authenticate(user=self.planner_user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["business_name"], "Elite Decorators")

    def test_update_own_planner_profile(self):
        self.client.force_authenticate(user=self.planner_user)
        data = {
            "business_name": "Elite Event Styling",
            "category": PlannerProfile.Category.DECORATION,
            "city": "Chennai",
            "experience_years": 5
        }
        response = self.client.put(self.me_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.business_name, "Elite Event Styling")
        self.assertEqual(self.profile.city, "Chennai")

    def test_marketplace_listing_filters(self):
        # Create another planner profile in Chennai
        planner2_user = User.objects.create_user(
            username="planner2",
            email="planner2@example.com",
            password="Password123!",
            role=User.Role.PLANNER
        )
        PlannerProfile.objects.create(
            user=planner2_user,
            business_name="Chennai Planners",
            category=PlannerProfile.Category.PHOTOGRAPHY,
            city="Chennai",
            is_verified=True
        )

        self.client.force_authenticate(user=self.customer_user)
        
        # Test filtering by city = "Coimbatore"
        response = self.client.get(self.list_url, {"city": "Coimbatore"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["business_name"], "Elite Decorators")


class PackageTests(APITestCase):
    def setUp(self):
        self.planner_user = User.objects.create_user(
            username="planner1",
            email="planner1@example.com",
            password="Password123!",
            role=User.Role.PLANNER
        )
        self.profile = PlannerProfile.objects.create(
            user=self.planner_user,
            business_name="Elite Decorators",
            category=PlannerProfile.Category.DECORATION,
            city="Coimbatore",
            is_verified=True
        )
        self.package_list_url = reverse("package-list")

    def test_create_package_success(self):
        self.client.force_authenticate(user=self.planner_user)
        data = {
            "title": "Premium Floral Backdrop",
            "description": "Exquisite roses and hydrangeas setting.",
            "price": "12000.00"
        }
        response = self.client.post(self.package_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Package.objects.count(), 1)
        
        package = Package.objects.get()
        self.assertEqual(package.title, "Premium Floral Backdrop")
        self.assertEqual(package.planner, self.profile)

    def test_non_planner_cannot_create_package(self):
        customer = User.objects.create_user(
            username="customer1",
            email="customer1@example.com",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        self.client.force_authenticate(user=customer)
        data = {
            "title": "Unauthorized Package",
            "price": "5000.00"
        }
        response = self.client.post(self.package_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
