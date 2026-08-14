"""Production settings — DEBUG off, strict allowed hosts, HTTPS/security headers on."""
from .base import *  # noqa: F401,F403

DEBUG = False

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=[])  # noqa: F405

# Security hardening (safe defaults behind a reverse proxy terminating TLS)
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Tighter throttle in prod
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]["auth"] = "10/min"  # noqa: F405
