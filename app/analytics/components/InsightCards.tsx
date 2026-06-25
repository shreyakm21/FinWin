// app/analytics/components/InsightCards.tsx
import InsightCard from "./InsightCard";

export default function InsightCards({ insights }: any) {
  const {
    topExpenseCategory,
    savingsRate,
    biggestPurchase,
    savingsProjection,
    weekendVsWeekday,
    trend,
    unusualTransaction,
    cashflowRisk,
    behaviour
  } = insights ?? {};


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
        title="Next Month Forecast"
        content={
          savingsProjection
            ? `₹${savingsProjection.nextMonthExpense.toLocaleString()} expected expense`
            : "Projection unavailable"
        }
        subtext={
          savingsProjection
            ? savingsProjection.expectedSavings >= 0
              ? `Expected savings ₹${savingsProjection.expectedSavings.toLocaleString()}`
              : `Possible deficit ₹${Math.abs(savingsProjection.expectedSavings).toLocaleString()}`
            : "Based on recent spending pattern"
        }
      />

      {/* Spending Trend */}
      {trend && (
        <InsightCard
          title="Spending Trend"
          content={trend}
          subtext="Based on recent monthly expenses"
        />
      )}

      {/* Weekend Behaviour */}
      {weekendVsWeekday && (
        <InsightCard
          title="Spending Pattern"
          content={weekendVsWeekday.trend}
          subtext={`Weekend ₹${weekendVsWeekday.weekend.toLocaleString()} vs Weekday ₹${weekendVsWeekday.weekday.toLocaleString()}`}
        />
      )}

      {/* Cashflow Risk */}
      {cashflowRisk && (
        <InsightCard
          title="Cashflow Health"
          content={cashflowRisk}
          subtext="Income vs Expense stability"
        />
      )}

      {/* Behaviour Tag */}
      {behaviour && (
        <InsightCard
          title="Financial Behaviour"
          content={behaviour}
          subtext="Derived from savings & spending pattern"
        />
      )}

      {/* Unusual Transaction */}
      {unusualTransaction && (
        <InsightCard
          title="Unusual Transaction"
          content={`₹${unusualTransaction.amount.toLocaleString()}`}
          subtext={`${unusualTransaction.narration} • ${unusualTransaction.date}`}
        />
      )}


    </div>
  );
}
