# 🌟 VEGA: Smart Local Service Booking Platform

> **VEGA** connects customers with trusted, nearby local service providers based on real-time location. Built with React 19, Django REST Framework, PostgreSQL/PostGIS, and cloud-native architecture.

[![CI Pipeline](https://github.com/Ashwitha-12-ashu/vega/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashwitha-12-ashu/vega/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB.svg?logo=python)](https://python.org)
[![Django 5.2](https://img.shields.io/badge/Django-5.2-092E20.svg?logo=django)](https://djangoproject.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?logo=vite)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql)](https://postgresql.org)
[![Deployment: Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg?logo=vercel)](https://frontend-ashu-36ce.vercel.app)

---

## 🚀 Key Features

- **Unified Single User Model**: Every user starts as a customer and can easily toggle Provider Mode from their profile. No confusing dual-login systems.
- **Multiple Talents Management**: Providers can configure multiple service offerings (Hair Styling, Makeup, Photography, Electrical, Plumbing, etc.) with custom rates, bio, and experience.
- **Strict One-Active-Talent Rule**: Providers have **exactly ONE active talent at any time**, enforced by atomic database operations.
- **Geospatial Proximity Discovery**: Fast, accurate radius discovery (1km, 2km, 5km, 10km, 20km) using real browser GPS (`navigator.geolocation` with `enableHighAccuracy: true`) and spherical Haversine distance computations.
- **Robust Booking State Machine**: Deterministic transition workflow (`PENDING` ➔ `ACCEPTED` ➔ `ON_THE_WAY` ➔ `ARRIVED` ➔ `IN_PROGRESS` ➔ `RATING_PENDING` ➔ `CLOSED`) with strict role-based authorization.
- **Verified Review & Rating System**: Ratings (1-5 stars) and reviews can only be submitted after completed bookings, updating provider averages atomically.
- **In-App Notifications**: Real-time notification feed for booking requests, status transitions, and customer reviews.
- **Responsive UI/UX**: Clean, modern React interface built with mobile-first principles, toast alerts, skeleton loaders, and interactive maps.

---

## 🏗️ Architecture & Technology Stack

```
Vercel Edge Router
├── /*          ──►  Vite React 19 SPA (frontend/dist)
└── /api/*      ──►  Django 5.2 WSGI (api/index.py)  ──►  PostgreSQL Database
```

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Axios, Lucide Icons, Modern CSS |
| **Backend** | Python 3.11, Django 5.2, Django REST Framework, SimpleJWT |
| **Database** | Managed PostgreSQL (Neon / Supabase / AWS RDS / Render) |
| **Deployment** | Vercel Monorepo Serverless (`vercel.json` + `api/index.py`) |
| **Repository** | GitHub (`Ashwitha-12-ashu/vega`) |

---

## 🌐 Production Deployment Guide (Vercel + PostgreSQL)

### 1. Vercel Monorepo Architecture

The VEGA repository is structured as a full-stack monorepo:
- **Frontend SPA**: Built via `cd frontend && npm install && npm run build` -> output in `frontend/dist`.
- **Backend API**: Dispatched via root `api/index.py` which loads Django WSGI into Vercel Python runtime.
- **Routing**: `vercel.json` maps `/api/(.*)` to `api/index.py` and all client routes `/(.*)` to `/index.html`.

### 2. Required Production Environment Variables

Configure these variables in your **Vercel Project Settings** ➔ **Environment Variables**:

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `DEBUG` | Disables debug mode in production | `False` |
| `SECRET_KEY` | Django cryptographic secret | Secure 64-char random string |
| `DATABASE_URL` | Managed PostgreSQL connection string | `postgresql://user:password@ep-host.region.neon.tech/neondb?sslmode=require` |
| `ALLOWED_HOSTS` | Allowed hostnames for requests | `.vercel.app,localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | `https://frontend-ashu-36ce.vercel.app` |
| `JWT_SECRET` | Secret key for signing JWT tokens | Secure 64-char random string |
| `JWT_ACCESS_EXPIRATION_HOURS` | Token validity | `24` |
| `JWT_REFRESH_EXPIRATION_DAYS` | Refresh token validity | `7` |
| `EMAIL_HOST` | SMTP server for password recovery | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USE_TLS` | TLS encryption | `True` |
| `EMAIL_HOST_USER` | SMTP username | `your-email@gmail.com` |
| `EMAIL_HOST_PASSWORD` | SMTP app password | `your-app-password` |

### 3. PostgreSQL Database Setup & Migrations

To connect and run migrations against your production PostgreSQL instance:

```bash
# Export the remote database connection URL
export DATABASE_URL="postgresql://user:password@host:5432/vega_db?sslmode=require"

# Run migrations
cd backend
python manage.py migrate

# Seed realistic demo data for testing
python manage.py seed_demo_data
```

### 4. Future Redeployment Workflow

Any commit pushed to `main` automatically triggers a zero-downtime production deployment on Vercel:

```bash
# 1. Make code changes and test locally
npm test -- --run
python manage.py test

# 2. Stage and commit
git add .
git commit -m "feat: description of changes"

# 3. Push to GitHub
git push origin main
# Vercel automatically deploys to https://frontend-ashu-36ce.vercel.app
```

---

## ⚡ Quick Start with Docker (Local)

```bash
# Clone the repository
git clone https://github.com/Ashwitha-12-ashu/vega.git
cd vega

# Start all services with Docker Compose
docker compose up --build
```

Access the applications:
- **React Frontend**: [http://localhost:5173](http://localhost:5173)
- **Django REST API**: [http://localhost:8000/api/](http://localhost:8000/api/)
- **API Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## 🛠️ Local Development Setup

### 1. Backend (Django REST Framework)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Run migrations and seed demo data
python manage.py migrate
python manage.py seed_demo_data

# Run automated tests (21 tests)
python manage.py test

# Start backend server
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install

# Run frontend tests (16 tests)
npm test -- --run

# Start Vite dev server with API proxy
npm run dev
```

---

## 🧪 Automated Testing

- **Backend (21 Django Tests)**: Covers authentication, bookings concurrency, notifications, OTP password recovery, provider discovery, reviews, and service listings.
- **Frontend (16 Vitest Tests)**: Covers authentication UI, registration validation, forgot password flow, navigation branding, and public route guards.

---

## 📄 License
This project is licensed under the MIT License.
