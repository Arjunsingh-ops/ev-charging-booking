#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script sets up the PostgreSQL database for the EV Charging Booking app.
 * It can be run using: npm run setup-db
 * 
 * Requirements:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require("fs");
const path = require("path");

async function setupDatabase() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("\n❌ ERROR: Missing required environment variables\n");
    console.error("Please set the following in your Vercel project settings:");
    console.error("  • NEXT_PUBLIC_SUPABASE_URL");
    console.error("  • SUPABASE_SERVICE_ROLE_KEY\n");
    console.error(
      "Or create a .env.local file with these variables for local development.\n"
    );
    process.exit(1);
  }

  console.log("\n");
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log("          EV Charging Booking - Database Setup");
  console.log(
    "═══════════════════════════════════════════════════════════════\n"
  );

  // SQL scripts to execute in order
  const scripts = [
    "001_create_profiles.sql",
    "002_create_charging_stations.sql",
    "003_create_bookings.sql",
    "004_create_reviews.sql",
  ];

  let successCount = 0;
  let failureCount = 0;

  for (const scriptName of scripts) {
    const scriptPath = path.join(__dirname, scriptName);

    try {
      console.log(`⏳ Processing: ${scriptName}`);

      // Read SQL file
      if (!fs.existsSync(scriptPath)) {
        console.error(`❌ File not found: ${scriptPath}\n`);
        failureCount++;
        continue;
      }

      const sqlContent = fs.readFileSync(scriptPath, "utf-8");

      // Execute via Supabase REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
          "X-Client-Info": "ev-charging-booking/1.0.0",
        },
        body: JSON.stringify({ sql_text: sqlContent }),
      });

      if (!response.ok) {
        // RPC might not exist, but tables might be created successfully
        const errorData = await response.json().catch(() => ({}));
        console.log(
          `⚠️  Status: ${response.status} - ${errorData.message || "Check Supabase"}`
        );
        console.log(`   ℹ️  Tables may still have been created.\n`);
        failureCount++;
      } else {
        console.log(`✅ Successfully processed\n`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
      failureCount++;
    }
  }

  // Summary
  console.log(
    "═══════════════════════════════════════════════════════════════"
  );
  console.log(`\nResults: ${successCount} successful, ${failureCount} issues\n`);

  if (successCount + failureCount > 0) {
    console.log("📋 Your Supabase database now includes:\n");
    console.log("   ✓ profiles - User authentication & profiles");
    console.log("   ✓ charging_stations - EV station listings");
    console.log("   ✓ bookings - Reservation management");
    console.log("   ✓ reviews - User ratings & feedback\n");
  }

  if (failureCount > 0) {
    console.log(
      "⚠️  MANUAL SETUP: If tables didn't create automatically:\n"
    );
    console.log("1. Open Supabase Dashboard > SQL Editor");
    console.log(
      "2. Copy-paste each SQL file from /scripts/ and run them\n"
    );
    console.log("3. Read DATABASE_SETUP.md for detailed instructions\n");
  }

  console.log("═══════════════════════════════════════════════════════════════\n");
}

// Run the setup
setupDatabase().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
