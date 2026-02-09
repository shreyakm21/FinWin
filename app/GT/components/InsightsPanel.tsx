// app/GT/components/InsightsPanel.tsx
export default function InsightsPanel({ goals }: any) {
  if (!goals.length) return null;

  const mostViolated = [...goals].sort(
    (a, b) => b.violationCount - a.violationCount
  )[0];

  return (
    <div className="relative group rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                    border border-slate-700/50 shadow-lg hover:shadow-xl 
                    transition-all duration-300 p-6 overflow-hidden">
      
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                      bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-purple-500/20 
                      blur-2xl transition duration-500"></div>

      {/* Header */}
      <h3 className="text-lg font-semibold text-slate-100 tracking-wide mb-4 flex items-center gap-2">
        <span className="text-indigo-400">📌</span> Insights
      </h3>

      {/* Most Violated Goal */}
      <p className="text-sm text-slate-300 mb-2">
        <span className="text-slate-400">Most violated goal:</span>{" "}
        <strong className="text-indigo-400">{mostViolated.title}</strong>
      </p>

      {/* Risky Category */}
      {mostViolated.categoryName && (
        <p className="text-sm text-slate-300">
          <span className="text-slate-400">Risky category:</span>{" "}
          <strong className="text-purple-400">{mostViolated.categoryName}</strong>
        </p>
      )}

      {/* Accent line */}
      <div className="mt-5 h-[2px] w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500 rounded-full"></div>
    </div>
  );
}
