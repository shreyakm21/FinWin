// app/analytics/trends/page.tsx
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

const TrendsAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any>({ monthly: [] });
  const [timelineData, setTimelineData] = useState<any>({ transactions: [] });

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

  if (loading) {
    return <AnalyticsSkeleton />;
  }

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
        <h3 style={{ marginBottom: "16px" }}>
          Monthly Income vs Expense
        </h3>
        <MonthlyBarChart data={monthlyData.monthly} />
      </div>

      {/* Balance trend */}
      <div style={{ marginTop: "48px" }}>
        <h3 style={{ marginBottom: "16px" }}>
          Balance Over Time
        </h3>
        <BalanceLineChart data={timelineData.transactions} />
      </div>

      {/* Transaction timeline */}
      <div style={{ marginTop: "48px" }}>
        <h3 style={{ marginBottom: "16px" }}>
          Transaction Timeline
        </h3>
        <TransactionTimeline data={timelineData.transactions} />
      </div>
    </div>
  );
};

export default TrendsAnalyticsPage;
