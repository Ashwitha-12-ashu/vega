# 🌟 VEGA: Smart Local Service Booking Platform

> **VEGA** connects customers with trusted, nearby local service providers based on real-time location. Built with React 19, Django REST Framework, PostgreSQL/PostGIS, and cloud-native architecture.

[![CI Pipeline](https://github.com/vega/vega-app/actions/workflows/ci.yml/badge.svg)](https://github.com/vega/vega-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB.svg?logo=python)](https://python.org)
[![Django 5.2](https://img.shields.io/badge/Django-5.2-092E20.svg?logo=django)](https://djangoproject.com)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?logo=vite)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql)](https://postgresql.org)
[![PostGIS](https://img.shields.io/badge/PostGIS-3.4-green.svg)](https://postgis.net)

---

## 🚀 Key Features

- **Unified Single User Model**: Every user starts as a customer and can easily toggle Provider Mode from their profile. No confusing dual-login systems.
- **Multiple Talents Management**: Providers can configure multiple service offerings (Hair Styling, Makeup, Photography, Electrical, Plumbing, etc.) with custom rates, bio, and experience.
- **Strict One-Active-Talent Rule**: Providers have **exactly ONE active talent at any time**, enforced by PostgreSQL partial unique indexes and atomic row-locking transactions.
- **Geospatial Proximity Discovery**: Fast, accurate radius discovery (1km, 2km, 5km, 10km, 20km) using PostGIS and spherical Haversine distance computations.
- **Robust Booking State Machine**: Deterministic transition workflow (`PENDING` ➔ `ACCEPTED` ➔ `IN_PROGRESS` ➔ `COMPLETED` / `CANCELLED` / `REJECTED`) with strict role-based authorization.
- **Verified Review & Rating System**: Ratings (1-5 stars) and reviews can only be submitted after completed bookings, updating provider averages atomically.
- **In-App Notifications**: Real-time notification feed for booking requests, status transitions, and customer reviews.
- **Responsive UI/UX**: Clean, modern React interface built with mobile-first principles, toast alerts, skeleton loaders, and interactive maps.

---

## 🏗️ Architecture & Technology Stack

```
React 19 + Vite (SPA)  ──►  Django 5 REST API (JWT)  ──►  PostgreSQL 16 + PostGIS
```

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Axios, Lucide Icons, Modern CSS |
| **Backend** | Python 3.11, Django 5.2, Django REST Framework, SimpleJWT, Gunicorn |
| **Database** | PostgreSQL 16 with PostGIS spatial extension |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions Pipeline |

---

## ⚡ Quick Start with Docker

The fastest way to launch the entire stack (PostGIS + Django API + React Frontend):

```bash
# Clone the repository
git clone https://github.com/your-username/VEGA.git
cd VEGA

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
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations and seed service categories
python manage.py migrate
python manage.py seed_categories

# Run automated tests
python manage.py test

# Start backend server
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install

# Run frontend tests
npm test

# Start Vite dev server
npm run dev
```

---

## 📖 Complete Documentation

Explore the detailed architecture guides in the [`docs/`](docs/) directory:

- 📐 [**System Architecture**](docs/ARCHITECTURE.md) - Subsystems, design principles, and state machine diagrams.
- 🗄️ [**Database & ER Diagram**](docs/DATABASE.md) - Entity specifications, indexes, and Mermaid ER diagram.
- 🔌 [**REST API Reference**](docs/API.md) - Endpoints, request schemas, headers, and response payloads.
- 💻 [**Local Development Guide**](docs/DEVELOPMENT.md) - Setup guide, migrations, seed data, and testing workflows.
- ☁️ [**Production Deployment Guide**](docs/DEPLOYMENT.md) - Production cloud provisioning on AWS/GCP/Render.
- 🔒 [**Security & Threat Model**](docs/SECURITY.md) - JWT lifecycle, RBAC, CORS, and vulnerability mitigations.

---

## 🧪 Testing

### Backend Test Suite (20 tests)
```bash
cd backend
python manage.py test
```

### Frontend Test Suite (Vitest)
```bash
cd frontend
npm test
```

---

## 📄 License
This project is licensed under the MIT License.
