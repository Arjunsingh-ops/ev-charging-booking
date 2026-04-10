# Database Schema Guide

## Complete Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE PostgreSQL DATABASE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  auth.users (Managed by Supabase Auth)                          │
│  ├── id (UUID)                                                  │
│  ├── email                                                      │
│  └── encrypted_password                                         │
│      │                                                          │
│      └──────────────────────────────────────────────┐           │
│                                                     │           │
│  ┌─ 1:1 Relationship ─────────────────────────────┘           │
│  │                                                  │           │
│  ▼                                                  ▼           │
│  public.profiles                                                │
│  ├── id (UUID, references auth.users)                          │
│  ├── email                                                      │
│  ├── full_name                                                 │
│  ├── user_type ('lister' | 'user')                            │
│  ├── phone                                                      │
│  ├── created_at                                                │
│  └── updated_at                                                │
│      │                                                          │
│      ├──────────────────┬────────────────────────────────┐    │
│      │                  │                                 │    │
│  (1:N) Relationship   (1:N)                          (1:N)    │
│      │                  │                                 │    │
│      ▼                  ▼                                 ▼    │
│  charging_stations   bookings                        reviews   │
│  ├── id (UUID)       ├── id (UUID)                  ├── id     │
│  ├── lister_id ◄────►├── user_id ◄────────────────►├── user_id
│  ├── name            ├── station_id ◄────┐        │ ├── station_id
│  ├── description     ├── start_time      │        │ ├── booking_id
│  ├── address         ├── end_time        │        │ ├── rating
│  ├── city            ├── status          │        │ ├── comment
│  ├── state           ├── total_price     │        │ ├── created_at
│  ├── zip_code        ├── payment_status  │        │ └── updated_at
│  ├── latitude        ├── created_at      │        │
│  ├── longitude       └── updated_at      │        │
│  ├── connector_type  ▲                   │        │
│  ├── power_output    │                   │        │
│  ├── price_per_hour  │                   │        │
│  ├── availability    │                   │        │
│  │  _start/end       │        (1:N) Relationship  │
│  ├── is_active       │                   │        │
│  ├── amenities       │                   └────────┼───(N:1)
│  ├── images          │                            │
│  ├── created_at      │                            │
│  └── updated_at      │                            │
│                      │                            │
│                      └────────────────────────────┘
│
└─────────────────────────────────────────────────────────────────┘
```

---

## Table Details

### 1. **profiles**
User information extending Supabase's `auth.users` table.

```
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('lister', 'user')) DEFAULT 'user',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose:**
- Store user metadata beyond email/password
- Distinguish between listers (station owners) and users (EV drivers)
- Track user contact information

**Access Control (RLS):**
- Users can see only their own profile
- New profiles auto-created on signup

---

### 2. **charging_stations**
EV charging station listings created by listers.

```
CREATE TABLE charging_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lister_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  connector_type TEXT CHECK (connector_type IN 
    ('Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla')),
  power_output INTEGER NOT NULL,           -- kW
  price_per_hour DECIMAL(10, 2) NOT NULL,
  availability_start TIME DEFAULT '00:00:00',
  availability_end TIME DEFAULT '23:59:59',
  is_active BOOLEAN DEFAULT TRUE,
  amenities TEXT[],                        -- JSON array
  images TEXT[],                           -- URL array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_charging_stations_location 
  ON charging_stations (latitude, longitude);
CREATE INDEX idx_charging_stations_city 
  ON charging_stations (city, state);
```

**Purpose:**
- Store all charging station information
- Enable location-based searches
- Track availability and pricing

**Access Control (RLS):**
- Anyone can see active stations
- Listers can see/edit their own stations
- Only listers can create stations

**Key Fields:**
- `connector_type` - EV connector standard (Type 2 most common in EU)
- `power_output` - Charging speed in kW
- `price_per_hour` - Cost per hour of charging
- `amenities` - Array: `['WiFi', 'Restroom', 'Food', 'Parking']`

---

### 3. **bookings**
Charging session reservations made by users.

