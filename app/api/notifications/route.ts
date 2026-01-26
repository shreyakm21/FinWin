// app/api/notifications/route.ts

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

  // 🔐 Auth user
  const { data: authData, error: authErr } =
    await supabaseAdmin.auth.getUser(token);

  if (authErr || !authData?.user) {
    return NextResponse.json([], { status: 401 });
  }

  // 👤 Map to internal userId
  const { data: user, error: userErr } = await supabaseAdmin
    .from("users")
    .select("userId")
    .eq("auth_uuid", authData.user.id)
    .single();

  if (userErr || !user) {
    return NextResponse.json([], { status: 400 });
  }

  // 🔔 Fetch unread notifications
  const { data: notifications, error } = await supabaseAdmin
    .from("Notification")
    .select("notificationId, title, message, createdAt, refId")
    .eq("userId", user.userId)
    .eq("isRead", false)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("❌ NOTIFICATION FETCH ERROR:", error);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(notifications ?? []);
}
