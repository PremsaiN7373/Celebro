# Deploying Celebro

This covers taking Celebro from your local machine to a real, publicly
reachable deployment. It assumes you already have working local backend +
frontend (see the main README for local setup).

## Before you deploy — checklist

- [ ] Real `DJANGO_SECRET_KEY` — generate one, never reuse the dev placeholder:
      `python -c "import secrets; print(secrets.token_urlsafe(50))"`
- [ ] Real Razorpay keys (if you want payments to work) in `.env`
- [ ] Real Cloudinary URL (if you want photo uploads to work) in `.env`
- [ ] A real PostgreSQL database reachable from your hosting platform (not
      the local one on your laptop)
- [ ] A real Redis instance reachable from your hosting platform (needed
      for both Chat's WebSocket layer and Celery)
- [ ] `DJANGO_ALLOWED_HOSTS` set to your real domain
- [ ] `CORS_ALLOWED_ORIGINS` set to your real frontend URL

## Why Daphne, not Gunicorn alone

Celebro's Chat feature uses Django Channels over WebSockets. A plain WSGI
server (Gunicorn in its default mode) can only serve regular HTTP — it
can't handle the `/ws/chat/...` WebSocket connections. Daphne is an ASGI
server that serves *both* regular HTTP and WebSocket traffic from the same
process, which is why the `Procfile` at the repo root runs Daphne, not
Gunicorn, as the actual web process.

## Option A — Render / Railway (simplest)

Both platforms read a `Procfile` automatically and provision Postgres +
Redis as one-click add-ons.

1. Push this repo to GitHub.
2. Create a new **Web Service** (Render) or **Project** (Railway), point it
   at the repo.
3. Add a **PostgreSQL** database and a **Redis** instance from the
   platform's add-on marketplace — copy the connection details it gives you.
4. Set these environment variables in the platform's dashboard:
   ```
   DJANGO_SETTINGS_MODULE=celebro.settings.prod
   DJANGO_SECRET_KEY=<your generated key>
   DJANGO_ALLOWED_HOSTS=<your-app>.onrender.com   (or your custom domain)
   POSTGRES_DB=<from the add-on>
   POSTGRES_USER=<from the add-on>
   POSTGRES_PASSWORD=<from the add-on>
   POSTGRES_HOST=<from the add-on>
   POSTGRES_PORT=<from the add-on>
   REDIS_URL=<from the add-on>
   CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>
   RAZORPAY_KEY_ID=<optional>
   RAZORPAY_KEY_SECRET=<optional>
   CLOUDINARY_URL=<optional>
   ```
5. Set the **build command**: `pip install -r backend/requirements/prod.txt`
6. The platform will run the `Procfile`'s `web:` line automatically, which
   applies migrations, collects static files, and starts Daphne.
7. For the frontend: deploy `frontend/` separately as a **Static Site**
   (Render) or another service (Railway). Build command: `npm run build`,
   publish directory: `frontend/dist`. Point its API calls at your backend's
   real URL (see "Frontend API URL" below).

## Option B — a plain VPS (DigitalOcean, Linode, etc.)

More manual, more control.

```bash
# On the server, after cloning the repo:
sudo apt update && sudo apt install postgresql redis-server nginx python3-venv

cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements/prod.txt

# Set environment variables (a real .env file, or systemd EnvironmentFile)
export DJANGO_SETTINGS_MODULE=celebro.settings.prod
# ...plus everything else from the checklist above

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# Run Daphne behind Nginx (Nginx handles HTTPS + proxies to Daphne)
daphne -b 127.0.0.1 -p 8001 celebro.asgi:application
```

Then configure Nginx as a reverse proxy in front of Daphne, with a TLS
certificate (Let's Encrypt via `certbot` is the standard free option), and
run Daphne under `systemd` so it restarts automatically and survives
reboots. This part is generic Django/Nginx deployment — not specific to
Celebro — so any standard "Django + Nginx + systemd" guide applies here.

For the frontend, `npm run build` produces static files in `frontend/dist`
— serve those directly via Nginx as well, as a separate `server{}` block or
subdomain.

## Frontend API URL

Right now, `frontend/src/lib/api-client.ts` and the Chat WebSocket
connection both assume the API is reachable via Vite's dev proxy
(`localhost:8000`). In production there's no Vite dev server, so:

1. In `frontend/src/lib/api-client.ts`, change the `baseURL` from
   `/api/v1` to your real backend URL, e.g. `https://api.yourapp.com/api/v1`
   — best done via a Vite environment variable
   (`import.meta.env.VITE_API_URL`) so you don't hardcode it.
2. In `frontend/src/features/chat/ChatPage.tsx`, the WebSocket URL is built
   from `window.location.hostname + ":8000"` — this assumes local dev.
   Update it to point at your real backend's WebSocket URL
   (`wss://api.yourapp.com/ws/chat/...`) the same way.

## Running Celery (only needed for automatic email reminders)

The reminder feature works fine without Celery running at all — you can
just run `python manage.py send_event_reminders` manually or via a cron
job. If you want it fully automatic instead, run a Celery worker + beat
process as an additional service on your platform:
```bash
celery -A celebro worker --loglevel=info
celery -A celebro beat --loglevel=info
```
and add a `CELERY_BEAT_SCHEDULE` entry to `settings/prod.py` (see the
comment in `apps/notifications/tasks.py` for the exact snippet).

## After deploying

- Visit `https://yourdomain.com/admin/` and confirm you can log in
- Set your own account's `role` to `Admin` if this is your first deploy
- Register a test customer + planner account and walk through the full
  loop once (same steps as local testing) to confirm production works
  end to end
