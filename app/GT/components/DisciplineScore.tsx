export default function DisciplineScore({ score }: { score: number }) {
  const color =
    score > 80 ? "#16a34a" : score > 50 ? "#f59e0b" : "#dc2626";

  return (
    <div className="gt-score">
      <h2>Discipline Score</h2>
      <div className="gt-score-circle" style={{ borderColor: color }}>
        <span style={{ color }}>{score}</span>
      </div>
      <p className="gt-muted">
        Based on recent goal violations
      </p>
    </div>
  );
}
