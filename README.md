# Celebro — Phase 0 Setup

Stack: React (Vite) + Django (DRF) + PostgreSQL.

## 1. Install and start PostgreSQL + Redis locally
Install Postgres and Redis directly (via your OS package manager or installer),
create a database/user matching your `.env`, and make sure both services are running.

## 2. Backend setup
```
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements/dev.txt
cp .env.example .env            # then edit values if needed
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
API now runs at http://localhost:8000
Uses `celebro.settings.dev` by default (set in manage.py).

## 3. Frontend setup
```
cd frontend
npm install
npm run dev
```
App now runs at http://localhost:5173 and proxies `/api` calls to Django (see vite.config.ts).

## 4. Confirm the wire-up
- Visit http://localhost:5173/login
- POST to http://localhost:8000/api/v1/auth/register/ (e.g. via curl or Postman) to create a user
- Log in through the React form — on success it stores the JWT pair and redirects to /dashboard
- http://localhost:8000/admin/ — Django admin, log in with the superuser you created

## What's wired in Phase 0
- Django project with `celebro/settings/{base,dev,prod}.py` split
- PostgreSQL connection via env vars (`.env`)
- CORS restricted to `http://localhost:5173` in dev
- DRF + SimpleJWT configured, `users` app has working register/login/me endpoints
- React app scaffolded with Redux Toolkit, TanStack Query, React Router, Tailwind
- Router wired: `/login` → `/dashboard` (protected) → nav to Marketplace/Bookings/Guests/Chat/Payments/Admin (all placeholder pages, ready for their real phase)
- Axios client with JWT attach + silent-refresh-on-401 interceptor

## Not yet built (later phases)
All other apps (`planners`, `events`, `bookings`, etc.) have empty `models.py`/`views.py`
and a stub `urls.py` so the project runs, but no real endpoints yet — that's Phase 2 onward.
