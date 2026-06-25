// utils/supabaseAdmin.js
import { createClient } from "@supabase/supabase-js";

// Server-only env vars (do NOT use NEXT_PUBLIC_ prefix for service role)
// Ensure these are set in your .env.local (see next block)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Throwing here helps the dev server show a clear error (you saw "supabaseKey is required")
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server env. " +
    "Add them to .env.local and restart the dev server."
  );
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  db: { schema: "banking" },  // 👈 explicitly tell Supabase to use "banking" schema
  auth: { persistSession: false },
});
