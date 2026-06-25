// lib/supabaseServer.js

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

// 🔐 Admin client (service role, no auth)
export function supabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: { schema: "banking" }
    }
  );
}

// 🔐 Route-safe auth client (WORKS WITH YOUR VERSION)
export function supabaseServer(cookieStore) {
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        }
      },
      db: { schema: "banking" }
    }
  );
}
