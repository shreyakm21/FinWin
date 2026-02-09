//app/api/goals/[goalId]/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabaseAdmin";

export async function DELETE(
  req: Request,
  { params }: { params: { goalId: string } }
) {
  const goalId = Number(params.goalId);

  if (!goalId) {
    return NextResponse.json({ error: "Invalid goalId" }, { status: 400 });
  }

  try {
    /* 🧹 1. Delete GoalViolation rows first */
    await supabaseAdmin
      .from("GoalViolation")
      .delete()
      .eq("goalId", goalId);

    /* ❌ 2. Delete Goal */
    const { error } = await supabaseAdmin
      .from("UserGoal")
      .delete()
      .eq("goalId", goalId);

    if (error) {
      console.error("❌ Goal delete failed:", error);
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
