# VEGA Security Architecture & Threat Model

This document outlines the security controls, authentication mechanisms, authorization boundaries, and threat defenses implemented across the VEGA platform.

---

## 1. Authentication & Token Lifecycle

- **JSON Web Tokens (JWT)**: Uses `djangorestframework-simplejwt` with `HS256` or `RS256` signature verification.
- **Short-Lived Access Tokens**: Access tokens expire after 24 hours.
- **Rotated Refresh Tokens & Blacklisting**: Refresh tokens expire after 7 days. When refreshed, old refresh tokens are automatically rotated and blacklisted in the `token_blacklist` table to prevent replay attacks.
- **Password Security**: Passwords are never stored in plaintext. They are hashed using Django's PBKDF2 with SHA-256 (or Argon2) with per-user salt and minimum complexity validation.

---

## 2. Authorization & Object-Level Permissions

- **Unified Account Security**: While customers and providers share a single account table, all provider actions (`/api/talents/`, `/api/provider/go-online/`) require `is_provider=True` permission validation.
- **Object-Level Access Controls**: A user cannot view, edit, or delete another user's talent, booking, or profile simply by altering the ID in the URL.
- **State Machine Protection**: Transitioning booking states is strictly validated by actor role:
  - Only the assigned **provider** can Accept, Reject, Start, or Complete a service.
  - Only the assigned **customer** can submit a verified review, and only once a booking has reached the `COMPLETED` state.

---

## 3. Concurrency Protection & Anti-Race Conditions

- **One-Active-Talent Invariant**:
  - Enforced by PostgreSQL partial unique index: `UNIQUE (user_id) WHERE (is_active = true)`.
  - Enforced in transactions via `select_for_update()` row locks, ensuring concurrent requests cannot result in multiple active talents.
- **Atomic Booking Operations**: Booking creation checks provider online status and talent availability inside a serializable/atomic transaction to prevent double bookings.

---

## 4. Web Application Security Defenses

- **Cross-Origin Resource Sharing (CORS)**: Strict origin whitelisting via `django-cors-headers`. Only verified frontend origins are permitted.
- **SQL Injection Prevention**: All queries utilize Django ORM parameterized SQL expressions and type-safe query builders.
- **Cross-Site Scripting (XSS)**: React JSX automatically escapes dynamic values in DOM nodes. API responses return JSON payloads with `Content-Type: application/json`.
- **Security Headers**: Standard security middleware enables `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and HTTPS redirect in production.
