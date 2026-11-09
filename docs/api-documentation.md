# API Specification & Endpoint Documentation
**API Protocol:** REST (HTTP/1.1 JSON)  
**Base URL:** `http://localhost:5000/api`  
**Interactive Swagger UI:** `http://localhost:5000/api/docs`  
**Authentication Scheme:** HTTP Bearer Header (`Authorization: Bearer <JWT_TOKEN>`)  

---

## 1. Authentication & Identity APIs

### 1.1. Register Guest Account
- **Method:** `POST`
- **Route:** `/api/auth/register`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Sophia Patel",
    "email": "sophia@example.com",
    "password": "Password@123",
    "phone": "+91 98765 43210"
  }
  ```
- **Responses:**
  - `201 Created`: User profile & JWT access token returned.
  - `400 Bad Request`: Validation failure (short password, invalid email).
  - `409 Conflict`: Email already registered.

### 1.2. User Login
- **Method:** `POST`
- **Route:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "guest@hotel.demo",
    "password": "Guest@123"
  }
  ```
- **Responses:**
  - `200 OK`: Returns JWT token & user object.
  - `401 Unauthorized`: Invalid credentials.
  - `403 Forbidden`: Account disabled.

### 1.3. Get Current User Profile
- **Method:** `GET`
- **Route:** `/api/auth/me`
- **Access:** Authenticated (Any role)

---

## 2. Room & Availability APIs

### 2.1. Search Available Rooms
- **Method:** `GET`
- **Route:** `/api/availability`
- **Access:** Public
- **Query Parameters:**
  - `checkIn` (string, required): `YYYY-MM-DD`
  - `checkOut` (string, required): `YYYY-MM-DD`
  - `guests` (integer, optional): default `1`
  - `roomTypeId` (string, optional): MongoDB ObjectId
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "checkIn": "2026-12-10",
      "checkOut": "2026-12-13",
      "totalNights": 3,
      "guests": 2,
      "totalAvailable": 2,
      "rooms": [
        {
          "room": {
            "_id": "672f...01",
            "roomNumber": "101",
            "floor": 1,
            "status": "available",
            "roomType": { "name": "Standard Room", "basePrice": 2000, "capacity": 2 }
          },
          "pricing": {
            "totalNights": 3,
            "nightlyRate": 2000,
            "roomCharges": 6000,
            "taxAmount": 720,
            "serviceFee": 300,
            "totalAmount": 7020,
            "currency": "INR"
          }
        }
      ]
    }
  }
  ```

### 2.2. List Room Types
- **Method:** `GET`
- **Route:** `/api/rooms/types`
- **Access:** Public

### 2.3. Create Room Type
- **Method:** `POST`
- **Route:** `/api/rooms/types`
- **Access:** Admin only (`authorize('admin')`)

### 2.4. Update Room Status
- **Method:** `PATCH`
- **Route:** `/api/rooms/:id/status`
- **Access:** Staff & Admin (`authorize('admin', 'staff')`)
- **Request Body:**
  ```json
  {
    "status": "maintenance",
    "notes": "HVAC servicing in progress"
  }
  ```

---

## 3. Booking & Reservation Workflow APIs

### 3.1. Create Temporary Hold (Step 1)
- **Method:** `POST`
- **Route:** `/api/bookings/holds`
- **Access:** Authenticated (Guest, Staff, Admin)
- **Request Body:**
  ```json
  {
    "roomId": "672f...01",
    "checkIn": "2026-12-10",
    "checkOut": "2026-12-13",
    "numberOfGuests": 2,
    "guestDetails": {
      "name": "Sophia Patel",
      "email": "sophia@example.com",
      "phone": "+91 98765 43210",
      "specialRequests": "High floor preferred"
    }
  }
  ```
- **Responses:**
  - `201 Created`: Returns booking document with `status: 'pending'` and `holdExpiresAt: Date (+10m)`.
  - `400 Bad Request`: Date range error or guests exceed room capacity.
  - `409 Conflict`: Room is already held or reserved by another user.

### 3.2. Confirm Booking with Simulated Payment (Step 2)
- **Method:** `POST`
- **Route:** `/api/bookings/:id/confirm`
- **Access:** Authenticated (Owner, Staff, Admin)
- **Request Body:**
  ```json
  {
    "paymentMethod": "credit_card",
    "shouldSucceed": true,
    "idempotencyKey": "idemp-booking-12345"
  }
  ```
- **Responses:**
  - `200 OK`: Booking promoted to `confirmed`, occupancies locked.
  - `400 Bad Request`: Hold expired.
  - `402 Payment Required`: Simulated payment failed; hold released.

### 3.3. Cancel Booking
- **Method:** `PATCH`
- **Route:** `/api/bookings/:id/cancel`
- **Access:** Authenticated (Booking Owner, Staff, Admin)
- **Request Body:**
  ```json
  {
    "cancellationReason": "Change of travel plans"
  }
  ```
- **Responses:**
  - `200 OK`: Booking marked `cancelled`, room occupancy deleted, simulated refund processed.
  - `400 Bad Request`: Cannot cancel if already checked-in or checked-out.
  - `403 Forbidden`: Guest attempting to cancel someone else's booking.

### 3.4. Staff Check-in
- **Method:** `PATCH`
- **Route:** `/api/bookings/:id/check-in`
- **Access:** Staff & Admin
- **Response:** `200 OK` (Status updated to `checked-in`).

### 3.5. Staff Check-out
- **Method:** `PATCH`
- **Route:** `/api/bookings/:id/check-out`
- **Access:** Staff & Admin
- **Response:** `200 OK` (Status updated to `checked-out`, stay concluded).

---

## 4. Reporting & Analytics APIs

### 4.1. Dashboard Executive Summary
- **Method:** `GET`
- **Route:** `/api/reports/summary`
- **Access:** Staff & Admin
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "kpis": {
        "totalRooms": 7,
        "availableRooms": 6,
        "maintenanceRooms": 1,
        "todayOccupiedRooms": 2,
        "occupancyRate": "29%",
        "grossRevenue": 35000,
        "totalRefunds": 0,
        "netRevenue": 35000,
        "currency": "INR"
      },
      "todayArrivals": [...],
      "todayDepartures": [...]
    }
  }
  ```

### 4.2. Monthly Revenue Report
- **Method:** `GET`
- **Route:** `/api/reports/revenue`
- **Access:** Admin only

### 4.3. Audit Logs Explorer
- **Method:** `GET`
- **Route:** `/api/admin/audit-logs`
- **Access:** Admin only
- **Query Params:** `action`, `entityType`, `page`, `limit`
