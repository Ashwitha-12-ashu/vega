# VEGA REST API Documentation

Base URL: `http://localhost:8000/api`

---

## 1. Authentication Endpoints

### Register User
- **Method / URL**: `POST /api/auth/register/`
- **Auth**: Public
- **Request Body**:
```json
{
  "username": "alice_smith",
  "email": "alice@example.com",
  "first_name": "Alice",
  "last_name": "Smith",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```
- **Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "alice_smith",
    "email": "alice@example.com",
    "full_name": "Alice Smith"
  },
  "tokens": {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi..."
  }
}
```

---

### Login User
- **Method / URL**: `POST /api/auth/login/`
- **Auth**: Public
- **Request Body**:
```json
{
  "username": "alice_smith", // or email "alice@example.com"
  "password": "SecurePassword123!"
}
```
- **Response (200 OK)**:
```json
{
  "message": "Login successful",
  "user": { ... },
  "tokens": {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi..."
  }
}
```

---

### Current User Profile
- **Method / URL**: `GET /api/auth/me/`
- **Auth**: `Bearer <access_token>`
- **Response (200 OK)**:
```json
{
  "id": 1,
  "username": "alice_smith",
  "email": "alice@example.com",
  "full_name": "Alice Smith",
  "profile": {
    "is_provider": true,
    "is_online": true,
    "average_rating": 4.9,
    "total_reviews": 12
  }
}
```

---

## 2. Provider Management Endpoints

### Enable / Disable Provider Mode
- **Method / URL**: `POST /api/profile/provider/enable/`
- **Auth**: `Bearer <access_token>`
- **Request Body**: `{ "enable": true }`
- **Response (200 OK)**: `{ "message": "Provider mode enabled." }`

### Go Online
- **Method / URL**: `POST /api/provider/go-online/`
- **Auth**: `Bearer <access_token>`
- **Validation**: Requires user to have at least one active talent and valid location coordinates.
- **Response (200 OK)**: `{ "message": "You are now ONLINE and discoverable." }`

### Go Offline
- **Method / URL**: `POST /api/provider/go-offline/`
- **Auth**: `Bearer <access_token>`
- **Response (200 OK)**: `{ "message": "You are now OFFLINE." }`

---

## 3. Talents & Services Endpoints

### List Categories
- **Method / URL**: `GET /api/categories/`
- **Auth**: Public

### List My Talents
- **Method / URL**: `GET /api/talents/`
- **Auth**: `Bearer <access_token>`

### Create Talent
- **Method / URL**: `POST /api/talents/`
- **Auth**: `Bearer <access_token>`
- **Request Body**:
```json
{
  "category_id": 1,
  "title": "Master Haircut & Blowout",
  "description": "Professional salon styling at your home",
  "price_per_hour": 50.00,
  "experience_years": 4,
  "availability_notes": "Mon-Fri 9AM-6PM"
}
```

### Activate Single Talent (Critical Business Rule)
- **Method / URL**: `POST /api/talents/{id}/activate/`
- **Auth**: `Bearer <access_token>`
- **Behavior**: Atomic transaction setting this talent to `is_active=True` and deactivating all other talents belonging to this user.

---

## 4. Geospatial Discovery Endpoints

### Discover Nearby Providers
- **Method / URL**: `GET /api/providers/nearby/?lat=12.9716&lng=77.5946&radius=5&category=hair-styling`
- **Query Parameters**:
  - `lat` (float, required): Search latitude
  - `lng` (float, required): Search longitude
  - `radius` (float, optional, default: `5.0`): Radius in kilometers (1, 2, 5, 10, 20)
  - `category` (string, optional): Category slug filter
  - `search` (string, optional): Keyword query
  - `min_rating` (float, optional): e.g. `4.0`
- **Response (200 OK)**:
```json
{
  "count": 1,
  "radius_km": 5.0,
  "search_center": { "lat": 12.9716, "lng": 77.5946 },
  "results": [
    {
      "provider_id": 1,
      "provider_name": "Alice Smith",
      "distance_km": 2.22,
      "average_rating": 4.9,
      "total_reviews": 12,
      "is_online": true,
      "active_talent": {
        "id": 4,
        "title": "Master Haircut & Blowout",
        "price_per_hour": "50.00"
      }
    }
  ]
}
```

---

## 5. Bookings Endpoints

### Create Booking Request
- **Method / URL**: `POST /api/bookings/`
- **Auth**: `Bearer <access_token>`
- **Request Body**:
```json
{
  "talent_id": 4,
  "location_address": "456 Blossom Lane, Apt 2B",
  "scheduled_date": "2026-09-01",
  "scheduled_time": "14:00:00",
  "notes": "Please call when arriving"
}
```

### Update Booking Status
- **Method / URL**: `PATCH /api/bookings/{id}/status/`
- **Auth**: `Bearer <access_token>`
- **Request Body**: `{ "status": "ACCEPTED" }`
- **Supported Transitions**:
  - `PENDING` -> `ACCEPTED` / `REJECTED` / `CANCELLED`
  - `ACCEPTED` -> `IN_PROGRESS` / `CANCELLED`
  - `IN_PROGRESS` -> `COMPLETED`

---

## 6. Reviews Endpoints

### Create Review
- **Method / URL**: `POST /api/reviews/`
- **Auth**: `Bearer <access_token>`
- **Constraint**: Allowed only once per `COMPLETED` booking.
- **Request Body**:
```json
{
  "booking_id": 10,
  "rating": 5,
  "comment": "Punctual, friendly, and wonderful haircut!"
}
```

---

## 7. Notifications Endpoints
- `GET /api/notifications/` - List user notifications and unread count
- `PATCH /api/notifications/{id}/read/` - Mark single notification as read
- `POST /api/notifications/mark-all-read/` - Mark all notifications read
