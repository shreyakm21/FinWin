export default function InsightsPanel({ goals }: any) {
  if (!goals.length) return null;

  const mostViolated = [...goals].sort(
    (a, b) => b.violationCount - a.violationCount
  )[0];

  return (
    <div className="gt-card">
      <h3>📌 Insights</h3>

      <p>
        Most violated goal:{" "}
        <strong>{mostViolated.title}</strong>
      </p>

      {mostViolated.categoryName && (
        <p>
          Risky category:{" "}
          <strong>{mostViolated.categoryName}</strong>
        </p>
      )}
    </div>
  );
}
