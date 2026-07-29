// app/api/notifications/read/route.ts
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

  // 🔐 Auth user
  const { data: authData, error: authErr } =
    await supabaseAdmin.auth.getUser(token);

  if (authErr || !authData?.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // 👤 Internal userId
  const { data: user, error: userErr } = await supabaseAdmin
    .from("users")
    .select("userId")
    .eq("auth_uuid", authData.user.id)
    .single();

  if (userErr || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const body = await req.json();
  const { notificationId } = body;

  if (!notificationId) {
    return NextResponse.json({ error: "notificationId required" }, { status: 400 });
  }

  // 🔔 Mark as read (user-safe)
  const { error } = await supabaseAdmin
    .from("Notification")
    .update({ isRead: true })
    .eq("notificationId", notificationId)
    .eq("userId", user.userId);

  if (error) {
    console.error("❌ MARK READ FAILED:", error);
    return NextResponse.json({ error: "Failed to mark read" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
