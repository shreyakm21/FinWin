"use client";

import React, { useEffect, useState } from "react";
import MonthlyBarChart from "../components/MonthlyBarChart";
import BalanceLineChart from "../components/BalanceLineChart";
import TransactionTimeline from "../components/TransactionTimeline";
import AnalyticsSkeleton from "../components/AnalyticsSkeleton";
import { supabase } from "../../../utils/supabaseClient";

/**
 * Fetch helper with Bearer token
 */
async function fetchJSON(url: string, token: string | null) {
  const res = await fetch(url, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("FETCH FAILED:", url, res.status, text);
    if (res.status === 401) return null;
    throw new Error(`Failed to fetch ${url}`);
  }

  return res.json();
}

const TrendsAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any>({ monthly: [] });
  const [timelineData, setTimelineData] = useState<any>({ transactions: [] });

  /* ---------- Trend Intelligence ---------- */

  const months = monthlyData?.monthly ?? [];

  let trendDirection = "Stable";
  let peakMonth: any = null;
  let lowMonth: any = null;
  let movingAvg = 0;
  let expenseAcceleration = false;
  let overspendingTrend = false;

  if (months.length >= 2) {
    const first = months[0];
    const last = months[months.length - 1];

    const netFirst = first.credit - first.debit;
    const netLast = last.credit - last.debit;

    if (netLast > netFirst * 1.05) trendDirection = "Improving";
    else if (netLast < netFirst * 0.95) trendDirection = "Declining";

    peakMonth = [...months].sort((a, b) => b.debit - a.debit)[0];
    lowMonth = [...months].sort((a, b) => a.debit - b.debit)[0];

    const totalExpense = months.reduce((s, m) => s + m.debit, 0);
    movingAvg = Math.round(totalExpense / months.length);

    if (months.length >= 3) {
      const prev = months[months.length - 2].debit;
      const lastExp = months[months.length - 1].debit;
      expenseAcceleration = lastExp > prev * 1.2;
    }

    const last3 = months.slice(-3);
    const overspendCount = last3.filter(m => m.debit > m.credit).length;
    overspendingTrend = overspendCount >= 2;
  }

  /* ---------- Volatility & Income Stability ---------- */

  let volatilityScore = 0;
  let volatilityLabel = "Stable";
  let incomeStability = "Stable Income";

  if (months.length >= 3) {
    const expenses = months.map(m => m.debit);
    const mean = expenses.reduce((a, b) => a + b, 0) / expenses.length;

    const variance =
      expenses.reduce((s, v) => s + Math.pow(v - mean, 2), 0) /
      expenses.length;

    const stdDev = Math.sqrt(variance);
    volatilityScore = Math.round((stdDev / mean) * 100);

    if (volatilityScore < 15) volatilityLabel = "Very Stable";
    else if (volatilityScore < 30) volatilityLabel = "Moderate";
    else volatilityLabel = "High Volatility";

    const incomes = months.map(m => m.credit);
    const incomeMean = incomes.reduce((a, b) => a + b, 0) / incomes.length;

    const incomeVar =
      incomes.reduce((s, v) => s + Math.pow(v - incomeMean, 2), 0) /
      incomes.length;

    const incomeStd = Math.sqrt(incomeVar);
    const incomeFluct = (incomeStd / incomeMean) * 100;

    if (incomeFluct < 10) incomeStability = "Highly Stable Income";
    else if (incomeFluct < 25) incomeStability = "Moderately Stable Income";
    else incomeStability = "Unstable Income";
  }

  useEffect(() => {
    const loadTrends = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token ?? null;

        if (!token) {
          setLoading(false);
          return;
        }

        const [monthly, timeline] = await Promise.all([
          fetchJSON("/api/analytics/monthly", token),
          fetchJSON("/api/analytics/timeline", token),
        ]);

        if (monthly) setMonthlyData(monthly);
        if (timeline) setTimelineData(timeline);
      } catch (err) {
        console.error("Trends analytics failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTrends();
  }, []);

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        📈 Trends & History
      </h1>

      <p style={{ marginTop: "8px", color: "#555" }}>
        Track how your income, spending, and balance evolve over time
      </p>

      {/* Monthly trends */}
      <div style={{ marginTop: "32px" }}>
        <MonthlyBarChart data={monthlyData.monthly} />
      </div>

      {/* KPI Summary */}
      {months.length > 0 && (
        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          <MiniKPI label="Direction" value={trendDirection} />
          <MiniKPI
            label="Avg Expense"
            value={`₹${movingAvg.toLocaleString()}`}
          />
          <MiniKPI label="Volatility" value={volatilityLabel} />
          <MiniKPI label="Income Stability" value={incomeStability} />
        </div>
      )}

      {/* Insights */}
      {months.length > 0 && (
        <div style={insightBox}>
          <strong>Trend Insights</strong>

          <div style={{ marginTop: 10, lineHeight: 1.7 }}>
            {peakMonth && (
              <div>
                🔺 Highest spending: <strong>{peakMonth.month}</strong> (₹
                {peakMonth.debit.toLocaleString()})
              </div>
            )}

            {lowMonth && (
              <div>
                🔻 Lowest spending: <strong>{lowMonth.month}</strong> (₹
                {lowMonth.debit.toLocaleString()})
              </div>
            )}

            {expenseAcceleration && (
              <div>⚠️ Spending is accelerating recently.</div>
            )}

            {overspendingTrend && (
              <div>🚨 Overspending trend detected in recent months.</div>
            )}

            {!expenseAcceleration && !overspendingTrend && (
              <div>✅ Spending trend appears stable.</div>
            )}
          </div>
        </div>
      )}

      {/* Balance */}
      <div style={{ marginTop: 48 }}>
        <BalanceLineChart data={timelineData.transactions} />
      </div>

      {/* Timeline */}
      <div style={{ marginTop: 48 }}>
        <TransactionTimeline data={timelineData.transactions} />
      </div>
    </div>
  );
};

/* ---------- Mini KPI Component ---------- */

function MiniKPI({ label, value }: { label: string; value: string }) {
  return (
    <div style={miniKpi}>
      <div style={miniLabel}>{label}</div>
      <div style={miniValue}>{value}</div>
    </div>
  );
}

/* ---------- Styles ---------- */

const miniKpi: React.CSSProperties = {
  background: "#fff",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  textAlign: "center",
};

const miniLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#666",
};

const miniValue: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  marginTop: 4,
};

const insightBox: React.CSSProperties = {
  marginTop: 20,
  padding: 16,
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
};

export default TrendsAnalyticsPage;
