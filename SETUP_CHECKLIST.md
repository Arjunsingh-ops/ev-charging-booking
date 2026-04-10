# ✅ EV Charging Booking - Setup Checklist

## Phase 1: Environment Setup

- [ ] **Create Supabase Account**
  - Go to https://supabase.com/
  - Click "Start for free"
  - Create account and project

- [ ] **Get Supabase Credentials**
  - Go to Supabase Dashboard
  - Click Settings > API
  - Copy: Project URL
  - Copy: Anon Key
  - Copy: Service Role Key (keep secret!)

- [ ] **Set Environment Variables in Vercel**
  - Go to Vercel Dashboard > Project > Settings
  - Click "Environment Variables"
  - Add:
    - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxx.supabase.co`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...`
    - `SUPABASE_SERVICE_ROLE_KEY` = `sbp_...`

- [ ] **Create .env.local for Local Development** (optional)
  ```bash
  touch .env.local
  # Add same variables as above
  ```

---

## Phase 2: Database Creation

### Choose One Method:

#### ✨ **Method A: Manual SQL (Recommended)**
- [ ] Open Supabase Dashboard
- [ ] Click **SQL Editor** > **New Query**
- [ ] Copy from `scripts/001_create_profiles.sql`
- [ ] Paste and click **Run**
- [ ] Repeat for files:
  - [ ] `scripts/002_create_charging_stations.sql`
  - [ ] `scripts/003_create_bookings.sql`
  - [ ] `scripts/004_create_reviews.sql`
- [ ] Go to **Table Editor** and verify 4 tables exist:
  - [ ] profiles
  - [ ] charging_stations
  - [ ] bookings
  - [ ] reviews

#### ⚡ **Method B: Command Line**
- [ ] Have `.env.local` set with credentials
- [ ] Run: `npm run setup-db`
- [ ] See success message
- [ ] Verify tables in Supabase Table Editor

#### 🚀 **Method C: Vercel Deployment**
- [ ] Commit changes to Git
- [ ] Environment variables set in Vercel
- [ ] Deploy (auto or manual)
- [ ] Run setup hook if configured

---

## Phase 3: Security & Policies

- [ ] **Enable RLS on All Tables**
  - Go to Supabase > Authentication > Policies
  - For each table: Enable RLS (blue toggle):
    - [ ] profiles
    - [ ] charging_stations
    - [ ] bookings
    - [ ] reviews

- [ ] **Verify Policies Exist**
  - Check that policies are listed:
    - [ ] profiles_select_own, profiles_insert_own, etc.
    - [ ] charging_stations_select_active, etc.
    - [ ] bookings_select_user, bookings_select_lister, etc.
    - [ ] reviews_select_all, reviews_insert_user, etc.

- [ ] **Enable Email Auth Provider**
  - Go to Supabase > Authentication > Providers
  - Enable Email (blue toggle):
    - [ ] Email authentication enabled

---

## Phase 4: Testing & Verification

- [ ] **Start Dev Server**
  ```bash
  npm run dev
  ```
  - [ ] Server starts without errors
  - [ ] No console errors

- [ ] **Test User Signup**
  - Visit http://localhost:3000
  - Click "Sign Up"
  - [ ] Create test account with email
  - [ ] Verify email (if required)
  - [ ] Successfully logged in

- [ ] **Verify Profile Created**
  - Go to Supabase Dashboard
  - Click **Table Editor** > **profiles**
  - [ ] New row appears with your test email
  - [ ] user_type is set (default: 'user')

- [ ] **Test Database Access**
  - Logged in as user
  - Try to access dashboard
  - [ ] No "permission denied" errors
  - [ ] Can see user data

- [ ] **Test RLS Policies**
  - Create a test booking/review
  - [ ] Can see own data
  - [ ] Cannot see other users' private data
  - [ ] Can see public data (active stations, reviews)

---

## Phase 5: Production Readiness

- [ ] **Review Code Quality**
  - Run: `npm run lint`
  - [ ] No critical errors
  - [ ] Fix any warnings

- [ ] **Build for Production**
  - Run: `npm run build`
  - [ ] Build succeeds
  - [ ] No build errors

- [ ] **Environment Variables for Prod**
  - Verify Vercel has all needed env vars
  - [ ] NEXT_PUBLIC_SUPABASE_URL set
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set
  - [ ] SUPABASE_SERVICE_ROLE_KEY set
  - [ ] No sensitive keys in code

