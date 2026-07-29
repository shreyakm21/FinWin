// app/analytics/insights/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import InsightCards from "../components/InsightCards";
import AnalyticsSkeleton from "../components/AnalyticsSkeleton";
import { supabase } from "../../../utils/supabaseClient";

/**
 * Fetch helper with Bearer token
 */
async function fetchJSON(url: string, token: string | null) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("FETCH FAILED:", url, res.status, text);
    if (res.status === 401) return null;
    throw new Error(`Failed to fetch ${url}`);
  }

  return res.json();
}

const InsightsAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [insightsData, setInsightsData] = useState<any>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token ?? null;

        if (!token) {
          setLoading(false);
          return;
        }

        const data = await fetchJSON("/api/analytics/insights", token);
        if (data) setInsightsData(data);
      } catch (err) {
        console.error("Insights load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!insightsData) {
    return (
      <div style={{ padding: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
          🧠 Insights
        </h1>
        <p style={{ marginTop: "12px", color: "#666" }}>
          Not enough data yet to generate insights.
        </p>
      </div>
    );
  }

  const { confidence, insights } = insightsData;

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        🧠 Financial Insights
      </h1>

      <p style={{ marginTop: "8px", color: "#555" }}>
        Personalised observations based on your transactions
      </p>

      {/* Confidence */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          borderRadius: "12px",
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <strong>Data Confidence:</strong>{" "}
        {confidence.label} <br />
        <span style={{ color: "#666", fontSize: "14px" }}>
          Based on {confidence.transactionCount} transactions across{" "}
          {confidence.months} months
        </span>
      </div>

      {/* Insight cards */}
      <div style={{ marginTop: "32px" }}>
        <InsightCards insights={insights} />
      </div>

      {/* Human-readable summaries */}
      <div style={{ marginTop: "32px" }}>
        <h3>What this means</h3>
        <ul style={{ marginTop: "12px", lineHeight: 1.7 }}>
          {insights.topExpenseCategory && (
            <li>
              🧾 Your highest spending category is{" "}
              <strong>{insights.topExpenseCategory.category}</strong>, where
              you spent ₹
              {insights.topExpenseCategory.amount.toLocaleString()}.
            </li>
          )}

          {insights.savingsRate && (
            <li>
              💡 You saved{" "}
              <strong>{insights.savingsRate.rate}%</strong> of your income
              this period {insights.savingsRate.emoji}.
            </li>
          )}

          {insights.biggestPurchase && (
            <li>
              🛒 Your biggest purchase was{" "}
              <strong>₹
                {insights.biggestPurchase.amount.toLocaleString()}
              </strong>{" "}
              on {insights.biggestPurchase.date}.
            </li>
          )}

          {!insights.savingsRate && (
            <li>
              ⚠️ No income data was detected — savings insights may be limited.
            </li>
          )}

          {insights.weekendVsWeekday && (
            <li>
              📅 Your spending is <strong>{insights.weekendVsWeekday.trend}</strong>
              (Weekend ₹{insights.weekendVsWeekday.weekend.toLocaleString()} vs
              Weekday ₹{insights.weekendVsWeekday.weekday.toLocaleString()}).
            </li>
          )}

{insights.trend && (
  <li>
    📈 Your monthly spending trend is{" "}
    <strong>{insights.trend.direction}</strong>
    {insights.trend.avgMonthlyGrowth !== null && (
      <> ({insights.trend.avgMonthlyGrowth}% average monthly change)</>
    )}
    .

    {insights.trend.explanation && (
      <>
        {" "}
        {insights.trend.explanation}
      </>
    )}

    {insights.trend.drivers?.length > 0 && (
      <>
        {" "}
        Key drivers:
        {" "}
        {insights.trend.drivers
          .map((d: any) => `${d.category} (${d.diff > 0 ? "+" : ""}₹${Math.abs(d.diff).toLocaleString()})`)
          .join(", ")}
        .
      </>
    )}
  </li>
)}

          {insights.unusualTransaction && (
            <li>
              🔥 Unusually large purchase detected: ₹
              {insights.unusualTransaction.amount.toLocaleString()} on{" "}
              {insights.unusualTransaction.date}.
            </li>
          )}

          {insights.cashflowRisk && (
            <li>
              💸 Cash-flow health: <strong>{insights.cashflowRisk}</strong>.
            </li>
          )}

          {insights.savingsProjection && (
            <li>
              📊 Expected next month expense ₹
              {insights.savingsProjection.nextMonthExpense.toLocaleString()},
              {insights.savingsProjection.expectedSavings >= 0 ? (
                <> projected savings ₹{insights.savingsProjection.expectedSavings.toLocaleString()}.</>
              ) : (
                <> potential deficit ₹{Math.abs(insights.savingsProjection.expectedSavings).toLocaleString()}.</>
              )}
            </li>
          )}


          {confidence.label !== "Low" && insights.behaviour && (
            <li>
              🧠 Financial behaviour pattern: <strong>{insights.behaviour}</strong>.
            </li>
          )}


        </ul>
      </div>
    </div>
  );
};

export default InsightsAnalyticsPage;
