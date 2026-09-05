# VEGA Local Development Guide

This guide walks you through setting up and running VEGA locally on your machine.

---

## 1. Prerequisites
- Python 3.11+
- Node.js 20+ & npm
- PostgreSQL 16 with PostGIS extension (or SQLite for development fallback)
- Docker & Docker Compose (Optional for containerized run)

---

## 2. Backend Setup

1. **Navigate to the backend directory and activate virtualenv**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` inside `backend/`:
   ```bash
   cp .env.example .env
   ```

4. **Run Migrations & Seed Default Categories**:
   ```bash
   python manage.py migrate
   python manage.py seed_categories
   ```

5. **Run Backend Test Suite**:
   ```bash
   python manage.py test
   ```

6. **Start Development Server**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   API will be live at `http://127.0.0.1:8000/api/`.

---

## 3. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run Frontend Component Tests**:
   ```bash
   npm test
   ```

4. **Start Vite Dev Server**:
   ```bash
   npm run dev
   ```
   React UI will be live at `http://localhost:5173`.

---

## 4. Docker Quickstart

To run the entire stack (PostGIS + Django Backend + React Frontend) with one command:
```bash
docker compose up --build
```
- React Frontend: `http://localhost:5173`
- Django REST API: `http://localhost:8000/api`
- PostgreSQL/PostGIS: `localhost:5432`
