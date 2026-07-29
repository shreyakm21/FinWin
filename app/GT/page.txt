// app/GT/page.tsx
"use client";

import { useState } from "react";
import CreateGoalModal from "./components/CreateGoalModal";
import DisciplineScore from "./components/DisciplineScore";
import GoalProgressCard from "./components/GoalProgressCard";
import InsightsPanel from "./components/InsightsPanel";
import { useGoalMetrics } from "./hooks/useGoalMetrics";

//import "./styles/gt.css";
import "./styles/gt-dashboard.css";

export default function GTPage() {
  const [open, setOpen] = useState(false);

  // 🔹 Metrics-powered goals (includes currentSpent, violations, etc.)
  const { goals, loading, refresh } = useGoalMetrics();

  if (loading) {
    return (
      <div className="gt-page">
        <p>Loading goals…</p>
      </div>
    );
  }

  // 🧠 Discipline score (simple, explainable)
  const disciplineScore = Math.max(
    0,
    100 - goals.reduce((sum, g) => sum + g.violationCount * 10, 0)
  );

  return (
    <div className="gt-page">
      {/* ===== HEADER ===== */}
      <div className="gt-header">
        <h1>🎯 Goal Tracker</h1>
        <button
          className="transaction-btn-primary"
          onClick={() => setOpen(true)}
        >
          + Create Goal
        </button>
      </div>

      {/* ===== DISCIPLINE SCORE ===== */}
      {goals.length > 0 && (
        <DisciplineScore score={disciplineScore} />
      )}

      {/* ===== INSIGHTS ===== */}
      {goals.length > 0 && (
        <InsightsPanel goals={goals} />
      )}

      {/* ===== GOALS GRID ===== */}
      <div className="gt-grid">
        {goals.length === 0 && (
          <p className="gt-empty">No goals created yet</p>
        )}

        {goals.map(goal => (
          <GoalProgressCard
            key={goal.goalId}
            goal={goal}
          />
        ))}
      </div>

      {/* ===== CREATE GOAL MODAL ===== */}
      {open && (
        <CreateGoalModal
          onClose={() => setOpen(false)}
          onCreated={() => {
            // metrics hook auto-refreshes on reload;
            // keeping this future-proof
            refresh();      // 👈 force reload
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
