// app/GT/page.tsx
"use client";

import { useState } from "react";
import CreateGoalModal from "./components/CreateGoalModal";
import DisciplineScore from "./components/DisciplineScore";
import GoalProgressCard from "./components/GoalProgressCard";
import InsightsPanel from "./components/InsightsPanel";
import { useGoalMetrics } from "./hooks/useGoalMetrics";

export default function GTPage() {
  const [open, setOpen] = useState(false);

  // 🔹 Metrics-powered goals (includes currentSpent, violations, etc.)
  const { goals, loading, refresh } = useGoalMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300 font-medium">Loading your goals...</p>
        </div>
      </div>
    );
  }

  // 🧠 Discipline score (simple, explainable)
  const disciplineScore = Math.max(
    0,
    100 - goals.reduce((sum, g) => sum + g.violationCount * 10, 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-600 to-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎯</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Goal Tracker</h1>
              <p className="text-xs text-slate-400">Track your financial discipline</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50"
          >
            + Create Goal
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* DISCIPLINE SCORE */}
        {goals.length > 0 && (
          <div className="mb-8">
            <DisciplineScore score={disciplineScore} />
          </div>
        )}

        {/* INSIGHTS */}
        {goals.length > 0 && (
          <div className="mb-8">
            <InsightsPanel goals={goals} />
          </div>
        )}

        {/* GOALS GRID */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Your Goals</h2>
          
          {goals.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-12 text-center shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
              <div className="text-5xl mb-3 opacity-50">📊</div>
              <p className="text-slate-300 font-medium mb-4">No goals created yet</p>
              <p className="text-slate-400 text-sm mb-6">Create your first goal to start tracking your financial discipline</p>
              <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map(goal => (
                <GoalProgressCard
                  key={goal.goalId}
                  goal={goal}
                  onDeleted={(deletedId: number) => {
                    /* ⚡ instant remove without reload */
                    const updated = goals.filter(g => g.goalId !== deletedId);
                    // hack: mutate local (since hook refresh exists)
                    (goals as any).splice(0, goals.length, ...updated);
                    refresh();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* CREATE GOAL MODAL */}
      {open && (
        <CreateGoalModal
          onClose={() => setOpen(false)}
          onCreated={() => {
            refresh();
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

