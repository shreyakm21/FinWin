// app/api/reminders/trigger/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabaseAdmin";

function computeNextTrigger(frequency: string, from: Date): Date {
  const next = new Date(from);

  switch (frequency) {
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3);
      break;
    case "HALFYEARLY":
      next.setMonth(next.getMonth() + 6);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }

  return next;
}

export async function POST() {
  const now = new Date();

  // 1️⃣ Fetch due reminders
  const { data: reminders, error } = await supabaseAdmin
    .from("PaymentReminder")
    .select("*")
    .eq("isActive", true)
    .lte("nextTriggerAt", now.toISOString());

  if (error) {
    console.error("❌ FETCH REMINDERS FAILED:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ triggered: 0 });
  }

  let triggeredCount = 0;

  for (const reminder of reminders) {
    // 2️⃣ Create notification
    const { error: notifErr } = await supabaseAdmin
        .from("Notification")
        .insert({
        userId: reminder.userId,
        type: "REMINDER",
        title: "Payment Reminder",
        message: `Pay ${reminder.displayName}`,
        refId: reminder.reminderId, // 🔥 REQUIRED FOR SNOOZE
        });


    if (notifErr) {
      console.error("❌ NOTIFICATION INSERT FAILED:", notifErr);
      continue;
    }

    // 3️⃣ Update reminder schedule
    const nextTriggerAt = computeNextTrigger(
      reminder.frequency,
      new Date(reminder.nextTriggerAt)
    );

    await supabaseAdmin
      .from("PaymentReminder")
      .update({
        lastTriggeredAt: now.toISOString(),
        nextTriggerAt: nextTriggerAt.toISOString(),
      })
      .eq("reminderId", reminder.reminderId);

    triggeredCount++;
  }

  return NextResponse.json({ triggered: triggeredCount });
}
