export default function GoalProgressCard({ goal }: any) {
  const pct = Math.min(
    100,
    Math.round((goal.currentSpent / goal.limitAmount) * 100)
  );

  return (
    <div className="gt-card">
      <h3>{goal.title}</h3>

      {goal.categoryName && (
        <p className="gt-muted">Category: {goal.categoryName}</p>
      )}

      <div className="gt-progress">
        <div
          className="gt-progress-fill"
          style={{
            width: `${pct}%`,
            background: pct > 100 ? "#dc2626" : "#2563eb",
          }}
        />
      </div>

      <p>
        ₹{goal.currentSpent} / ₹{goal.limitAmount} ({pct}%)
      </p>

      <p className="gt-muted">
        Violations: {goal.violationCount}
      </p>
    </div>
  );
}
