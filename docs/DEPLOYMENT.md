# VEGA Cloud Production Deployment Guide

This guide provides a comprehensive production deployment plan for the VEGA platform across leading cloud providers (AWS, GCP, Render, Railway, DigitalOcean).

---

## 1. Production Architecture Overview

```
                          INTERNET (Users & Browsers)
                                      │
                                      ▼
                        [ Cloudflare CDN & SSL Edge ]
                       (DDoS, WAF, DNS & SSL/TLS 1.3)
                         ┌────────────┴────────────┐
                         ▼                         ▼
               [ React Frontend (SPA) ]    [ Django REST API ]
               Hosted on Vercel / Cloudflare   Hosted on AWS ECS / Render
               Static Edge Distribution        Gunicorn + Uvicorn Workers
                                                   │
                                                   ▼
                                        [ Managed PostgreSQL 16 ]
                                         (with PostGIS Extension)
                                         AWS RDS / Supabase / Neon
                                                   │
                                                   ▼
                                          [ Object Storage ]
                                         (AWS S3 / Cloudflare R2)
                                         User Avatars & Service Media
```

---

## 2. Cloud Service Provisioning Checklist

### Steps Requiring Manual Cloud Console Actions:
1. **Domain & DNS**: Purchase domain (e.g., `vega.app`) and configure DNS records on Cloudflare or Route 53.
2. **Managed PostgreSQL with PostGIS**:
   - Provision a PostgreSQL 16 database instance (e.g. AWS RDS or Supabase).
   - Run `CREATE EXTENSION IF NOT EXISTS postgis;` in the database query console.
3. **Object Storage (S3 / R2)**:
   - Create an S3 / Cloudflare R2 bucket: `vega-media-production`.
   - Configure IAM user with `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions.
4. **Backend Web Service**:
   - Deploy Docker image or git repository to AWS App Runner / ECS / Render.
   - Configure environment variables securely in the secret manager.
5. **Frontend Web Service**:
   - Deploy `frontend/` to Vercel / Cloudflare Pages / AWS Amplify.
   - Set environment variable `VITE_API_URL=https://api.vega.app/api`.

---

## 3. Production Environment Variables

### Backend Secrets:
```ini
DEBUG=False
SECRET_KEY=generate-a-strong-random-50-character-string
DB_ENGINE=django.db.backends.postgresql
DB_NAME=vega_production_db
DB_USER=vega_admin
DB_PASSWORD=strong-production-db-password
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
ALLOWED_HOSTS=api.vega.app,vega.app
CORS_ALLOWED_ORIGINS=https://vega.app,https://www.vega.app
STORAGE_BUCKET=vega-media-production
STORAGE_ACCESS_KEY=your-iam-access-key
STORAGE_SECRET_KEY=your-iam-secret-key
```

### Frontend Secrets:
```ini
VITE_API_URL=https://api.vega.app/api
```

---

## 4. Pre-Launch Verification Commands

1. **Collect Static Files**:
   ```bash
   python manage.py collectstatic --noinput
   ```

2. **Apply Migrations**:
   ```bash
   python manage.py migrate --noinput
   ```

3. **Run Production Django Security Check**:
   ```bash
   python manage.py check --deploy
   ```
