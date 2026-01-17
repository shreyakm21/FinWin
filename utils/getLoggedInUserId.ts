// utils/getLoggedInUserId.ts
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Single source of truth for current logged-in banking user
 * Uses Supabase auth session (SECURE)
 */
export async function getLoggedInUserId(): Promise<number | null> {
  // 1️⃣ Get authenticated Supabase user
  const {
    data: { user },
    error: authError
  } = await supabaseServer.auth.getUser();

  if (authError || !user?.email) {
    return null;
  }

  // 2️⃣ Map auth user → banking.users.userId
  const { data: profile, error } = await supabaseServer
    .from("users")
    .select("userId")
    .eq("email", user.email)
    .single();

  if (error || !profile) {
    return null;
  }

  return profile.userId;
}
