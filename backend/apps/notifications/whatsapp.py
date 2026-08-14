"""
Sends a WhatsApp message via Twilio's WhatsApp API — entirely optional.
Silently does nothing if TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN /
TWILIO_WHATSAPP_FROM aren't set in .env, same defensive pattern as the
Razorpay, Cloudinary, and FCM integrations elsewhere in this project.

This is separate from the "click to chat" wa.me links used throughout
the frontend, which need zero setup and always work — this module is
only for messages the *backend* sends on its own (e.g. event reminders).
"""
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def send_whatsapp_message(to_phone: str, message: str) -> bool:
    """
    to_phone should be a plain phone number with country code, e.g.
    "+919876543210" — this function adds the "whatsapp:" prefix Twilio
    expects. Returns True if a send was attempted successfully, False
    if skipped (not configured) or it failed.
    """
    if not (settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_WHATSAPP_FROM):
        return False  # not configured — no-op, same as an unconfigured Razorpay/Cloudinary

    if not to_phone:
        return False

    try:
        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{to_phone}",
            body=message,
        )
        return True
    except Exception:
        # WhatsApp sending is a nice-to-have — never let it break the
        # actual action (e.g. a reminder) that triggered it.
        logger.warning("WhatsApp send failed for %s", to_phone, exc_info=True)
        return False
