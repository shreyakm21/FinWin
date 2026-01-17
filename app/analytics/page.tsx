// app/analytics/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";

type AnalyticsTile = {
  title: string;
  description: string;
  emoji: string;
  route: string;
};

const ANALYTICS_TILES: AnalyticsTile[] = [
  {
    title: "Overview",
    description: "Quick snapshot of income, spending, and balance",
    emoji: "📊",
    route: "/analytics/overview",
  },
  {
    title: "Spending",
    description: "Where your money goes and top expense categories",
    emoji: "💸",
    route: "/analytics/spending",
  },
  {
    title: "Income & Cashflow",
    description: "Money coming in and net cash movement",
    emoji: "💰",
    route: "/analytics/income",
  },
  {
    title: "Trends",
    description: "Monthly patterns and balance over time",
    emoji: "📈",
    route: "/analytics/trends",
  },
  {
    title: "Insights",
    description: "Personalised observations and behaviour insights",
    emoji: "🧠",
    route: "/analytics/insights",
  },
  {
    title: "Compare",
    description: "Compare financial data across different periods",
    emoji: "🆚",
    route: "/analytics/compare",
  },
];

const AnalyticsHubPage: React.FC = () => {
  const router = useRouter();

  return (
    <div style={{ padding: "32px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "bold" }}>
        📊 Analytics
      </h1>
      <p style={{ marginTop: "8px", color: "#555", fontSize: "16px" }}>
        Choose the type of analytics you want to explore
      </p>

      <div
        style={{
          marginTop: "32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px",
        }}
      >
        {ANALYTICS_TILES.map(tile => (
          <div
            key={tile.title}
            onClick={() => router.push(tile.route)}
            style={{
              cursor: "pointer",
              padding: "24px",
              borderRadius: "14px",
              background: "#ffffff",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform =
                "translateY(-4px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 10px 24px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "none";
              (e.currentTarget as HTMLDivElement).style.boxShadow =
                "0 6px 18px rgba(0,0,0,0.08)";
            }}
          >
            <div style={{ fontSize: "34px" }}>{tile.emoji}</div>
            <h3
              style={{
                marginTop: "12px",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              {tile.title}
            </h3>
            <p style={{ marginTop: "6px", color: "#666", fontSize: "14px" }}>
              {tile.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsHubPage;
