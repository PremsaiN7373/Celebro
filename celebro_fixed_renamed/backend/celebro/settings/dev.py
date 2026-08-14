"""Development settings — local machine, DEBUG on, permissive CORS to localhost only."""
from .base import *  # noqa: F401,F403

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Loosen throttling in dev so you're not blocked while testing auth flows.
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["auth"] = "1000/min"

# 'daphne' must be first in INSTALLED_APPS so `manage.py runserver` serves
# over ASGI (with WebSocket support) instead of the plain WSGI dev server.
INSTALLED_APPS = ["daphne"] + INSTALLED_APPS + ["django_extensions"]  # noqa: F405
