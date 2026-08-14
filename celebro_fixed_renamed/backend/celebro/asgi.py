"""
ASGI config for Celebro.
Used by Daphne/Uvicorn to serve both HTTP and WebSocket (chat, live booking
status) traffic through Django Channels.
"""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "celebro.settings.prod")

# Must be imported after Django app loading is set up.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from apps.chat.routing import websocket_urlpatterns  # noqa: E402
from .jwt_ws_auth import JWTAuthMiddleware  # noqa: E402

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})
