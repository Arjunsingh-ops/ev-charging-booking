# Troubleshooting Guide - EV Charging Booking Database

## Common Issues & Solutions

### 1. "Tenant or user not found" Error

**Symptoms:**
- Can't run SQL scripts
- Database setup fails
- Getting 401/403 errors

**Causes:**
- Environment variables not set correctly
- Service role key is invalid or expired
- Supabase project is paused or deleted

**Solutions:**

**Step 1: Verify Environment Variables**
```bash
# In your Vercel project settings or .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sbp_xxxxx... (secret key, don't commit!)
```

**Step 2: Check Service Role Key**
1. Go to Supabase Dashboard
2. Click **Settings > API**
3. Look for "Service Role Key" (starts with `sbp_`)
4. Copy it exactly (watch for spaces)
5. Update in Vercel > Settings > Environment Variables

**Step 3: Restart Services**
- Restart your dev server: `npm run dev`
- Redeploy on Vercel if deployed

---

### 2. "Tables Don't Exist" Error

**Symptoms:**
- App crashes when trying to access database
- Getting "relation does not exist" errors
- Table Editor shows no tables

**Causes:**
- SQL scripts weren't executed
- Database initialization failed
- Wrong database selected

**Solutions:**

**Method A: Run SQL Scripts Manually**
1. Open Supabase Dashboard
2. Click **SQL Editor** → **New Query**
3. Copy entire contents of `scripts/001_create_profiles.sql`
4. Paste into query editor
5. Click **Run**
6. Repeat for files 002, 003, and 004

**Method B: Use Command Line**
```bash
npm run setup-db
```
(Requires `.env.local` with credentials)

**Method C: Verify in Table Editor**
1. Go to Supabase Dashboard
2. Click **Table Editor** (left sidebar)
3. You should see:
   - profiles
   - charging_stations
   - bookings
   - reviews

If tables are missing, run SQL scripts from Method A.

---

### 3. "Permission Denied" Errors

**Symptoms:**
- Can read data but can't create/update
- Getting RLS policy violations
- Users can see everyone's data

**Causes:**
- Row Level Security (RLS) policies not set
- User not authenticated
- RLS policies are too restrictive

**Solutions:**

**Check RLS Policies:**
1. Go to Supabase Dashboard
2. Click **Authentication > Policies**
3. For each table, verify RLS is enabled (blue toggle)
4. Check policies exist:
   - `profiles_select_own`
   - `charging_stations_select_active`
   - `bookings_select_user`
   - `reviews_select_all`

**Fix Policy Issues:**
- If policies are missing, re-run the SQL scripts
- Policies are created by the SQL files automatically

**Test RLS:**
```javascript
// In your app, check if user is authenticated:
const { data: { user } } = await supabase.auth.getUser();
console.log("Current user:", user?.id);

// Try to fetch profiles:
const { data, error } = await supabase
  .from("profiles")
  .select("*");

if (error) console.error("RLS Error:", error.message);
```

---

### 4. "Unique Constraint Violation" Error

**Symptoms:**
- Can't sign up (profile creation fails)
- Can't leave second review on same station

**Causes:**
- User profile already exists
- Duplicate review for station
- Constraint violations

**Solutions:**

**For Profile Duplicates:**
- User already signed up? Just sign in instead
- Delete user from Auth and try again:
  1. Go to Supabase > Authentication > Users
  2. Delete the user
  3. Sign up again

**For Review Duplicates:**
- Users can only leave ONE review per station
- Edit existing review instead of creating new one
- Or delete and create new review:
```javascript
// Delete old review
const { error } = await supabase
  .from("reviews")
  .delete()
  .eq("user_id", userId)
  .eq("station_id", stationId);

// Then create new one
```

---

### 5. "Foreign Key Constraint" Error

**Symptoms:**
- Can't create booking (station reference fails)
- Can't create review (booking reference fails)

**Causes:**
- Referenced station/booking doesn't exist
- Station/booking was deleted
- Wrong ID passed

**Solutions:**

**Debug Foreign Keys:**
```javascript
// Before creating booking, verify station exists:
const { data: station } = await supabase
  .from("charging_stations")
  .select("id")
  .eq("id", stationId)
  .single();

if (!station) {
  console.error("Station not found!");
  return;
}

// Now create booking safely
const { data, error } = await supabase
  .from("bookings")
  .insert([{
    user_id: userId,
    station_id: stationId,
    start_time: new Date(),
    end_time: new Date(Date.now() + 3600000),
    total_price: 25.00
  }]);
```

---

### 6. "Invalid Input" / Validation Errors

**Symptoms:**
- Data validation fails
- Check constraints violated
- Type errors

**Causes:**
- Invalid enum values
- Wrong data types
- Missing required fields

**Solutions:**

**Valid Connector Types:**
```
'Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla'
```

**Valid User Types:**
```
'lister', 'user'
```

**Valid Booking Status:**
```
'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
```

**Valid Payment Status:**
```
'pending', 'paid', 'refunded'
```

**Valid Rating:**
```
Integer from 1 to 5
```

