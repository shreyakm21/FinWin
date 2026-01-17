import KPICard from "./KPICards";

export default function KPIRow({ monthly, insights }: any) {
  const kpis = monthly.kpis;
  const confidence = insights.confidence.label;

  const confidenceColor =
    confidence === "High" ? "🟢" : confidence === "Medium" ? "🟡" : "🔴";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginTop: "24px"
      }}
    >
      <KPICard
        title="Total Income"
        value={`₹${kpis.totalIncome.toLocaleString()}`}
      />

      <KPICard
        title="Total Expense"
        value={`₹${kpis.totalExpense.toLocaleString()}`}
      />

      <KPICard
        title="Net Savings"
        value={`₹${kpis.net.toLocaleString()}`}
        subtitle="Income − Expense"
      />

      <KPICard
        title="Data Confidence"
        value={`${confidenceColor} ${confidence}`}
        subtitle={`${insights.confidence.transactionCount} transactions`}
      />
    </div>
  );
}
