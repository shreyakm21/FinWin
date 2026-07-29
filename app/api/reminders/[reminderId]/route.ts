//app\api\reminders\[reminderId]\route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabaseAdmin";

export async function GET(
  req: Request,
  { params }: { params: { reminderId: string } }
) {
  const reminderId = Number(params.reminderId);

  if (isNaN(reminderId)) {
    return NextResponse.json({ error: "Invalid reminderId" }, { status: 400 });
  }


  // Fetch reminder securely
  const { data, error } = await supabaseAdmin
    .from("PaymentReminder")
    .select("reminderId, displayName, accountNumber, amount")
    .eq("reminderId", reminderId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
