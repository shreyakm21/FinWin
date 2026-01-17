import InsightCard from "./InsightCard";

export default function InsightCards({ insights }: any) {
  const {
    topExpenseCategory,
    savingsRate,
    biggestPurchase,
    savingsProjection
  } = insights.insights;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
        marginTop: "32px"
      }}
    >
      {/* Top Expense */}
      <InsightCard
        title="Top Expense"
        content={
          topExpenseCategory
            ? `₹${topExpenseCategory.amount.toLocaleString()} on ${topExpenseCategory.category}`
            : "No expense data"
        }
      />

      {/* Savings Rate */}
      <InsightCard
        title="Savings Rate"
        content={
          savingsRate
            ? `${savingsRate.emoji} You saved ${savingsRate.rate}% of your income`
            : "Not enough data"
        }
      />

      {/* Biggest Purchase */}
      <InsightCard
        title="Biggest Purchase"
        content={
          biggestPurchase
            ? `₹${biggestPurchase.amount.toLocaleString()}`
            : "No purchases found"
        }
        subtext={
          biggestPurchase
            ? `${biggestPurchase.narration} • ${biggestPurchase.date}`
            : undefined
        }
      />

      {/* Savings Projection */}
      <InsightCard
        title="Savings Goal"
        content={
          savingsProjection
            ? `₹${savingsProjection.goal.toLocaleString()} in ${savingsProjection.monthsRequired} months`
            : "Projection unavailable"
        }
        subtext="Assumes current income & spending pattern"
      />
    </div>
  );
}
