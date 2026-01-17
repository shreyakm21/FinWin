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

const SpendingAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);

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
