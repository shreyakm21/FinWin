// utils/getBankingUser.ts

import { supabaseServer } from "@/lib/supabaseServer";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export async function getBankingUser(
  cookieStore: ReadonlyRequestCookies
): Promise<number | null> {
  const supabase = supabaseServer(cookieStore);

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error || !session?.user?.email) {
    return null;
  }

  const { data, error: mapError } = await supabase
    .from("users")
    .select("userId")
    .eq("email", session.user.email)
    .single();

  if (mapError || !data?.userId) {
    return null;
  }

  return data.userId;
}
