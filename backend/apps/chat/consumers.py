"""
Chat WebSocket consumer. Connects to ws/chat/<booking_id>/, persists
each message to the database, then broadcasts it to everyone in that
booking's room group so both parties see it live. Also creates a
notification for the recipient (whoever didn't send the message).
"""
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage
from .serializers import ChatMessageSerializer


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.booking_id = self.scope["url_route"]["kwargs"]["booking_id"]
        self.room_group_name = f"chat_{self.booking_id}"
        user = self.scope.get("user")

        if not user or not user.is_authenticated:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content):
        user = self.scope["user"]
        text = content.get("content", "").strip()
        if not text:
            return

        message = await self._save_message(user, text)
        await self._notify_recipient(user)

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat.message", "message": message},
        )

    async def chat_message(self, event):
        await self.send_json(event["message"])

    @database_sync_to_async
    def _save_message(self, user, text):
        msg = ChatMessage.objects.create(
            booking_id=self.booking_id, sender=user, content=text
        )
        return ChatMessageSerializer(msg).data

    @database_sync_to_async
    def _notify_recipient(self, sender):
        from apps.bookings.models import Booking
        from apps.notifications.services import notify

        booking = Booking.objects.select_related("event", "planner__user").get(id=self.booking_id)
        recipient = booking.planner.user if sender == booking.event.customer else booking.event.customer
        notify(
            recipient,
            "new_message",
            f"New message about {booking.event.name}",
            link=f"/chat/{self.booking_id}",
        )
