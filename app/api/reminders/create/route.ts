// app/api/reminders/create/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabaseAdmin";

function computeFirstTrigger(freq: string): Date {
  const d = new Date();

  if (freq === "MONTHLY") d.setMonth(d.getMonth() + 1);
  if (freq === "QUARTERLY") d.setMonth(d.getMonth() + 3);
  if (freq === "HALFYEARLY") d.setMonth(d.getMonth() + 6);
  if (freq === "YEARLY") d.setFullYear(d.getFullYear() + 1);

  return d;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: authData } = await supabaseAdmin.auth.getUser(token);
  if (!authData?.user) return NextResponse.json({ error: "Invalid" }, { status: 401 });

  // ✅ Banking userId
  const { data: userRow } = await supabaseAdmin
    .from("users")
    .select("userId")
    .eq("email", authData.user.email)
    .single();

  if (!userRow) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const body = await req.json();
  const { displayName, accountNumber, frequency, amount } = body;

  const nextTriggerAt = computeFirstTrigger(frequency);

  const { error } = await supabaseAdmin.from("PaymentReminder").insert({
    userId: userRow.userId,
    displayName,
    accountNumber,
    frequency,
    scheduleJson: {},
    nextTriggerAt,
    amount: amount ?? null,
    isActive: true,
  });

  if (error) {
    console.error("❌ Insert failed:", error);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
