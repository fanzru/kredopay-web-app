import { db } from "./lib/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function run() {
  if (!db) {
    console.error("❌ Database connection failed (db object is null)");
    process.exit(1);
  }

  try {
    console.log("🔄 Reading migration file...");
    const migrationPath = path.join(
      process.cwd(),
      "migrations",
      "add-kyc-verifications.sql"
    );
    const migrationSql = fs.readFileSync(migrationPath, "utf-8");

    console.log("🚀 Executing migration...");
    // Split statements simply by semicolon to be safer with simple drivers
    const statements = migrationSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      // Skip empty or comment-only lines if split left garbage
      if (!statement) continue;

      console.log(`▶️  Running statement: ${statement.substring(0, 50)}...`);
      await db.execute(sql.raw(statement));
    }

    console.log("✅ Migration completed successfully!");
  } catch (e) {
    console.error("❌ Migration failed:", e);
  }

  process.exit(0);
}

run();
