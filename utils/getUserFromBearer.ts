// utils/getUserFromBearer.ts

import { supabaseAdmin } from "../lib/supabaseServer";

export async function getUserFromBearer(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) return null;

  // ✅ CALL the function to get the client
  const supabase = supabaseAdmin();

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) return null;

  return data.user;
}