- [ ] **Supabase Project Status**
  - Check Supabase Dashboard
  - [ ] Project is not paused
  - [ ] Project has sufficient quota
  - [ ] Backup settings configured (if needed)

- [ ] **Performance Check**
  - Run: `npm run start`
  - [ ] App loads quickly
  - [ ] Database queries are fast
  - [ ] No N+1 query problems

---

## Phase 6: Deployment

- [ ] **Push to GitHub**
  ```bash
  git add -A
  git commit -m "Database setup complete"
  git push
  ```

- [ ] **Deploy to Vercel**
  - Go to Vercel Dashboard
  - [ ] Select your project
  - [ ] Click **Deploy**
  - [ ] Deployment succeeds
  - [ ] No build errors

- [ ] **Test Production**
  - Visit your production URL
  - [ ] App loads
  - [ ] Signup works
  - [ ] Database connections work
  - [ ] No errors in logs

- [ ] **Monitor Production**
  - Check Supabase Logs
  - [ ] No database errors
  - [ ] No auth errors
  - [ ] Performance is good

---

## Phase 7: Ongoing Maintenance

- [ ] **Weekly Checks**
  - [ ] Check Supabase project logs
  - [ ] Monitor rate limits
  - [ ] Review error tracking

- [ ] **Monthly Reviews**
  - [ ] Check Supabase billing
  - [ ] Review performance metrics
  - [ ] Update dependencies
  - [ ] Backup important data

- [ ] **Before Major Updates**
  - [ ] Test in staging environment
  - [ ] Backup production database
  - [ ] Have rollback plan

---

## Troubleshooting Checklist

If something goes wrong, check:

- [ ] **Environment Variables**
  - [ ] NEXT_PUBLIC_SUPABASE_URL is set
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY is set
  - [ ] SUPABASE_SERVICE_ROLE_KEY is set (for setup)
  - [ ] No extra spaces or typos

- [ ] **Database Tables**
  - [ ] Tables exist in Supabase
  - [ ] RLS is enabled on all tables
  - [ ] Policies are correct

- [ ] **Authentication**
  - [ ] Email provider is enabled
  - [ ] Auth is configured correctly
  - [ ] JWT secret is set

- [ ] **Network/Connectivity**
  - [ ] Can reach Supabase URL
  - [ ] No firewall blocks
  - [ ] Internet connection is stable

- [ ] **Code Issues**
  - [ ] No syntax errors
  - [ ] Imports are correct
  - [ ] No typos in code

- [ ] **Browser Issues**
  - [ ] Clear browser cache
  - [ ] Try incognito window
  - [ ] Check browser console for errors

---

## Resources

**Quick Help:**
- 📖 Read: `QUICK_START.md`
- 🆘 Read: `TROUBLESHOOTING.md` (for specific errors)
- 📚 Read: `DATABASE_SETUP.md` (detailed info)
- 💡 Read: `DATABASE_FIX_SUMMARY.md` (overview)

**Official Docs:**
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs

**Community:**
- Supabase Discord: https://discord.supabase.com
- Next.js Discord: https://discord.gg/nextjs

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete / Working |
| ⏳ | In Progress |
| ❌ | Not Started / Failed |
| ⚠️ | Needs Attention |
| 💡 | Optional / Nice-to-have |

---

## Final Verification

Before declaring setup complete, verify:

```javascript
// This is what should work after setup:

1. ✅ User signup creates profile automatically
2. ✅ User login retrieves their profile
3. ✅ Lister can create charging stations
4. ✅ User can see active stations (RLS)
5. ✅ User can book stations
6. ✅ User can review stations (after booking)
7. ✅ Users see only their bookings (RLS)
8. ✅ Users see only public data (reviews)
9. ✅ No unauthorized access (RLS blocking)
10. ✅ Database performs well (indexes working)
```

---

## Completion

When all phases are complete:

🎉 **You're ready to deploy!**

Your database is:
- ✅ Set up correctly
- ✅ Secured with RLS
- ✅ Tested and verified
- ✅ Ready for users

Start building features! 🚀

---

**Last Updated:** 2026-04-10  
**Version:** 1.0  
**Project:** ev-charging-booking
