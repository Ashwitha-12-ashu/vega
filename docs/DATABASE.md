# VEGA Database Schema & Entity Documentation

This document describes the PostgreSQL/PostGIS database design, table structures, constraints, indexes, and entity relationships for the VEGA platform.

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--|| UserProfile : "has profile"
    User ||--|| UserLocation : "has location"
    User ||--o{ Talent : "creates talents"
    User ||--o{ Booking : "books as customer"
    User ||--o{ Booking : "serves as provider"
    User ||--o{ Review : "writes review"
    User ||--o{ Review : "receives review"
    User ||--o{ Notification : "receives notification"

    ServiceCategory ||--o{ Talent : "categorizes"
    ServiceCategory ||--o{ Booking : "categorizes"
    Talent ||--o{ Booking : "booked in"
    Booking ||--o| Review : "unlocks review"
    Booking ||--o{ Notification : "triggers"

    User {
        bigint id PK
        varchar username UK
        varchar email UK
        varchar first_name
        varchar last_name
        varchar password
        timestamptz created_at
        timestamptz updated_at
    }

    UserProfile {
        bigint id PK
        bigint user_id FK,UK
        varchar phone_number
        text bio
        varchar avatar
        boolean is_provider
        boolean is_online
        decimal average_rating
        integer total_reviews
        timestamptz updated_at
    }

    UserLocation {
        bigint id PK
        bigint user_id FK,UK
        double_precision latitude
        double_precision longitude
        varchar address
        varchar city
        varchar state
        varchar postal_code
        timestamptz updated_at
    }

    ServiceCategory {
        bigint id PK
        varchar name UK
        varchar slug UK
        varchar icon
        text description
        boolean is_active
    }

    Talent {
        bigint id PK
        bigint user_id FK
        bigint category_id FK
        varchar title
        text description
        decimal price_per_hour
        integer experience_years
        text availability_notes
        boolean is_active
        timestamptz created_at
    }

    Booking {
        bigint id PK
        bigint customer_id FK
        bigint provider_id FK
        bigint talent_id FK
        bigint category_id FK
        varchar location_address
        double_precision latitude
        double_precision longitude
        date scheduled_date
        time scheduled_time
        decimal price
        text notes
        varchar status
        timestamptz created_at
        timestamptz updated_at
    }

    Review {
        bigint id PK
        bigint booking_id FK,UK
        bigint customer_id FK
        bigint provider_id FK
        smallint rating
        text comment
        timestamptz created_at
    }

    Notification {
        bigint id PK
        bigint recipient_id FK
        bigint actor_id FK
        bigint booking_id FK
        varchar title
        text message
        varchar notification_type
        boolean is_read
        timestamptz created_at
    }
```

---

## 2. Table Specifications

### `vega_users` (Unified User Account)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique user identifier |
| `username` | `VARCHAR(150)` | `UNIQUE, NOT NULL` | Unique user handle |
| `email` | `VARCHAR(254)` | `UNIQUE, NOT NULL, INDEXED` | User email for auth |
| `first_name` | `VARCHAR(150)` | `NOT NULL` | Given name |
| `last_name` | `VARCHAR(150)` | `NOT NULL` | Surname |
| `password` | `VARCHAR(128)` | `NOT NULL` | Argon2 / PBKDF2 hashed password |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Account status flag |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Registration timestamp |

---

### `vega_user_talents` (Multiple Talents & One-Active Rule)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Unique talent ID |
| `user_id` | `BIGINT` | `FOREIGN KEY(vega_users.id), NOT NULL` | Provider user |
| `category_id` | `BIGINT` | `FOREIGN KEY(vega_service_categories.id)` | Service category |
| `title` | `VARCHAR(150)` | `NOT NULL` | Talent title |
| `description` | `TEXT` | `NOT NULL` | Service details & tooling |
| `price_per_hour` | `DECIMAL(10,2)` | `NOT NULL` | Standard rate in USD/currency |
| `experience_years`| `INTEGER` | `NOT NULL, DEFAULT 1` | Years of experience |
| `is_active` | `BOOLEAN` | `NOT NULL, DEFAULT FALSE` | Active/online talent flag |

#### ⚠️ One-Active-Talent Constraint
```sql
CREATE UNIQUE INDEX unique_active_talent_per_user 
ON vega_user_talents (user_id) 
WHERE (is_active = TRUE);
```
*Enforcement*: A user can have $N$ talents, but at most 1 talent row with `is_active = true`. Attempting to save a second active talent triggers an immediate DB `IntegrityError`.

---

### `vega_user_locations` (Geospatial Location)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Location record ID |
| `user_id` | `BIGINT` | `FOREIGN KEY(vega_users.id), UNIQUE` | Owner user |
| `latitude` | `DOUBLE PRECISION` | `NOT NULL, CHECK(-90 <= lat <= 90)` | Decimal latitude |
| `longitude` | `DOUBLE PRECISION` | `NOT NULL, CHECK(-180 <= lng <= 180)`| Decimal longitude |
| `address` | `VARCHAR(255)` | `DEFAULT ''` | Street address |
| `city` | `VARCHAR(100)` | `DEFAULT ''` | City name |
| `updated_at` | `TIMESTAMPTZ` | `AUTO_NOW` | Last location ping timestamp |

*Index*: `CREATE INDEX idx_locations_lat_lon ON vega_user_locations (latitude, longitude);`

---

### `vega_bookings` (State Machine Bookings)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Booking ID |
| `customer_id` | `BIGINT` | `FOREIGN KEY(vega_users.id)` | Ordering customer |
| `provider_id` | `BIGINT` | `FOREIGN KEY(vega_users.id)` | Service provider |
| `talent_id` | `BIGINT` | `FOREIGN KEY(vega_user_talents.id)` | Chosen talent |
| `category_id` | `BIGINT` | `FOREIGN KEY(vega_service_categories.id)`| Snapshot category |
| `status` | `VARCHAR(20)` | `DEFAULT 'PENDING', INDEXED` | `PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `IN_PROGRESS`, `COMPLETED` |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | Locked service rate |
| `scheduled_date`| `DATE` | `NOT NULL` | Appointment date |
| `scheduled_time`| `TIME` | `NOT NULL` | Appointment time |

---

### `vega_reviews` (Verified Customer Reviews)
| Field | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | `PRIMARY KEY, AUTO_INCREMENT` | Review ID |
| `booking_id` | `BIGINT` | `FOREIGN KEY(vega_bookings.id), UNIQUE` | One review per completed booking |
| `customer_id` | `BIGINT` | `FOREIGN KEY(vega_users.id)` | Author customer |
| `provider_id` | `BIGINT` | `FOREIGN KEY(vega_users.id)` | Recipient provider |
| `rating` | `SMALLINT` | `NOT NULL, CHECK(1 <= rating <= 5)` | 1 to 5 star rating |
| `comment` | `TEXT` | `NOT NULL` | Review feedback |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Submission timestamp |
