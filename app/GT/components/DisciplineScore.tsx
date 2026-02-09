export default function DisciplineScore({ score }: { score: number }) {
  const color =
    score > 80 ? "#16a34a" : score > 50 ? "#f59e0b" : "#dc2626";
  
  const colorClass = score > 80 
    ? "from-emerald-400 to-emerald-600" 
    : score > 50 
    ? "from-amber-400 to-amber-600" 
    : "from-red-400 to-red-600";
  
  const bgColorClass = score > 80 
    ? "bg-emerald-500/10" 
    : score > 50 
    ? "bg-amber-500/10" 
    : "bg-red-500/10";
  
  const borderColorClass = score > 80 
    ? "border-emerald-500/30" 
    : score > 50 
    ? "border-amber-500/30" 
    : "border-red-500/30";
  
  const textColorClass = score > 80 
    ? "text-emerald-400" 
    : score > 50 
    ? "text-amber-400" 
    : "text-red-400";

  return (
    <div className="w-full max-w-sm">
      <div className={`${bgColorClass} border ${borderColorClass} rounded-2xl p-6 backdrop-blur-xl shadow-lg shadow-slate-950/50`}>
        {/* Title */}
        <h2 className="text-sm font-semibold text-slate-300 mb-4 text-center">
          Discipline Score
        </h2>
        
        {/* Circular Score Display */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-24 h-24">
            {/* Outer circle background */}
            <div className="absolute inset-0 rounded-full bg-slate-800/50 border border-slate-700/50" />
            
            {/* Gradient circle */}
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorClass} opacity-20`}
              style={{
                border: `3px solid ${color}`,
              }}
            />
            
            {/* Score text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span 
                  className="text-3xl font-bold block"
                  style={{ color }}
                >
                  {score}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-xs text-slate-200 text-center">
          Based on recent goal violations
        </p>
      </div>
    </div>
  );
}
