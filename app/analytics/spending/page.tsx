// app/analytics/spending/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import CategoryPieChart from "../components/CategoryPieChart";
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


type WeekdaySpending = {
  Mon: number;
  Tue: number;
  Wed: number;
  Thu: number;
  Fri: number;
  Sat: number;
  Sun: number;
};

const SpendingAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
const [weekdaySpending, setWeekdaySpending] =
  useState<WeekdaySpending | null>(null);

/* ---------- Peak Spending Day ---------- */

let peakDay: string | null = null;
let peakValue = 0;

if (weekdaySpending) {
  for (const [day, amt] of Object.entries(
    weekdaySpending as Record<string, number>
  )) {
    if (amt > peakValue) {
      peakValue = amt;
      peakDay = day;
    }
  }
}


  useEffect(() => {
    const loadSpending = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token ?? null;

        if (!token) {
          setLoading(false);
          return;
        }

        const data = await fetchJSON("/api/analytics/categories", token);

        if (data) {
          setTotalExpense(data.totalExpense);
          setCategories(data.categories);
          setWeekdaySpending(data.weekdaySpending ?? null);
        }
      } catch (err) {
        console.error("Spending analytics failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSpending();
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  const topCategory = categories?.[0] ?? null;
  /* ---------- Advanced Spending Metrics ---------- */

  const top3 = categories.slice(0, 3);

  const top3Total = top3.reduce((s, c) => s + c.amount, 0);

  const concentration =
    totalExpense > 0 ? (top3Total / totalExpense) * 100 : 0;

  // Silent drain → many small expenses category
  const smallCategories = categories.filter(
    c => (c.amount / totalExpense) * 100 < 5
  );
  const silentDrain = smallCategories.length >= 3;

  // Category dominance (single category too high)
  const dominance =
    topCategory && totalExpense > 0
      ? (topCategory.amount / totalExpense) * 100
      : 0;


/* ---------- Smart Saving Suggestions ---------- */

// If user reduces top category by 10%
const potentialSave =
  topCategory && totalExpense > 0
    ? Math.round(topCategory.amount * 0.1)
    : 0;

// Silent drain combined value
const silentDrainTotal = smallCategories.reduce(
  (s, c) => s + c.amount,
  0
);

// Suggested rebalance threshold
const rebalance = dominance > 50;

/* ---------- Category Prediction (Lightweight) ---------- */

// Predict next month category spend based on current proportion
const predictedCategories = top3.map(c => ({
  category: c.category,
  predicted: Math.round(c.amount * 1.05) // assume slight growth
}));

const dominantNext = predictedCategories[0] ?? null;



  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        💸 Spending Analytics
      </h1>

      <p style={{ marginTop: "8px", color: "#555" }}>
        Understand where your money is going
      </p>

      {/* KPI Row */}
      <div
        style={{
          marginTop: "24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={kpiBox}>
          <div style={kpiLabel}>Total Spent</div>
          <div style={kpiValue}>₹{totalExpense.toLocaleString()}</div>
        </div>

        {topCategory && (
          <div style={kpiBox}>
            <div style={kpiLabel}>Top Category</div>
            <div style={kpiValue}>
              {topCategory.category}
            </div>
            <div style={kpiSub}>
              ₹{topCategory.amount.toLocaleString()}
            </div>
          </div>
        )}

        {topCategory && (
          <div style={kpiBox}>
            <div style={kpiLabel}>Top Category Share</div>
            <div style={kpiValue}>
              {Math.round((topCategory.amount / totalExpense) * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ marginBottom: "16px" }}>
          Spending by Category
        </h3>
        <CategoryPieChart data={categories} />
      </div>

      {/* Spending Heatmap */}
      {weekdaySpending && (
        <div style={{ marginTop: 40 }}>
          <h3>Spending by Day of Week</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 10,
              marginTop: 12
            }}
          >
            {Object.entries(weekdaySpending as Record<string, number>).map(([day, amt]) => {
              const intensity =
                totalExpense > 0 ? Math.min(1, amt / (totalExpense / 7)) : 0;

              return (
                <div
                  key={day}
                  style={{
                    padding: "12px",
                    borderRadius: 8,
                    background: `rgba(96,165,250,${0.2 + intensity * 0.8})`,
                    textAlign: "center",
                    fontSize: 13
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>{day}</div>
                  <div>₹{amt.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Heatmap Insight */}
      {peakDay && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            fontSize: 14
          }}
        >
          🔎 Highest average spending occurs on <strong>{peakDay}</strong> (₹
          {peakValue.toLocaleString()}).
        </div>
      )}


      {/* Top Drivers */}
      <div style={{ marginTop: "32px" }}>
        <h3>Top Expense Drivers</h3>

        <ul style={{ marginTop: 12, lineHeight: 1.7 }}>
          {top3.map((c, i) => (
            <li key={i}>
              <strong>{c.category}</strong> — ₹
              {c.amount.toLocaleString()} (
              {Math.round((c.amount / totalExpense) * 100)}%)
            </li>
          ))}
        </ul>
      </div>



      {/* Smart Insights */}
      <div
        style={{
          marginTop: 32,
          padding: 16,
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
        }}
      >
        <strong>Insights</strong>

        <ul style={{ marginTop: 10, lineHeight: 1.7 }}>
          {dominance > 50 && (
            <li>
              ⚠️ More than half of your spending is in{" "}
              <strong>{topCategory.category}</strong>.
            </li>
          )}

          {silentDrain && (
            <li>
              🧾 Multiple small expense categories detected — possible
              “silent drain”.
            </li>
          )}

          {concentration > 70 && (
            <li>
              🔥 Spending is highly concentrated in a few categories.
            </li>
          )}

          {concentration < 40 && (
            <li>
              ✅ Your spending is well distributed across categories.
            </li>
          )}
        </ul>
      </div>


      {/* Spending Concentration */}
      <div style={kpiBox}>
        <div style={kpiLabel}>Spending Concentration</div>
        <div style={kpiValue}>{concentration.toFixed(0)}%</div>
        <div style={kpiSub}>
          {concentration > 70
            ? "Highly concentrated"
            : concentration > 50
            ? "Moderate concentration"
            : "Well diversified"}
        </div>
      </div>

      {/* Saving Suggestions */}
      <div
        style={{
          marginTop: 28,
          padding: 16,
          borderRadius: 12,
          background: "#eefdf5",
          border: "1px solid #bbf7d0",
        }}
      >
        <strong>💡 Smart Saving Suggestions</strong>

        <ul style={{ marginTop: 10, lineHeight: 1.7 }}>
          {topCategory && (
            <li>
              Reducing <strong>{topCategory.category}</strong> spending by just 10%
              could save approx <strong>₹{potentialSave.toLocaleString()}</strong>.
            </li>
          )}

          {silentDrain && (
            <li>
              Small expenses together cost you ₹
              {silentDrainTotal.toLocaleString()} — review minor categories.
            </li>
          )}

          {rebalance && (
            <li>
              Your spending is heavily skewed. Rebalancing categories may improve
              savings.
            </li>
          )}

          {!rebalance && (
            <li>
              Your spending distribution looks healthy — keep it balanced.
            </li>
          )}
        </ul>
      </div>

      {/* Category Forecast */}
      <div
        style={{
          marginTop: 28,
          padding: 16,
          borderRadius: 12,
          background: "#f0f7ff",
          border: "1px solid #c7ddff",
        }}
      >
        <strong>📊 Next Month Category Forecast</strong>

        {dominantNext ? (
          <>
            <p style={{ marginTop: 8 }}>
              Likely dominant category:{" "}
              <strong>{dominantNext.category}</strong>
            </p>

            <ul style={{ marginTop: 8, lineHeight: 1.7 }}>
              {predictedCategories.map((c, i) => (
                <li key={i}>
                  {c.category}: ₹{c.predicted.toLocaleString()} (estimated)
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p style={{ marginTop: 8 }}>Not enough data for prediction.</p>
        )}
      </div>



    </div>
  );
};

/* --- styles --- */
const kpiBox: React.CSSProperties = {
  background: "#fff",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

const kpiLabel: React.CSSProperties = {
  fontSize: "14px",
  color: "#666",
};

const kpiValue: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: "bold",
  marginTop: "4px",
};

const kpiSub: React.CSSProperties = {
  fontSize: "14px",
  color: "#444",
  marginTop: "2px",
};

export default SpendingAnalyticsPage;
