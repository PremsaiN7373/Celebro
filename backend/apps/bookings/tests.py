from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.events.models import Event
from apps.planners.models import PlannerProfile, Package
from .models import Booking

User = get_user_model()

class BookingTests(APITestCase):
    def setUp(self):
        # Create a customer user
        self.customer = User.objects.create_user(
            username="customer",
            email="customer@example.com",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        
        # Create an event owned by this customer
        self.event = Event.objects.create(
            customer=self.customer,
            event_type=Event.EventType.BIRTHDAY,
            name="My Birthday Bash",
            date="2026-09-01"
        )
        
        # Create a planner user and profile
        self.planner_user = User.objects.create_user(
            username="planner",
            email="planner@example.com",
            password="Password123!",
            role=User.Role.PLANNER
        )
        self.planner_profile = PlannerProfile.objects.create(
            user=self.planner_user,
            business_name="Elite Decors",
            category=PlannerProfile.Category.DECORATION,
            city="Coimbatore",
            is_verified=True
        )
        
        # Create a service package
        self.package = Package.objects.create(
            planner=self.planner_profile,
            title="Basic Balloons",
            price="5000.00"
        )
        
        # Create another customer user (unauthorized)
        self.other_customer = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        
        # Booking List/Create URL
        self.list_url = reverse("booking-list")

    def test_customer_request_booking_success(self):
        self.client.force_authenticate(user=self.customer)
        data = {
            "event": self.event.id,
            "planner": self.planner_profile.id,
            "package": self.package.id,
            "advance_paid": "1000.00"
        }
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)
        
        booking = Booking.objects.get()
        self.assertEqual(booking.status, Booking.Status.REQUESTED)
        self.assertEqual(booking.event, self.event)
        self.assertEqual(booking.planner, self.planner_profile)

    def test_request_booking_unauthorized_event_fails(self):
        self.client.force_authenticate(user=self.other_customer)
        data = {
            "event": self.event.id, # Belongs to self.customer, not other_customer
            "planner": self.planner_profile.id,
            "package": self.package.id
        }
        response = self.client.post(self.list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Booking.objects.count(), 0)

    def test_planner_accept_booking_success(self):
        # Create a pending booking request
        booking = Booking.objects.create(
            event=self.event,
            planner=self.planner_profile,
            package=self.package,
            status=Booking.Status.REQUESTED
        )
        accept_url = reverse("booking-accept", args=[booking.id])
        
        # Authenticate as the assigned planner
        self.client.force_authenticate(user=self.planner_user)
        response = self.client.post(accept_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.ACCEPTED)

    def test_unauthorized_planner_cannot_accept_booking(self):
        # Create another planner user and profile
        other_planner_user = User.objects.create_user(
            username="other_planner",
            email="other_p@example.com",
            password="Password123!",
            role=User.Role.PLANNER
        )
        other_planner_profile = PlannerProfile.objects.create(
            user=other_planner_user,
            business_name="Other Decors",
            category=PlannerProfile.Category.LIGHTING,
            city="Coimbatore",
            is_verified=True
        )
        
        # Create a booking request sent to self.planner_profile
        booking = Booking.objects.create(
            event=self.event,
            planner=self.planner_profile,
            package=self.package,
            status=Booking.Status.REQUESTED
        )
        accept_url = reverse("booking-accept", args=[booking.id])
        
        # Authenticate as the other planner
        self.client.force_authenticate(user=other_planner_user)
        response = self.client.post(accept_url)
        # Should return 404 Not Found since it's not in their queryset
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.Status.REQUESTED)
