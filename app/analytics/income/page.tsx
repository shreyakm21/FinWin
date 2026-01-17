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
