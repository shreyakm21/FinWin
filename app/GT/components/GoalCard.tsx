// app/GT/components/GoalCard.tsx
export default function GoalCard({ goal }: any) {
  return (
    <div className="relative group rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                    border border-slate-700/50 shadow-lg hover:shadow-xl 
                    transition-all duration-300 p-6 overflow-hidden">
      
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                      bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-purple-500/20 
                      blur-2xl transition duration-500"></div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-100 tracking-wide mb-3">
        {goal.title}
      </h3>

      {/* Limit */}
      <p className="text-sm text-slate-400 mb-2">
        <span className="font-medium text-slate-300">Limit:</span> ₹{goal.limitAmount} / {goal.frequency}
      </p>

      {/* Category */}
      {goal.categoryName && (
        <p className="text-sm text-slate-400 mb-2">
          <span className="font-medium text-slate-300">Category:</span> {goal.categoryName}
        </p>
      )}

      {/* Violations */}
      <p className="text-sm text-slate-400">
        <span className="font-medium text-slate-300">Violations:</span> {goal.violationCount}
      </p>

      {/* Accent line */}
      <div className="mt-4 h-[2px] w-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500 rounded-full"></div>
    </div>
  );
}
