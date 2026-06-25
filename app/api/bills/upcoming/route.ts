// app/api/bills/upcoming/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

export async function GET(req: Request) {
  // 🔐 Authenticate user
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdmin();

  const { data: authData, error: authErr } =
    await supabase.auth.getUser(token);

  if (authErr || !authData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authUUID = authData.user.id;

  // 👤 Map auth_uuid → userId
  const { data: userRow } = await supabase
    .from("users")
    .select("userId")
    .eq("auth_uuid", authUUID)
    .single();

  if (!userRow?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userRow.userId;

  // 📌 Fetch nearest upcoming active reminder
  const { data: reminder, error } = await supabase
    .from("PaymentReminder")
    .select("reminderId, displayName, amount, nextTriggerAt")
    .eq("userId", userId)
    .eq("isActive", true)
    .order("nextTriggerAt", { ascending: true })
    .limit(1)
    .single();

  if (error || !reminder) {
    return NextResponse.json({ upcomingBill: null });
  }

  return NextResponse.json({
    upcomingBill: reminder,
  });
}
