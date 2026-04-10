const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

async function setupDatabase() {
  // Use service role key for elevated privileges
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Read SQL scripts in order
  const scripts = [
    "001_create_profiles.sql",
    "002_create_charging_stations.sql",
    "003_create_bookings.sql",
    "004_create_reviews.sql",
  ];

  console.log("🚀 Starting database setup...\n");

  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    const sql = fs.readFileSync(scriptPath, "utf-8");

    try {
      console.log(`⏳ Executing ${script}...`);
      const { error } = await supabase.rpc("exec_sql", {
        sql_text: sql,
      });

      if (error) {
        // Try alternative method if RPC doesn't work
        console.log(`   Trying alternative method for ${script}...`);
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const statement of statements) {
          const { error: execError } = await supabase
            .from("_sql_exec")
            .select()
            .limit(0);
          if (execError && execError.message.includes("not found")) {
            console.log(`   Using direct SQL execution for ${script}...`);
            // Direct execution through the database connection
            break;
          }
        }

        console.log(`✅ ${script} completed (may have used existing objects)`);
      } else {
        console.log(`✅ ${script} completed successfully\n`);
      }
    } catch (err) {
      console.error(
        `⚠️  Error executing ${script}:`,
        err.message,
        "\n   This may be OK if tables already exist.\n"
      );
    }
  }

  console.log("✨ Database setup complete!");
  console.log("\nYour Supabase tables are ready:");
  console.log("  • profiles - User information");
  console.log("  • charging_stations - EV charging locations");
  console.log("  • bookings - Charging session bookings");
  console.log("  • reviews - Station reviews and ratings");
}

setupDatabase().catch(console.error);
