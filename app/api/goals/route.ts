// app/api/goals/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json([], { status: 401 });

  const { data: auth, error: authErr } =
    await supabaseAdmin.auth.getUser(token);

  if (authErr || !auth?.user) {
    return NextResponse.json([], { status: 401 });
  }

  const { data: user, error: userErr } = await supabaseAdmin
    .from("users")
    .select("userId")
    .eq("auth_uuid", auth.user.id)
    .single();

  if (userErr || !user) {
    console.error("❌ USER LOOKUP FAILED:", userErr);
    return NextResponse.json([], { status: 400 });
  }

  const { data: goals, error: goalsErr } = await supabaseAdmin
    .from("UserGoal")
    .select("*")
    .eq("userId", user.userId)
    .order("createdAt", { ascending: false });

  if (goalsErr) {
    console.error("❌ FETCH GOALS ERROR:", goalsErr);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: auth, error: authErr } =
      await supabaseAdmin.auth.getUser(token);

    if (authErr || !auth?.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // 🔴 THIS WAS THE SILENT FAILURE POINT
    const { data: user, error: userErr } = await supabaseAdmin
      .from("users")
      .select("userId")
      .eq("auth_uuid", auth.user.id)
      .single();

    if (userErr || !user) {
      console.error("❌ USER LOOKUP FAILED:", userErr);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      title,
      goalType,
      limitAmount,
      categoryName,
      startDate,
      endDate,
      frequency,
    } = body;

    if (!title || !goalType || !frequency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error: insertErr } = await supabaseAdmin
      .from("UserGoal")
      .insert({
        userId: user.userId,
        title,
        goalType,
        limitAmount: limitAmount ? Number(limitAmount) : null,
        categoryName: categoryName || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        frequency,
      });

    if (insertErr) {
      console.error("❌ GOAL INSERT FAILED:", insertErr);
      return NextResponse.json(
        { error: insertErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("❌ CREATE GOAL CRASH:", err);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
