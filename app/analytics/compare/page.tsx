// app/analytics/compare/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
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

function percentChange(prev: number, curr: number) {
  if (prev === 0 && curr === 0) return 0;
  if (prev === 0) return 100;
  return ((curr - prev) / prev) * 100;
}

/* ---------------- component ---------------- */

const AnalyticsComparePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [fromMonth, setFromMonth] = useState<string>("");
  const [toMonth, setToMonth] = useState<string>("");

  useEffect(() => {
    const load = async () => {
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
        if (data?.monthly?.length) {
          setMonthly(data.monthly);

          // default: last two months
          const months = data.monthly.map((m: any) => m.month);
          setToMonth(months[months.length - 1]);
          setFromMonth(months[months.length - 2] ?? months[0]);
        }
      } catch (err) {
        console.error("Comparison load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const fromData = useMemo(
    () => monthly.find(m => m.month === fromMonth) ?? { credit: 0, debit: 0 },
    [monthly, fromMonth]
  );

  const toData = useMemo(
    () => monthly.find(m => m.month === toMonth) ?? { credit: 0, debit: 0 },
    [monthly, toMonth]
  );

  const expenseDelta = toData.debit - fromData.debit;
  const incomeDelta = toData.credit - fromData.credit;
  const netDelta =
    toData.credit - toData.debit - (fromData.credit - fromData.debit);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!monthly.length) {
    return (
      <div style={{ padding: "24px" }}>
        <h1>🆚 Comparison</h1>
        <p>No data available for comparison.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        🆚 Compare Months
      </h1>

      <p style={{ marginTop: "8px", color: "#555" }}>
        See how your financial behaviour changed over time
      </p>

      {/* selectors */}
      <div
        style={{
          marginTop: "24px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <select value={fromMonth} onChange={e => setFromMonth(e.target.value)}>
          {monthly.map(m => (
            <option key={m.month} value={m.month}>
              {m.month}
            </option>
          ))}
        </select>

        <span style={{ alignSelf: "center" }}>vs</span>

        <select value={toMonth} onChange={e => setToMonth(e.target.value)}>
          {monthly.map(m => (
            <option key={m.month} value={m.month}>
              {m.month}
            </option>
          ))}
        </select>
      </div>

      {/* KPI comparison */}
      <div
        style={{
          marginTop: "32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        <KPI
          title="Total Expense"
          prev={fromData.debit}
          curr={toData.debit}
          delta={expenseDelta}
          inverse
        />
        <KPI
          title="Total Income"
          prev={fromData.credit}
          curr={toData.credit}
          delta={incomeDelta}
        />
        <KPI
          title="Net Change"
          prev={fromData.credit - fromData.debit}
          curr={toData.credit - toData.debit}
          delta={netDelta}
        />
      </div>

      {/* summary */}
      <div
        style={{
          marginTop: "32px",
          padding: "16px",
          borderRadius: "12px",
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <strong>Summary</strong>
        <ul style={{ marginTop: "8px", lineHeight: 1.7 }}>
          <li>
            You {expenseDelta <= 0 ? "reduced" : "increased"} spending by{" "}
            <strong>₹{Math.abs(expenseDelta).toLocaleString()}</strong>
          </li>
          <li>
            Income changed by{" "}
            <strong>₹{Math.abs(incomeDelta).toLocaleString()}</strong>
          </li>
          <li>
            Overall net position{" "}
            {netDelta >= 0 ? "improved" : "declined"}
          </li>
        </ul>
      </div>
    </div>
  );
};

/* ---------------- KPI component ---------------- */

function KPI({
  title,
  prev,
  curr,
  delta,
  inverse = false,
}: {
  title: string;
  prev: number;
  curr: number;
  delta: number;
  inverse?: boolean;
}) {
  const pct = percentChange(prev, curr);
  const isGood = inverse ? delta <= 0 : delta >= 0;

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
        ₹{curr.toLocaleString()}
      </div>
      <div
        style={{
          marginTop: "6px",
          color: isGood ? "green" : "red",
          fontSize: "14px",
        }}
      >
        {delta >= 0 ? "▲" : "▼"} ₹{Math.abs(delta).toLocaleString()} (
        {pct.toFixed(1)}%)
      </div>
    </div>
  );
}

export default AnalyticsComparePage;
