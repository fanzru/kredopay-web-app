import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Use DIRECT_URL for better compatibility with Drizzle
// pgbouncer (DATABASE_URL) can have issues with some operations
const connectionString =
  process.env.DIRECT_URL || process.env.DATABASE_URL || "";

if (!connectionString) {
  console.error(`
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  MISSING DATABASE_URL                                      ║
╠════════════════════════════════════════════════════════════════╣
║  Please set DATABASE_URL or DIRECT_URL in .env.local          ║
║                                                                ║
║  Example:                                                      ║
║  DIRECT_URL="postgresql://postgres.xxx:password@...          ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

// Create postgres client
// Note: postgres client is NOT compatible with Edge Runtime
// For Cloudflare Pages deployment, this will fail at runtime
// Consider using Supabase REST API or refactoring to use Supabase client
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

try {
  client = postgres(connectionString, {
    max: 1, // Single connection
    idle_timeout: 20,
    connect_timeout: 10,
  });

  // Create drizzle instance
  db = drizzle(client, { schema });
} catch (error) {
  // In Edge Runtime (Cloudflare Pages), postgres client will fail
  // This is expected - API routes should handle this gracefully
  console.warn(
    "⚠️  Postgres client initialization failed (likely Edge Runtime)"
  );
  console.warn(
    "💡 For Cloudflare Pages, database operations will need to use Supabase REST API"
  );

  // Set db to null - API routes should check and handle this
  db = null;
}

// Export db (may be null in Edge Runtime)
export { db };

// Helper to check if database is configured
export const isDatabaseConfigured = () => {
  return !!connectionString && connectionString.length > 0;
};

// Export schema for use in queries
export { schema };
