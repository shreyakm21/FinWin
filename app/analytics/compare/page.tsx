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

function predictNextExpense(monthly: any[]) {
  if (monthly.length < 2) return 0;

  const last = monthly.slice(-3); // last 3 months
  const values = last.map(m => m.debit);

  const avg =
    values.reduce((a, b) => a + b, 0) / values.length;

  const trend =
    values.length >= 2
      ? values[values.length - 1] - values[0]
      : 0;

  return Math.max(0, Math.round(avg + trend / 2));
}

function avgExpense(monthly: any[]) {
  if (!monthly.length) return 0;
  return (
    monthly.reduce((sum, m) => sum + m.debit, 0) /
    monthly.length
  );
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
        if (!token) return setLoading(false);

        const data = await fetchJSON("/api/analytics/monthly", token);

        if (data?.monthly?.length) {
          setMonthly(data.monthly);

          const last = data.monthly[data.monthly.length - 1]?.month;
          const prev = data.monthly[data.monthly.length - 2]?.month ?? last;

          setToMonth(last);
          setFromMonth(prev);
        }
      } catch (err) {
        console.error("Compare load failed:", err);
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
  const netFrom = fromData.credit - fromData.debit;
  const netTo = toData.credit - toData.debit;
  const netDelta = netTo - netFrom;

  const expensePct = percentChange(fromData.debit, toData.debit);
  const savingsRateFrom = fromData.credit
    ? (netFrom / fromData.credit) * 100
    : 0;
  const savingsRateTo = toData.credit
    ? (netTo / toData.credit) * 100
    : 0;

  if (loading) return <AnalyticsSkeleton />;
  if (!monthly.length) return <div style={{ padding: 24 }}>No data</div>;

  const sameMonthYoY =
    fromMonth.slice(5, 7) === toMonth.slice(5, 7) &&
    fromMonth.slice(0, 4) !== toMonth.slice(0, 4);

  const spike = expensePct > 25;
  const betterMonth = netTo > netFrom ? "to" : "from";

  /* ---------- Prediction ---------- */

  const predictedExpense = predictNextExpense(monthly);
  const historicalAvg = avgExpense(monthly);

  /* ---------- Smart Alerts ---------- */

  const alerts: string[] = [];

  if (toData.debit > historicalAvg * 1.25) {
    alerts.push("⚠️ You are spending significantly above your usual pattern");
  }

  if (expensePct > 30) {
    alerts.push("🔥 Sudden expense spike detected");
  }

  if (savingsRateTo < savingsRateFrom) {
    alerts.push("💸 Savings rate has dropped");
  }

  if (toData.debit > toData.credit * 0.9) {
    alerts.push("🚨 High burn-rate — expenses close to income");
  }


  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>🆚 Compare Months</h1>

      {/* selectors */}
      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <select value={fromMonth} onChange={e => setFromMonth(e.target.value)}>
          {monthly.map(m => (
            <option key={m.month} value={m.month}>
              {m.label ?? m.month}
            </option>
          ))}
        </select>

        <span>vs</span>

        <select value={toMonth} onChange={e => setToMonth(e.target.value)}>
          {monthly.map(m => (
            <option key={m.month} value={m.month}>
              {m.label ?? m.month}
            </option>
          ))}
        </select>
      </div>

      {/* KPI grid */}
      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <KPI title="Expense" prev={fromData.debit} curr={toData.debit} inverse />
        <KPI title="Income" prev={fromData.credit} curr={toData.credit} />
        <KPI title="Net Balance" prev={netFrom} curr={netTo} />
        <KPI
          title="Savings Rate"
          prev={savingsRateFrom}
          curr={savingsRateTo}
          isPercent
        />
      </div>

      {/* Smart Insights */}
      <div
        style={{
          marginTop: 28,
          padding: 16,
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <strong>Insights</strong>

        <ul style={{ marginTop: 8, lineHeight: 1.7 }}>
          <li>
            Spending {expenseDelta <= 0 ? "decreased" : "increased"} by ₹
            {Math.abs(expenseDelta).toLocaleString()} ({expensePct.toFixed(1)}%)
          </li>

          {sameMonthYoY && (
            <li>📅 Comparing same month across different years (YoY)</li>
          )}

          {spike && <li>🔥 Spending spike detected this month</li>}

          <li>
            💰 Better financial performance in{" "}
            <strong>
              {betterMonth === "to"
                ? monthly.find(m => m.month === toMonth)?.label
                : monthly.find(m => m.month === fromMonth)?.label}
            </strong>
          </li>

          <li>
            Savings rate changed from {savingsRateFrom.toFixed(1)}% →{" "}
            {savingsRateTo.toFixed(1)}%
          </li>
        </ul>
      </div>

      {/* Prediction */}
      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          background: "#eef6ff",
          border: "1px solid #c7ddff",
        }}
      >
        <strong>📊 Prediction</strong>

        <p style={{ marginTop: 6 }}>
          Based on your recent trend, your expected expense next month is:
        </p>

        <h2 style={{ marginTop: 6 }}>
          ₹{predictedExpense.toLocaleString()}
        </h2>

        <small style={{ color: "#555" }}>
          (Calculated from last 3 months spending behaviour)
        </small>
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
          }}
        >
          <strong>🔔 Smart Alerts</strong>

          <ul style={{ marginTop: 8, lineHeight: 1.6 }}>
            {alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}


    </div>
  );
};

/* ---------------- KPI ---------------- */

function KPI({
  title,
  prev,
  curr,
  inverse = false,
  isPercent = false,
}: {
  title: string;
  prev: number;
  curr: number;
  inverse?: boolean;
  isPercent?: boolean;
}) {
  const delta = curr - prev;
  const pct = percentChange(prev, curr);
  const good = inverse ? delta <= 0 : delta >= 0;

  return (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: 14, color: "#666" }}>{title}</div>

      <div style={{ fontSize: 22, fontWeight: "bold" }}>
        {isPercent
          ? `${curr.toFixed(1)}%`
          : `₹${curr.toLocaleString()}`}
      </div>

      <div style={{ color: good ? "green" : "red", fontSize: 14 }}>
        {delta >= 0 ? "▲" : "▼"}{" "}
        {isPercent
          ? `${Math.abs(delta).toFixed(1)}%`
          : `₹${Math.abs(delta).toLocaleString()}`}{" "}
        ({pct.toFixed(1)}%)
      </div>
    </div>
  );
}

export default AnalyticsComparePage;
