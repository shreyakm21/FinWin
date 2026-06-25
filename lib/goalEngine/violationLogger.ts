// lib/goalEngine/violationLogger.ts

//import { supabaseAdmin } from "../supabaseServer";
import { supabaseAdmin } from "../../utils/supabaseAdmin";


type Violation = {
  goalId: number;
  exceededBy: number;
};

export async function logGoalViolations({
  violations,
  transactionId,
  attemptedAmount,
}: {
  violations: Violation[];
  transactionId: number;
  attemptedAmount: number;
}) {
  if (!violations || violations.length === 0) return;

  const supabase = supabaseAdmin;

  // 1️⃣ Insert violation rows
  const rows = violations.map(v => ({
    goalId: v.goalId,
    transactionId,
    attemptedAmount, // optional, can be filled later
    exceededBy: v.exceededBy,
  }));

  /*
  //await supabase.from("GoalViolation").insert(rows);
  for (const row of rows) {
    const { data: existing } = await supabase
      .from("GoalViolation")
      .select("violationId")
      .eq("transactionId", transactionId)
      .eq("goalId", row.goalId)
      .maybeSingle();

    if (!existing) {
      //await supabase.from("GoalViolation").insert(row);
      await supabase
        .from("GoalViolation")
        .upsert(row, { onConflict: "transactionId,goalId" });

    }
  }



  // 2️⃣ Increment violation counters on goals
  const goalIds = violations.map(v => v.goalId);

  await supabase.rpc("increment_goal_violation_count", {
    goal_ids: goalIds,
  });

  */

// ✅ Atomic, idempotent, safe
  const { error } = await supabase
    .from("GoalViolation")
    .upsert(rows, { onConflict: "transactionId,goalId" });

  if (error) {
    console.error("❌ GOAL VIOLATION UPSERT FAILED:", error);
  }

  // Increment counters once per goal
  await supabase.rpc("increment_goal_violation_count", {
    goal_ids: violations.map(v => v.goalId),
  });
}

