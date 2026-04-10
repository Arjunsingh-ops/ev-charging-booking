# Database Setup Guide for EV Charging Booking

## Overview

The EV Charging Booking app uses **Supabase** as the backend database. This guide will help you properly set up your database tables and Row Level Security (RLS) policies.

## Prerequisites

- Supabase account (free tier is fine)
- Supabase project created
- Environment variables configured

## Step 1: Check Your Environment Variables

Ensure you have these environment variables set in your Vercel project settings or `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
POSTGRES_URL=postgres://user:password@host:port/database
SUPABASE_JWT_SECRET=your-jwt-secret
```

> **Note:** The service role key is needed for database initialization. Find it in Supabase Settings > API > Service Role Key.

## Step 2: Manual Database Setup (Recommended)

If the automatic scripts don't work, set up the database manually in Supabase:

### Via Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of each SQL file from `/scripts/` in order:
   - `001_create_profiles.sql`
   - `002_create_charging_stations.sql`
   - `003_create_bookings.sql`
   - `004_create_reviews.sql`
5. Run each query

### Tables Created

#### 1. **profiles** (User Information)
- User profiles extending Supabase Auth
- Tracks user type (lister or user)
- Includes RLS policies for data privacy

#### 2. **charging_stations** (Station Listings)
- Created by listers (station owners)
- Contains location, pricing, and availability info
- Includes location indexes for fast lookups

#### 3. **bookings** (Reservations)
- User reservations at charging stations
- Tracks booking status and payment info
- Includes indexes for efficient queries

#### 4. **reviews** (Ratings & Feedback)
- User reviews for charging stations
- One review per user per station (unique constraint)
- Only authenticated users can view/create

## Step 3: Verify RLS Policies

After running the SQL scripts, verify Row Level Security policies are enabled:

1. In Supabase, go to **Authentication > Policies**
2. For each table, confirm that RLS is enabled (gray toggle = disabled, blue = enabled)
3. You should see policies like:
   - `profiles_select_own` - Users see only their profile
   - `charging_stations_select_active` - Anyone sees active stations
   - `bookings_select_user` - Users see only their bookings
   - `reviews_select_all` - Anyone sees reviews

## Step 4: Test the Connection

To verify everything is set up correctly:

1. Run the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Try signing up as a new user
4. Check Supabase dashboard > **Table Editor** to see the new profile created

## Common Issues & Fixes

### "Tenant or user not found"
- **Cause:** Supabase integration not properly authenticated
- **Fix:** Check environment variables in Vercel project settings
- **Fix:** Ensure service role key is correct and has proper permissions

### "Tables don't exist"
- **Cause:** SQL scripts weren't executed
- **Fix:** Run the SQL scripts manually in Supabase SQL Editor (see Step 2)

### "Permission denied" errors
- **Cause:** RLS policies are blocking access
- **Fix:** Verify policies are set correctly (see Step 3)
- **Fix:** Ensure user is authenticated when making requests

### Duplicate table errors
- **Cause:** Tables already exist from a previous run
- **Fix:** This is OK - the scripts use `CREATE TABLE IF NOT EXISTS`
- **Fix:** You can ignore these errors

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│          Next.js App (Client/Server)        │
├─────────────────────────────────────────────┤
│  • Authentication (Supabase Auth)           │
│  • API Routes (Next.js API)                 │
│  • Components (Radix UI + Tailwind)         │
├─────────────────────────────────────────────┤
│          Supabase (Backend)                 │
├─────────────────────────────────────────────┤
│  • Auth Service (JWT tokens)                │
│  • PostgreSQL Database                      │
│  • Row Level Security (RLS)                 │
│  • Real-time Subscriptions                  │
└─────────────────────────────────────────────┘
```

## Database Relationships

```
auth.users
    ↓
profiles (extends auth.users)
    ├── charging_stations (lister_id)
    │   ├── bookings (station_id)
    │   │   └── reviews (booking_id)
    │   └── reviews (station_id)
    └── bookings (user_id)
        └── reviews (user_id)
```

## Next Steps

1. ✅ Set up environment variables
2. ✅ Create database tables (SQL scripts)
3. ✅ Enable RLS policies
4. 🚀 Test the app
5. 📝 Build your features

## Support

If you encounter issues:

1. Check the Supabase dashboard for error details
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is on a paid plan if using advanced features
4. Check the browser console for client-side errors
5. Check server logs for backend errors

---

**Last Updated:** 2026-04-10  
**Tested With:** Supabase latest, Next.js 14.2, Node.js 18+
