// app/api/reminders/cancel/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabaseAdmin";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 🔐 Validate user
  const { data: authData } = await supabaseAdmin.auth.getUser(token);
  if (!authData?.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // 👤 Find banking userId
  const { data: userRow } = await supabaseAdmin
    .from("users")
    .select("userId")
    .eq("auth_uuid", authData.user.id)
    .single();

  if (!userRow) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const body = await req.json();
  const { reminderId } = body;

  if (!reminderId) {
    return NextResponse.json({ error: "Missing reminderId" }, { status: 400 });
  }

  // ✅ Mark reminder inactive instead of deleting
  const { error } = await supabaseAdmin
    .from("PaymentReminder")
    .update({ isActive: false })
    .eq("reminderId", reminderId)
    .eq("userId", userRow.userId);

  if (error) {
    console.error("❌ Cancel reminder failed:", error);
    return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

