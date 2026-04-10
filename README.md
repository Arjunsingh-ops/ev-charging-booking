# ChargeConnect ⚡

**ChargeConnect** is a modern, high-performance marketplace platform connecting Electric Vehicle (EV) drivers with charging station owners. Designed for the modern grid, the platform offers a sleek, startup-ready animated UI and a seamless user experience.

## ✨ Features

- **For EV Drivers:**
  - 📍 **Real-time Availability:** Discover charging stations near you instantly.
  - 🕒 **Flexible Scheduling:** Book sessions that fit your daily flow.
  - 💳 **Secure Payments:** Encrypted transactions with transparent pricing.
- **For Station Owners:**
  - 📈 **List Your Station:** Add your charger details, photos, and availability.
  - 📅 **Manage Bookings:** Oversee your schedule and reservations easily.
  - 💰 **Earn Revenue:** Automated payouts for completed charging sessions.
- **Premium User Interface:**
  - Dark mode glassmorphism UI using standard modern design principles.
  - Physics-based smooth scroll and layout animations.

## 🚀 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Backend / Auth:** [Supabase](https://supabase.com/)

---

## 🛠️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/Arjunsingh-ops/ev-charging-booking.git
cd ev-charging-booking
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Database & Environment Variables

**⚡ New Users:** Start with **[QUICK_START.md](./QUICK_START.md)** for a 5-minute setup guide!

For detailed setup instructions:
- 📖 **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Step-by-step checklist
- 📚 **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Complete technical guide
- 🔧 **[DATABASE_FIX_SUMMARY.md](./DATABASE_FIX_SUMMARY.md)** - Overview & fixes

**Quick Setup:**
1. Create a Supabase account at https://supabase.com
2. Get your credentials from **Settings > API**
3. Add to Vercel environment variables (or create `.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
4. Setup database (choose one method in QUICK_START.md)

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result!

---

## 📖 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **[QUICK_START.md](./QUICK_START.md)** | Fast setup (3 methods) | 5 min |
| **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** | Full verification checklist | 10 min |
| **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** | Complete technical guide | 15 min |
| **[DATABASE_FIX_SUMMARY.md](./DATABASE_FIX_SUMMARY.md)** | Overview & what was fixed | 10 min |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Solve 10+ common issues | As needed |

### If Something Goes Wrong
See **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for solutions to:
- "Tenant or user not found" errors
- Database table issues
- Permission errors
- Authentication problems
- And 6+ more scenarios 

## 📂 Project Structure

- `/app`: Contains all Next.js application routes (Pages, Layouts).
- `/components`: Reusable UI components (buttons, cards, badges).
- `/lib/supabase`: Supabase database clients and authentication middleware.
- `/hooks`: Custom React hooks (e.g., `use-mobile.ts`).
- `/scripts`: SQL scripts to initialize the Supabase database.

---
*Built for the modern grid.*
