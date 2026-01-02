import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");

  console.error(`
╔════════════════════════════════════════════════════════════════╗
║  ⚠️  MISSING SUPABASE CONFIGURATION                            ║
╠════════════════════════════════════════════════════════════════╣
║  Missing: ${missingVars.join(", ").padEnd(48)}║
║                                                                ║
║  To fix this:                                                  ║
║  1. Copy env.example to .env.local                            ║
║  2. Fill in your Supabase credentials                         ║
║  3. Restart the dev server                                    ║
║                                                                ║
║  See SUPABASE_SETUP.md for detailed instructions              ║
╚════════════════════════════════════════════════════════════════╝
  `);
}

// Create client with fallback values to prevent crashes
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseServiceKey || "placeholder-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "x-connection-encrypted": "true",
      },
      // Add timeout for requests (compatible with Edge Runtime)
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        return fetch(url, {
          ...options,
          signal: controller.signal,
        })
          .then((response) => {
            clearTimeout(timeoutId);
            return response;
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            throw error;
          });
      },
    },
  }
);

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl &&
    supabaseServiceKey &&
    supabaseUrl !== "https://placeholder.supabase.co"
  );
};
