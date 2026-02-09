// app/analytics/income/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import MonthlyBarChart from "../components/MonthlyBarChart";
import AnalyticsSkeleton from "../components/AnalyticsSkeleton";
import { supabase } from "../../../utils/supabaseClient";

/* ---------------- helpers ---------------- */

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

/* ---------------- component ---------------- */

const IncomeAnalyticsPage: React.FC = () => {
  // ✅ hooks ALWAYS at top
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any>({ monthly: [] });

  useEffect(() => {
    const loadIncome = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token ?? null;
        if (!token) {
          setLoading(false);
          return;
        }

        const data = await fetchJSON("/api/analytics/monthly", token);
        if (data) setMonthlyData(data);
      } catch (err) {
        console.error("Income analytics failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadIncome();
  }, []);

  // ✅ derived values (NO hooks here)
  const monthly = monthlyData.monthly ?? [];

  const totalIncome = monthly.reduce(
    (sum: number, m: any) => sum + (m.credit || 0),
    0
  );

  const activeIncomeMonths = monthly.filter(m => m.credit > 0).length;

  const avgMonthlyIncome =
    activeIncomeMonths > 0
      ? Math.round(totalIncome / activeIncomeMonths)
      : 0;

  const highestIncomeMonth =
    monthly.length > 0
      ? [...monthly].sort((a, b) => b.credit - a.credit)[0]
      : null;

  /* ---------- Cashflow Intelligence ---------- */

  const totalExpense = monthly.reduce(
    (sum: number, m: any) => sum + (m.debit || 0),
    0
  );

  const netCashflow = totalIncome - totalExpense;

  const burnRate =
    totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  const savingsRate =
    totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;

  /* --- Cashflow Risk --- */
  let riskLevel = "Healthy";
  if (burnRate > 95) riskLevel = "High Risk";
  else if (burnRate > 80) riskLevel = "Moderate Risk";

  /* --- Negative Cashflow --- */
  const negativeMonths = monthly.filter(m => m.debit > m.credit).length;

  /* --- Runway Estimate (months income can sustain spending) --- */
  let runway = "Stable";
  if (avgMonthlyIncome > 0) {
    const avgExpense =
      monthly.length > 0
        ? Math.round(totalExpense / monthly.length)
        : 0;

    const monthsCover = avgMonthlyIncome > 0
      ? Math.round(avgMonthlyIncome / avgExpense)
      : 0;

    if (monthsCover < 1) runway = "Deficit";
    else if (monthsCover < 2) runway = "Tight";
    else runway = "Comfortable";
  }

/* ---------- Financial Health Score ---------- */

// Normalize helpers
const clamp = (v: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, v));

/* --- Savings Score --- */
const savingsScore = clamp(savingsRate * 2); // 50% savings → 100

/* --- Burn Score (lower burn = better) --- */
const burnScore = clamp(100 - burnRate);

/* --- Cashflow Stability --- */
const stabilityScore = clamp(
  negativeMonths === 0 ? 100 : 100 - negativeMonths * 20
);

/* --- Volatility Score (lower volatility = better) --- */
let volatilityPenalty = 0;
if (monthly.length >= 3) {
  const expenses = monthly.map(m => m.debit);
  const mean = expenses.reduce((a, b) => a + b, 0) / expenses.length;
  const variance =
    expenses.reduce((s, v) => s + Math.pow(v - mean, 2), 0) /
    expenses.length;
  const stdDev = Math.sqrt(variance);
  const volatilityPct = (stdDev / mean) * 100;
  volatilityPenalty = clamp(volatilityPct);
}
const volatilityScore = clamp(100 - volatilityPenalty);

/* --- Income Stability Score --- */
let incomeStabilityScore = 80;
if (monthly.length >= 3) {
  const incomes = monthly.map(m => m.credit);
  const mean = incomes.reduce((a, b) => a + b, 0) / incomes.length;
  const variance =
    incomes.reduce((s, v) => s + Math.pow(v - mean, 2), 0) /
    incomes.length;
  const stdDev = Math.sqrt(variance);
  const fluct = (stdDev / mean) * 100;
  incomeStabilityScore = clamp(100 - fluct * 2);
}

/* --- Weighted Final Score --- */
const healthScore = Math.round(
  savingsScore * 0.3 +
  burnScore * 0.2 +
  stabilityScore * 0.2 +
  volatilityScore * 0.15 +
  incomeStabilityScore * 0.15
);

/* --- Score Label --- */
let healthLabel = "Risky 🔴";
if (healthScore >= 80) healthLabel = "Excellent 🟢";
else if (healthScore >= 60) healthLabel = "Good 🟡";
else if (healthScore >= 40) healthLabel = "Needs Attention 🟠";

  

  // ✅ early return AFTER hooks
  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        💰 Income Analytics
      </h1>

      <p style={{ marginTop: "8px", color: "#555" }}>
        Understand how money flows into your account
      </p>

      {/* Financial Health Score */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "14px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 14, color: "#555" }}>
          Financial Health Score
        </div>

        <div style={{ fontSize: 40, fontWeight: "bold", marginTop: 6 }}>
          {healthScore}
        </div>

        <div style={{ fontSize: 16, marginTop: 4 }}>
          {healthLabel}
        </div>

        <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
          Based on savings, spending, stability and cashflow behaviour
        </div>
      </div>


      {/* KPI row */}
      <div
        style={{
          marginTop: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <KPI title="Total Income" value={totalIncome} />

        <KPI
          title="Avg Monthly Income"
          value={avgMonthlyIncome}
          hint={
            activeIncomeMonths === 0
              ? "No income recorded yet"
              : `Across ${activeIncomeMonths} months`
          }
        />

        <KPI title="Net Cashflow" value={netCashflow} />

        <KPI
          title="Burn Rate"
          value={burnRate}
          hint="% of income spent"
        />

        <KPI
          title="Savings Rate"
          value={savingsRate}
          hint="% of income saved"
        />


        {highestIncomeMonth?.credit > 0 && (
          <KPI
            title="Highest Income Month"
            value={highestIncomeMonth.credit}
            hint={highestIncomeMonth.month}
          />
        )}
      </div>

      {/* Income trend */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ marginBottom: "16px" }}>
          Monthly Income Trend
        </h3>
        <MonthlyBarChart
          data={monthly.map(m => ({
            month: m.month,
            credit: m.credit,
            debit: 0,
          }))}
        />
      </div>

      {/* Cashflow Insights */}
      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          borderRadius: "12px",
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <strong>Cashflow Health</strong>

        <ul style={{ marginTop: "8px", lineHeight: 1.7 }}>
          <li>
            Net cashflow:{" "}
            <strong>
              {netCashflow >= 0 ? "Positive" : "Negative"}
            </strong>
          </li>

          <li>
            Burn rate: <strong>{burnRate}%</strong> of income spent
          </li>

          <li>
            Savings rate: <strong>{savingsRate}%</strong>
          </li>

          <li>
            Cashflow risk level: <strong>{riskLevel}</strong>
          </li>

          {negativeMonths > 0 && (
            <li>
              ⚠️ You had {negativeMonths} month(s) with negative cashflow.
            </li>
          )}

          <li>
            Runway status: <strong>{runway}</strong>
          </li>
        </ul>
      </div>


      {/* Explanation */}
      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          borderRadius: "12px",
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <strong>How income is calculated</strong>
        <p style={{ marginTop: "8px", color: "#555", lineHeight: 1.6 }}>
          Income represents money credited to your account through transactions
          (salary, transfers, refunds, etc.).  
          Opening balances and current account balance are not counted as income.
        </p>
      </div>
    </div>
  );
};

/* ---------------- KPI component ---------------- */

function KPI({
  title,
  value,
  hint,
}: {
  title: string;
  value: number;
  hint?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: "14px", color: "#666" }}>{title}</div>
      <div style={{ fontSize: "22px", fontWeight: "bold" }}>
        ₹{value.toLocaleString()}
      </div>
      {hint && (
        <div style={{ marginTop: "4px", fontSize: "13px", color: "#777" }}>
          {hint}
        </div>
      )}
    </div>
  );
}

export default IncomeAnalyticsPage;
