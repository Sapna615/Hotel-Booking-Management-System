# Technical Report: Design Decisions, Integrity & Architecture
**Assessment:** ALGIONS AI LABS PRIVATE LIMITED — Advanced Individual Assessment  
**Author / Role:** Full-Stack Web Development  
**Subject:** Hotel Booking Management System  

---

## 1. Executive Summary & Problem Space

Operating a modern hotel booking platform requires handling strict concurrent invariants. The most unforgiving failure mode in hospitality software is **double-booking**—allowing two guests to simultaneously pay for and confirm the same room on overlapping dates. This technical report documents the design decisions, trade-offs, security mechanisms, and data integrity guarantees implemented across our full-stack solution.

---

## 2. Key Architecture & Design Decisions

### 2.1. Modular Monolith vs. Microservices
* **Decision:** We selected a Modular Monolith architecture over microservices.
* **Rationale:** A hotel management system is bounded by strong cross-domain consistency requirements (e.g., locking a room-night must atomically reflect in booking state, occupancy tables, and financial records). 
* **Trade-off Analysis:** While microservices provide independent scaling, they introduce distributed transaction overhead (Saga patterns, eventual consistency gaps, network latency, and multi-service failure states). A modular monolith achieves high cohesion, distinct domain encapsulation (Routes -> Middleware -> Controllers -> Services -> Repositories), clean unit/integration testability, and zero network overhead between modules.

### 2.2. Discrete Room-Night Occupancy & Concurrency Protection
* **Problem:** Traditional range queries (`checkIn < existingCheckOut AND checkOut > existingCheckIn`) are vulnerable to race conditions when two parallel requests pass the read check before either writes to the database.
* **Our Solution:** We decoupled reservations into a specialized `RoomOccupancy` table indexed by discrete calendar nights:
  ```javascript
  roomOccupancySchema.index({ roomId: 1, night: 1 }, { unique: true });
  ```
* **Why this guarantees 100% integrity:**
  When a guest reserves Room 101 from Dec 10 to Dec 13, the system inserts 3 discrete records:
  - `(Room 101, 2026-12-10)`
  - `(Room 101, 2026-12-11)`
  - `(Room 101, 2026-12-12)`
  Even if two parallel requests hit the server at the exact same millisecond, MongoDB's storage engine enforces the unique compound index constraint at the disk write layer. Exactly one request succeeds; the second request throws a duplicate key error (code `11000`), which our service catches and transforms into a clean HTTP `409 Conflict`.

### 2.3. Active 10-Minute Hold Window vs. Stale Locks
* **Challenge:** If a guest selects a room but abandons the payment screen, how do we prevent the room from remaining indefinitely locked?
* **Design Decision:**
  1. A 10-minute hold (`holdExpiresAt = Date.now() + 10 mins`) is stamped on initial booking creation.
  2. The availability engine dynamically excludes holds where `holdExpiresAt <= now`, treating expired holds as immediately available.
  3. Rather than relying solely on MongoDB's background TTL monitor (which only runs approximately every 60 seconds), our booking service runs proactive synchronous cleanups before attempting to reserve or search rooms.

### 2.4. Pricing Snapshotting vs. Dynamic Recalculation
* **Problem:** If a hotel administrator increases the nightly price of Deluxe Suites from ₹3,500 to ₹4,500, existing bookings or historic financial statements must not retroactively change.
* **Design Decision:** Every booking record saves an immutable `pricing` snapshot containing:
  - `nightlyRate`
  - `totalRoomCharges`
  - `taxAmount` (12% GST)
  - `serviceFee` (5%)
  - `totalAmount`
  Future rate revisions modify only new reservations without contaminating historical ledgers.

### 2.5. Server-Side RBAC vs. Client Button Hiding
* **Security Decision:** Client-side button hiding in React is treated strictly as an aesthetic user-experience convenience.
* **Server Enforcement:** Every sensitive endpoint checks the cryptographically verified JWT payload with server-side middleware:
  - `authorize('admin')`: Restricts room catalog creation, rate modifications, user role adjustments, and forensic audit logs.
  - `authorize('staff', 'admin')`: Restricts check-in, check-out, and housekeeping status alterations.
  - Guests attempting to access administrative routes receive immediate HTTP `403 Forbidden` responses.

---

## 3. Automated Testing Evidence

The backend test suite (`backend/tests/hotel.test.js`) runs inside an isolated in-memory replica environment with 17 automated tests verifying critical paths:

| Test Group | Scenarios Evaluated | Result |
|---|---|---|
| **1. Authentication & RBAC** | Guest registration, invalid password rejection (401), unauthorized admin access blocked (403), admin authorization granted (200) | ✅ 4/4 Passed |
| **2. Date Validation & Availability** | Past check-in rejected (400), check-out before check-in rejected (400), valid search returns accurate inventory, maintenance rooms excluded | ✅ 4/4 Passed |
| **3. Concurrency & Protection** | Hold & confirmation workflow, **parallel overlapping booking rejected with 409 Conflict**, guest capacity limits enforced, expired holds automatically released | ✅ 4/4 Passed |
| **4. Lifecycle State Transitions** | Confirmed booking check-in, illegal check-out before check-in rejected (400), check-out releases room occupancy, guest cancellation triggers simulated refund | ✅ 4/4 Passed |
| **5. Operations & Reporting** | Dashboard KPI calculations and revenue metrics reconcile with underlying payment records | ✅ 1/1 Passed |
| **Total Test Suite** | **17 Critical Acceptance Tests** | **✅ 100% Pass** |

---

## 4. Known Assumptions & Future Roadmap

1. **Payment Simulation:** In compliance with the assessment brief ("Use simulated/sandbox payments only. Do not pay for hosting or external services"), payments and refunds are simulated with an idempotency mechanism and failure toggles. Production migration requires swapping `PaymentService.processPayment` with Stripe or Razorpay SDK webhooks.
2. **Channel Manager Integration:** The platform operates as a central reservation system (CRS). Future iterations could expose OTA two-way sync (iCal / OTA XML) to ingest bookings from Booking.com or Expedia.
3. **Multi-Property Tenancy:** The current data model assumes a single luxury resort property with multiple floors and rooms. Multi-hotel chains would benefit from adding a `PropertyId` partition key across rooms and bookings.

---

## 5. Walkthrough Interview Readiness

Shortlisted candidates must demonstrate and explain their own architecture during the 15-minute technical walkthrough and 10-minute live debugging task:
- **Code Explainability:** Code is written cleanly with zero obfuscation.
- **Traceability:** Every user action flows predictably: `Frontend UI` -> `Axios with Bearer Token` -> `Express Router` -> `Zod Validation` -> `Service Logic` -> `RoomOccupancy Compound Index` -> `AuditLog Record`.
- **Debugging Ergonomics:** Centralized error handler formats exact error codes and validation arrays for instantaneous diagnosis during live code modification tasks.
