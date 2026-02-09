//app\GT\components\GoalProgressCard.tsx
"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";


export default function GoalProgressCard({ goal, onDeleted }: any) {
  const router = useRouter();

  const pct = Math.min(
    100,
    Math.round((goal.currentSpent / goal.limitAmount) * 100)
  );

  /* =========================
     Delete Goal
  ========================= */
const deleteGoal = async () => {
  if (!confirm("Delete this goal?")) return;

  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) return;

  const res = await fetch(`/api/goals/${goal.goalId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    /* ⚡ instant UI remove */
    if (onDeleted) onDeleted(goal.goalId);
  } else {
    alert("Failed to delete goal");
  }
};



  return (
    <div className="relative group rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                    border border-slate-700/50 shadow-lg hover:shadow-xl 
                    transition-all duration-300 p-6 overflow-hidden">
      
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                      bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-purple-500/20 
                      blur-2xl transition duration-500"></div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-100 tracking-wide mb-2">
        {goal.title}
      </h3>

      {/* Category */}
      {goal.categoryName && (
        <p className="text-xs text-slate-400 mb-3">
          Category: <span className="text-slate-300">{goal.categoryName}</span>
        </p>
      )}

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-700 ease-out rounded-full ${
            pct >= 100 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Amounts */}
      <p className="text-sm text-slate-300 mb-1">
        ₹{goal.currentSpent} / ₹{goal.limitAmount} 
        <span className="ml-2 text-slate-400">({pct}%)</span>
      </p>

      {/* Violations */}
      <p className="text-xs text-slate-400">
        Violations: <span className="text-slate-300">{goal.violationCount}</span>
      </p>

      {/* Accent line */}
      <div className="mt-4 h-[2px] w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500 rounded-full"></div>

      {/* 🗑 Cancel Goal Button */}
      <button
        onClick={deleteGoal}
        className="absolute top-3 right-3 text-xs text-red-400 hover:text-red-300 opacity-70 hover:opacity-100 transition"
        title="Cancel Goal"
      >
        ❌
      </button>
    </div>
  );
}
