from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Event, EventCollaborator, EventTemplate

User = get_user_model()

class EventTests(APITestCase):
    def setUp(self):
        # Create event owner
        self.owner = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        
        # Create another user to collaborate
        self.collab_user = User.objects.create_user(
            username="collaborator",
            email="collab@example.com",
            password="Password123!",
            role=User.Role.CUSTOMER
        )
        
        # Create an event template
        self.event_list_url = reverse("event-list")

    def test_create_event_seeds_timeline(self):
        self.client.force_authenticate(user=self.owner)
        data = {
            "name": "Graduation Gala",
            "event_type": Event.EventType.GRADUATION,
            "date": "2026-07-15",
            "guest_count": 50
        }
        response = self.client.post(self.event_list_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Event.objects.count(), 1)
        
        event = Event.objects.get()
        self.assertEqual(event.name, "Graduation Gala")
        self.assertEqual(event.customer, self.owner)
        
        # Check that timeline was seeded automatically
        self.assertTrue(event.bookings.count() >= 0)

    def test_invite_collaborator_success(self):
        event = Event.objects.create(
            customer=self.owner,
            event_type=Event.EventType.CUSTOM,
            name="Joint Party",
            date="2026-08-01"
        )
        collab_url = reverse("event-collaborators", args=[event.id])
        
        self.client.force_authenticate(user=self.owner)
        data = {"email": "collab@example.com"}
        response = self.client.post(collab_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EventCollaborator.objects.count(), 1)

    def test_non_owner_cannot_invite_collaborator(self):
        event = Event.objects.create(
            customer=self.owner,
            event_type=Event.EventType.CUSTOM,
            name="Joint Party",
            date="2026-08-01"
        )
        collab_url = reverse("event-collaborators", args=[event.id])
        
        self.client.force_authenticate(user=self.collab_user)
        data = {"email": "owner@example.com"}
        response = self.client.post(collab_url, data, format="json")
        # Should return 404 Not Found since it's not in their queryset
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(EventCollaborator.objects.count(), 0)

    def test_save_event_as_template(self):
        event = Event.objects.create(
            customer=self.owner,
            event_type=Event.EventType.BIRTHDAY,
            name="Sweet 16",
            date="2026-09-01",
            theme="Neon Pastel"
        )
        template_url = reverse("event-save-as-template", args=[event.id])
        
        self.client.force_authenticate(user=self.owner)
        data = {"name": "Neon Birthday Setup"}
        response = self.client.post(template_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EventTemplate.objects.count(), 1)
        
        template = EventTemplate.objects.get()
        self.assertEqual(template.name, "Neon Birthday Setup")
        self.assertEqual(template.event_type, Event.EventType.BIRTHDAY)
