// app/api/reminders/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json([], { status: 401 });
  }

  // 🔐 Validate Supabase Auth user
  const { data: authData, error: authErr } =
    await supabaseAdmin.auth.getUser(token);

  if (authErr || !authData?.user) {
    return NextResponse.json([], { status: 401 });
  }

  // ✅ Fetch internal banking userId properly
  const { data: userRow, error: userErr } = await supabaseAdmin
    .from("users") // 👈 banking.User table
    .select("userId")
    .eq("email", authData.user.email)
    .single();

  if (userErr || !userRow) {
    console.error("❌ User lookup failed:", userErr);
    return NextResponse.json([], { status: 400 });
  }

  // ✅ Fetch reminders
  const { data: reminders, error } = await supabaseAdmin
    .from("PaymentReminder")
    .select("*")
    .eq("userId", userRow.userId)
    .eq("isActive", true)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("❌ Reminder fetch failed:", error);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(reminders || []);
}
