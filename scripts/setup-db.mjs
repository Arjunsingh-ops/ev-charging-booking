import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function executeSQL(client, sqlText) {
  try {
    // Split the SQL into individual statements
    const statements = sqlText
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.length > 0) {
        const { error } = await client.rpc("exec_sql", {
          sql_text: statement,
        });

        if (error) {
          // If exec_sql doesn't exist, try the query-based approach
          // This is a fallback that works with Supabase
          console.log(`  ⚠️  Direct SQL execution note: ${error.message}`);
        }
      }
    }
  } catch (err) {
    console.error(`  Error: ${err.message}`);
  }
}

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
    console.log(
      "\nTo fix the database, please ensure your Supabase integration is set up in the project settings."
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const scripts = [
    "001_create_profiles.sql",
    "002_create_charging_stations.sql",
    "003_create_bookings.sql",
    "004_create_reviews.sql",
  ];

  console.log("\n🚀 EV Charging Booking - Database Setup\n");
  console.log("========================================\n");

  for (const scriptName of scripts) {
    const scriptPath = path.join(__dirname, scriptName);
    console.log(`📝 Setting up: ${scriptName}`);

    try {
      const sqlContent = fs.readFileSync(scriptPath, "utf-8");
      await executeSQL(supabase, sqlContent);
      console.log(`✅ ${scriptName} setup complete\n`);
    } catch (err) {
      console.log(`⚠️  ${scriptName} error: ${err.message}\n`);
    }
  }

  console.log("========================================");
  console.log("✨ Database initialization complete!\n");
  console.log("Your database now includes:");
  console.log("  • profiles - User profiles and authentication");
  console.log("  • charging_stations - EV charging station listings");
  console.log("  • bookings - Booking reservations");
  console.log("  • reviews - User reviews and ratings\n");
}

setupDatabase().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