```
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN 
    ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) 
    DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN 
    ('pending', 'paid', 'refunded')) 
    DEFAULT 'pending',
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_booking_time CHECK (end_time > start_time)
);

-- Indexes for efficient queries
CREATE INDEX idx_bookings_user_id ON bookings (user_id);
CREATE INDEX idx_bookings_station_id ON bookings (station_id);
CREATE INDEX idx_bookings_start_time ON bookings (start_time);
CREATE INDEX idx_bookings_status ON bookings (status);
```

**Purpose:**
- Store reservation information
- Track payment and booking status
- Prevent double-booking with time validation

**Access Control (RLS):**
- Users see only their own bookings
- Listers see bookings for their stations
- Only users can create bookings

**Workflow:**
```
pending → confirmed → in_progress → completed
     ↓        ↓             ↓            ↓
   (auto)  (lister)    (auto)   (user can review)
```

**Payment Status:**
- `pending` - Not yet paid
- `paid` - Payment confirmed
- `refunded` - Payment reversed

---

### 4. **reviews**
User ratings and feedback for charging stations.

```
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, station_id)  -- One review per user per station
);

-- Indexes for sorting/filtering
CREATE INDEX idx_reviews_station_id ON reviews (station_id);
CREATE INDEX idx_reviews_rating ON reviews (rating);
```

**Purpose:**
- Store user feedback and ratings
- Help other users choose stations
- Provide quality metrics for listers

**Access Control (RLS):**
- Anyone can see reviews
- Users can only review stations they've booked (completed)
- Users can edit/delete their own reviews

**Rating Scale:**
- 1 ⭐ - Poor
- 2 ⭐⭐ - Fair
- 3 ⭐⭐⭐ - Good
- 4 ⭐⭐⭐⭐ - Very Good
- 5 ⭐⭐⭐⭐⭐ - Excellent

---

## Data Relationships

### User → Profile (1:1)
```
auth.users.id = profiles.id
```
Automatic: New profile created when user signs up
RLS: Users see only their own profile

### Profile → Charging Stations (1:N)
```
profiles.id = charging_stations.lister_id
```
A lister can own many stations
When lister is deleted, their stations are cascade deleted

### Profile → Bookings (1:N)
```
profiles.id = bookings.user_id
```
A user can make many bookings
When user is deleted, their bookings are cascade deleted

### Charging Station → Bookings (1:N)
```
charging_stations.id = bookings.station_id
```
A station can have many bookings
When station is deleted, its bookings are cascade deleted

### Booking → Reviews (1:N)
```
bookings.id = reviews.booking_id
```
Optional: A booking may have one related review
Allows tracking which booking a review refers to

### Profile → Reviews (1:N)
```
profiles.id = reviews.user_id
```
A user can write many reviews
When user is deleted, their reviews are cascade deleted

### Charging Station → Reviews (1:N)
```
charging_stations.id = reviews.station_id
```
A station can have many reviews
When station is deleted, reviews stay (booking_id becomes NULL)

---

## Query Patterns

### Get All Active Stations
```sql
SELECT * FROM charging_stations 
WHERE is_active = true
ORDER BY created_at DESC;
```

### Get Stations in a City
```sql
SELECT * FROM charging_stations 
WHERE city = 'San Francisco' 
  AND state = 'CA'
  AND is_active = true;
```

### Get Stations Near Coordinates (10km radius)
```sql
SELECT * FROM charging_stations 
WHERE (
  SELECT atan2(
    sqrt(
      power(69.1 * (latitude - 37.7749), 2) + 
      power(69.1 * (longitude - (-122.4194)) * 
            cos(latitude / 57.3), 2)
    )
  ) * 1609.34
) < 10000  -- 10,000 meters
WHERE is_active = true;
```

### Get User's Bookings with Station Details
```sql
SELECT b.*, cs.name, cs.address, cs.city
FROM bookings b
JOIN charging_stations cs ON b.station_id = cs.id
WHERE b.user_id = $1
ORDER BY b.start_time DESC;
```

### Get Station's Reviews with User Info
```sql
SELECT r.*, p.full_name
FROM reviews r
JOIN profiles p ON r.user_id = p.id
WHERE r.station_id = $1
ORDER BY r.created_at DESC;
```

