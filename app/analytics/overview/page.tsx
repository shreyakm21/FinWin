// app/analytics/overview/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import KPIRow from "./../components/KPIRow";
import MonthlyBarChart from "./../components/MonthlyBarChart";
import CategoryPieChart from "./../components/CategoryPieChart";
import InsightCards from "./../components/InsightCards";
import TransactionTimeline from "./../components/TransactionTimeline";
import BalanceLineChart from "./../components/BalanceLineChart";
import AnalyticsSkeleton from "./../components/AnalyticsSkeleton";
import { supabase } from "../../../utils/supabaseClient";

/**
 * Helper to fetch API JSON using Bearer token
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

const AnalyticsOverviewPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [monthlyData, setMonthlyData] = useState<any>({
    monthly: [],
    kpis: {
      totalIncome: 0,
      totalExpense: 0,
      net: 0,
      avgTxnAmount: 0,
      transactionCount: 0,
    },
  });

  const [categoriesData, setCategoriesData] = useState<any>({
    categories: [],
    totalExpense: 0,
  });

  const [insightsData, setInsightsData] = useState<any>({
    confidence: { label: "Low", transactionCount: 0, months: 0 },
    insights: {
      topExpenseCategory: null,
      savingsRate: null,
      biggestPurchase: null,
    },
  });

  const [timelineData, setTimelineData] = useState<any>({
    transactions: [],
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token ?? null;

        if (!token) {
          console.warn("No access token found for analytics");
          setLoading(false);
          return;
        }

        const [monthly, categories, insights, timeline] = await Promise.all([
          fetchJSON("/api/analytics/monthly", token),
          fetchJSON("/api/analytics/categories", token),
          fetchJSON("/api/analytics/insights", token),
          fetchJSON("/api/analytics/timeline", token),
        ]);

        if (monthly) setMonthlyData(monthly);
        if (categories) setCategoriesData(categories);
        if (insights) setInsightsData(insights);
        if (timeline) setTimelineData(timeline);
      } catch (err) {
        console.error("Analytics load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        📊 Analytics Overview
      </h1>

      <KPIRow monthly={monthlyData} insights={insightsData} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          marginTop: "32px",
        }}
      >
        <MonthlyBarChart data={monthlyData.monthly} />
        <CategoryPieChart data={categoriesData.categories} />
      </div>

      <InsightCards insights={insightsData} />
      <BalanceLineChart data={timelineData.transactions} />
      <TransactionTimeline data={timelineData.transactions} />
    </div>
  );
};

export default AnalyticsOverviewPage;
