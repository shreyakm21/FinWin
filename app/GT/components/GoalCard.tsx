// app/GT/components/GoalCard.tsx
export default function GoalCard({ goal }: any) {
  return (
    <div className="gt-card">
      <h3>{goal.title}</h3>
      <p>
        Limit: ₹{goal.limitAmount} / {goal.frequency}
      </p>

      {goal.categoryName && (
        <p>Category: {goal.categoryName}</p>
      )}

      <p>Violations: {goal.violationCount}</p>
    </div>
  );
}
