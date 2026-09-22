# ChargeConnect ⚡

**ChargeConnect** is a production-grade EV charging infrastructure platform for India connecting EV drivers with charging station owners. Powered by **MongoDB + Mongoose**, the platform features real-time geospatial hub discovery (`2dsphere`), server-side booking conflict prevention, JWT session authentication, and full Indian Rupee (`₹`) pricing.

---

## ✨ Features

- **For EV Drivers:**
  - 📍 **Geospatial Hub Discovery:** Find nearest DC Fast & AC chargers using MongoDB `2dsphere` queries.
  - 🕒 **Conflict-Free Slot Booking:** Server-side atomic validation guarantees no double-booking on the same charger.
  - 💳 **Transparent INR Pricing:** Authentic Indian pricing (₹14 - ₹22 / kWh) formatted with `₹` and `en-IN` standards.
- **For Station Owners / Partners:**
  - 📈 **Deploy Stations:** Add your charging bays, connector types (CCS2, Type 2, Bharat DC-001), and tariffs.
  - 📅 **Manage Reservations:** Oversee reservations and live operational status.
  - 💰 **Revenue Tracking:** Real-time analytics of completed charging sessions in INR.
- **Production Architecture:**
  - Database: **MongoDB + Mongoose** with connection pooling & hot-reload caching.
  - Auth: **JWT Sessions in HTTP-only secure cookies** with `bcryptjs` password hashing and Edge-ready middleware.

---

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** MongoDB & Mongoose
- **Authentication:** JWT (jose) + HTTP-only cookies + bcryptjs
- **Styling:** Tailwind CSS v4
- **Maps:** Google Maps API (`@react-google-maps/api`)
- **Icons:** Lucide Icons (featuring `IndianRupee`)

---

## 🛠️ Getting Started

### 1. Environment Variables
Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/chargeconnect
MONGODB_DB_NAME=chargeconnect
JWT_SECRET=chargeconnect-super-secure-jwt-secret-key-production-2026
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Realistic Indian EV Data
Populate realistic stations (Bengaluru, Gurugram, Mumbai, Hyderabad, Pune), chargers, and test accounts:
```bash
npm run seed
```

**Seed Credentials:**
- **EV Driver:** `user@example.com` / `password123`
- **Station Partner:** `owner@example.com` / `password123`

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Architecture

```text
lib/
  mongodb.ts              # Cached Mongoose connection for Next.js
  auth.ts                 # JWT signing, verification, and bcryptjs hashing
  actions/
    stations.ts           # Geospatial discovery & station CRUD server actions
    bookings.ts           # Conflict-free reservation engine & lister metrics

models/
  User.ts                 # Users, roles (USER, STATION_OWNER, ADMIN), vehicles
  Vehicle.ts              # EV models, battery capacity, connector compatibility
  Station.ts              # GeoJSON Point, 2dsphere index, amenities, rating
  Charger.ts              # Connector types (CCS2, Type 2, etc.), power kW, tariff
  Booking.ts              # Time-window reservations with conflict indexes
  ChargingSession.ts      # Active session telemetry and kWh delivered
  Payment.ts              # Transactions (INR, UPI/Card)
  Review.ts               # Ratings & driver feedback
  Notification.ts         # User & partner system alerts

scripts/
  seed-mongodb.mjs        # Production-grade Indian EV network seed script
```
