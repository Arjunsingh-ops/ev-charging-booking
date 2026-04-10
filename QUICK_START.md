# Quick Start - Fix Your Database

## 🚨 The Problem

The database tables aren't being created automatically due to authentication issues with the Supabase integration.

## ✅ The Solution

You have **three options** to fix this:

---

## Option 1: Manual Setup (Easiest)

1. **Open your Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Run the SQL scripts**
   - Click **SQL Editor** (left sidebar)
   - Click **New Query**
   - Copy the entire contents of `/scripts/001_create_profiles.sql`
   - Click **Run**
   - Repeat for files 002, 003, and 004

3. **Verify in Table Editor**
   - Click **Table Editor** (left sidebar)
   - You should see 4 new tables:
     - `profiles`
     - `charging_stations`
     - `bookings`
     - `reviews`

**Time:** ~5 minutes

---

## Option 2: Command Line Setup

If you have Node.js installed locally:

```bash
# Navigate to your project directory
cd ev-charging-booking

# Set environment variables (create .env.local if needed)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run the setup script
npm run setup-db
```

**Requirements:** 
- Node.js installed
- `.env.local` file with Supabase credentials

**Time:** ~2 minutes

---

## Option 3: Deploy and Auto-Setup (Vercel)

If you deploy to Vercel:

1. **Push to GitHub**
   ```bash
   git add -A
   git commit -m "Database setup scripts"
   git push
   ```

2. **Verify Environment Variables in Vercel**
   - Go to Vercel project settings
   - Click **Settings > Environment Variables**
   - Verify these are set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **Create a Deployment Hook** (optional)
   - Set up a hook to run `npm run setup-db` on deployment

---

## 🔍 How to Find Your Supabase Credentials

### NEXT_PUBLIC_SUPABASE_URL
1. Go to Supabase Dashboard
2. Click **Settings > API**
3. Copy the **Project URL**

### SUPABASE_SERVICE_ROLE_KEY
1. Go to Supabase Dashboard
2. Click **Settings > API**
3. Copy the **Service Role Key** (keep this secret!)

### NEXT_PUBLIC_SUPABASE_ANON_KEY
1. Go to Supabase Dashboard
2. Click **Settings > API**
3. Copy the **Anon Key**

---

## ✨ After Setup

Once tables are created:

1. **Test the Connection**
   ```bash
   npm run dev
   ```
   - Visit http://localhost:3000
   - Try signing up as a test user
   - Check Supabase **Table Editor > profiles** to see your new profile

2. **Start Building**
   - Create charging stations
   - Make bookings
   - Leave reviews

---

## 🆘 Troubleshooting

### "Table already exists" error
✅ **This is OK!** The SQL scripts use `CREATE TABLE IF NOT EXISTS`, so they can be run multiple times safely.

### "Permission denied" error
- Check that all environment variables are set correctly
- Ensure the service role key has the correct permissions
- Try again after 30 seconds (Supabase sometimes needs time to sync)

### "NEXT_PUBLIC_SUPABASE_URL is undefined"
- Create a `.env.local` file in your project root
- Add: `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co`
- Restart your dev server (`npm run dev`)

### Still stuck?
1. Read **DATABASE_SETUP.md** for detailed info
2. Check Supabase documentation: https://supabase.com/docs
3. Verify your Supabase project is active (not paused)

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `scripts/001_create_profiles.sql` | User profiles table |
| `scripts/002_create_charging_stations.sql` | Charging station listings |
| `scripts/003_create_bookings.sql` | Booking reservations |
| `scripts/004_create_reviews.sql` | User reviews & ratings |
| `scripts/init-database.js` | Auto setup script |
| `DATABASE_SETUP.md` | Detailed setup guide |
| `QUICK_START.md` | This file |

---

## 🎉 You're All Set!

Once the tables are created, your app is ready to use. The database will automatically:
- ✅ Create user profiles on signup
- ✅ Enforce security policies via RLS
- ✅ Track bookings and reviews
- ✅ Prevent unauthorized access

Happy charging! ⚡

---

**Need help?** Check the DATABASE_SETUP.md file or review the SQL scripts in `/scripts/` directory.
