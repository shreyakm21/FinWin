//app/api/goals/delete/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* =========================
       🔐 Get logged-in user
    ========================= */
    const { data: authData, error: authErr } =
      await supabaseAdmin.auth.getUser(token);

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    /* =========================
       👤 Map to internal userId
    ========================= */
    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("userId")
      .eq("auth_uuid", authData.user.id)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    /* =========================
       📦 Get goalId from body
    ========================= */
    const body = await req.json();
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json({ error: "goalId required" }, { status: 400 });
    }

    /* =========================
       🗑 Delete ONLY user's goal
    ========================= */
    const { error: deleteErr } = await supabaseAdmin
      .from("UserGoal")
      .delete()
      .eq("goalId", goalId)
      .eq("userId", user.userId);

    if (deleteErr) {
      console.error("❌ DELETE GOAL FAILED:", deleteErr);
      return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE GOAL ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