### Get Average Rating for a Station
```sql
SELECT 
  station_id,
  AVG(rating) as avg_rating,
  COUNT(*) as review_count
FROM reviews
WHERE station_id = $1
GROUP BY station_id;
```

---

## Triggers & Functions

### Auto-Create Profile on User Signup
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'user_type', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## Row Level Security (RLS) Policies

### Profiles (Data Privacy)
```sql
-- Users see only their own profile
CREATE POLICY "profiles_select_own" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

### Charging Stations (Public with Edit Restriction)
```sql
-- Everyone sees active stations
CREATE POLICY "charging_stations_select_active" 
  ON charging_stations FOR SELECT 
  USING (is_active = true);

-- Only listers can add stations
CREATE POLICY "charging_stations_insert_lister" 
  ON charging_stations FOR INSERT 
  WITH CHECK (
    auth.uid() = lister_id AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND user_type = 'lister'
    )
  );
```

### Bookings (User-Specific Access)
```sql
-- Users see only their own bookings
CREATE POLICY "bookings_select_user" 
  ON bookings FOR SELECT 
  USING (auth.uid() = user_id);

-- Listers see bookings for their stations
CREATE POLICY "bookings_select_lister" 
  ON bookings FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM charging_stations cs
      WHERE cs.id = station_id 
      AND cs.lister_id = auth.uid()
    )
  );
```

### Reviews (Public Read, Authenticated Write)
```sql
-- Everyone can see reviews
CREATE POLICY "reviews_select_all" 
  ON reviews FOR SELECT 
  TO authenticated 
  USING (true);

-- Only users who booked can review
CREATE POLICY "reviews_insert_user" 
  ON reviews FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.user_id = auth.uid() 
      AND b.station_id = reviews.station_id 
      AND b.status = 'completed'
    )
  );
```

---

## Constraints & Validation

| Table | Constraint | Rule |
|-------|-----------|------|
| profiles | user_type check | Must be 'lister' or 'user' |
| charging_stations | connector_type check | Specific EV standards only |
| charging_stations | power_output > 0 | Must be positive integer |
| charging_stations | price_per_hour ≥ 0 | Can't be negative |
| bookings | end_time > start_time | Must be valid time range |
| bookings | status check | Specific allowed statuses |
| bookings | payment_status check | Specific payment states |
| reviews | rating 1-5 | Must be integer between 1 and 5 |
| reviews | user_id + station_id | Unique together (one review per user per station) |

---

## Index Strategy

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| Primary Key | All | id | Fast lookups |
| `idx_charging_stations_location` | charging_stations | latitude, longitude | Geographic searches |
| `idx_charging_stations_city` | charging_stations | city, state | City-based filtering |
| `idx_bookings_user_id` | bookings | user_id | Find user's bookings |
| `idx_bookings_station_id` | bookings | station_id | Find station's bookings |
| `idx_bookings_start_time` | bookings | start_time | Time-based queries |
| `idx_bookings_status` | bookings | status | Status filtering |
| `idx_reviews_station_id` | reviews | station_id | Station's reviews |
| `idx_reviews_rating` | reviews | rating | Average rating queries |

---

## Performance Considerations

1. **Indexing:** All frequently queried columns are indexed
2. **Foreign Keys:** Referential integrity prevents orphaned data
3. **Constraints:** Type safety at database level
4. **Pagination:** Always use LIMIT/OFFSET in queries
5. **RLS Policies:** Automatically filter based on user

---

## Backup & Recovery

- **Automatic:** Supabase backs up daily (check plan)
- **Manual:** Export via Supabase UI or `pg_dump`
- **Retention:** Free tier keeps 7 days; paid plans keep 30 days

---

## Scaling Considerations

For high-traffic scenarios:
- Add caching (Redis) for frequently read data
- Denormalize average ratings to station table
- Archive old bookings to separate table
- Use read replicas for reporting

Current schema works well for MVP and small-to-medium scale.

---

**Last Updated:** 2026-04-10  
**Version:** 1.0  
**Tested With:** PostgreSQL 14+, Supabase latest
