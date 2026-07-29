import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabaseAdmin";

function addSnoozeTime(snoozeFor: string): Date {
  const next = new Date();

  switch (snoozeFor) {
    case "1_DAY":
      next.setDate(next.getDate() + 1);
      break;

    case "1_WEEK":
      next.setDate(next.getDate() + 7);
      break;

    case "1_MONTH":
      next.setMonth(next.getMonth() + 1);
      break;

    default:
      next.setDate(next.getDate() + 1);
  }

  return next;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔐 Get logged-in user
    const { data: authData, error: authErr } =
      await supabaseAdmin.auth.getUser(token);

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reminderId, snoozeFor } = body;

    if (!reminderId || !snoozeFor) {
      return NextResponse.json(
        { error: "Missing reminderId or snoozeFor" },
        { status: 400 }
      );
    }

    // ⏳ Compute new nextTriggerAt
    const snoozedUntil = addSnoozeTime(snoozeFor);

    // ✅ Update reminder nextTriggerAt
    const { error: updateErr } = await supabaseAdmin
      .from("PaymentReminder")
      .update({
        nextTriggerAt: snoozedUntil.toISOString(),
      })
      .eq("reminderId", reminderId);

    if (updateErr) {
      console.error("❌ Snooze update failed:", updateErr);
      return NextResponse.json(
        { error: "Failed to snooze reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Reminder snoozed until ${snoozedUntil.toISOString()}`,
    });
  } catch (err) {
    console.error("❌ Snooze API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