**Example Safe Insert:**
```javascript
const { data, error } = await supabase
  .from("charging_stations")
  .insert([{
    lister_id: userId,
    name: "Fast Charger #1",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    zip_code: "62701",
    connector_type: "Type 2",  // Valid enum
    power_output: 50,           // kW
    price_per_hour: 2.50,       // decimal
    is_active: true             // boolean
  }]);
```

---

### 7. "Connection Refused" Error

**Symptoms:**
- Can't connect to database at all
- Getting network timeouts
- Connection errors on startup

**Causes:**
- Supabase project is paused
- Network firewall blocking connection
- Wrong URL configured

**Solutions:**

**Check Project Status:**
1. Go to Supabase Dashboard
2. Check if project shows "Paused"
3. If paused, click **Resume**

**Verify URL:**
1. Settings > API
2. Copy the exact Project URL
3. Paste in `NEXT_PUBLIC_SUPABASE_URL`

**Check Network:**
```bash
# Test if you can reach Supabase
curl https://your-project.supabase.co/rest/v1

# Should return: "404 Not Found" (expected)
```

---

### 8. "Authentication Failed" on Signup/Login

**Symptoms:**
- Can't create new account
- Can't sign in
- Getting auth errors

**Causes:**
- Email already registered
- Password validation failed
- Auth isn't enabled

**Solutions:**

**Enable Email Auth:**
1. Go to Supabase Dashboard
2. Click **Authentication > Providers**
3. Check "Email" is enabled (blue toggle)
4. Click **Save**

**Check Email Provider:**
1. Go to **Authentication > Email Templates**
2. Verify templates are configured

**Test Auth:**
```javascript
// Signup
const { error } = await supabase.auth.signUp({
  email: "test@example.com",
  password: "SecurePassword123!", // 6+ chars, strong
  options: {
    data: {
      user_type: 'user' // or 'lister'
    }
  }
});

// Login
const { error } = await supabase.auth.signInWithPassword({
  email: "test@example.com",
  password: "SecurePassword123!"
});
```

---

### 9. Environment Variables Not Loading

**Symptoms:**
- `process.env.NEXT_PUBLIC_SUPABASE_URL` is undefined
- Can't load environment variables locally
- Variables work in Vercel but not locally

**Solutions:**

**For Local Development:**

1. Create `.env.local` in project root:
```bash
touch .env.local
```

2. Add environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Restart dev server:
```bash
npm run dev
```

4. Verify it loaded:
```javascript
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL); // Should print URL
```

**For Vercel Deployment:**

1. Go to Vercel Dashboard
2. Select your project
3. Click **Settings > Environment Variables**
4. Add/update the variables
5. Redeploy (git push or redeploy button)

---

### 10. Rate Limiting / Too Many Requests

**Symptoms:**
- Getting 429 errors
- "Too many requests" messages
- Requests being blocked

**Causes:**
- Making too many requests rapidly
- Free tier rate limits exceeded
- DDoS protection triggered

**Solutions:**

**Reduce Request Frequency:**
```javascript
// Bad: Multiple rapid requests
for (let i = 0; i < 100; i++) {
  await supabase.from("stations").select();
}

// Good: Batch requests
const { data } = await supabase
  .from("stations")
  .select()
  .limit(100);
```

**Add Request Debouncing:**
```javascript
import { debounce } from 'lodash';

const fetchStations = debounce(async () => {
  const { data } = await supabase
    .from("charging_stations")
    .select();
}, 500);
```

**Upgrade Plan:**
- Free tier has rate limits
- Upgrade to paid plan if needed
- Contact Supabase support for higher limits

---

## Getting More Help

### Official Resources
- **Supabase Docs:** https://supabase.com/docs
- **Supabase Forum:** https://github.com/supabase/supabase/discussions
- **Next.js Docs:** https://nextjs.org/docs

### Debugging Tools
```javascript
// Enable debug logging in Supabase client
const supabase = createBrowserClient(url, key, {
  db: { schema: 'public' },
  auth: { autoRefreshToken: true, persistSession: true },
  global: { headers: { 'x-debug': 'true' } } // Extra debug info
});

// Check auth state
const { data: { session } } = await supabase.auth.getSession();
console.log("Current session:", session);

// Check user
const { data: { user } } = await supabase.auth.getUser();
console.log("Current user:", user);
```

### Useful Queries to Test
```javascript
// Check if you can connect
const { data, error } = await supabase
  .from("profiles")
  .select("count()", { count: "exact", head: true });
console.log("Connection OK:", !error, "Count:", data);

// Check if auth is working
const { data: { user } } = await supabase.auth.getUser();
console.log("Authenticated:", !!user);

// Check RLS
const { data, error } = await supabase
  .from("bookings")
  .select("*")
  .limit(1);
console.log("RLS working:", error ? error.code : "OK");
```

---

## Quick Checklist

- [ ] Environment variables set in Vercel
- [ ] SQL scripts executed in Supabase
- [ ] Tables visible in Table Editor
- [ ] RLS policies enabled
- [ ] Auth provider enabled
- [ ] Service role key is correct
- [ ] Project is not paused
- [ ] User authentication is working
- [ ] Local .env.local file set for dev

If all above are checked and issues persist, contact Supabase support with error details.
