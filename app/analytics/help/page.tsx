"use client";

import React from "react";

const TERMS = [
  {
    title: "Financial Health Score",
    desc: "A score from 0–100 showing your overall financial condition based on savings, spending, stability, and cashflow.",
  },
  {
    title: "Burn Rate",
    desc: "The percentage of your income that you spend. Lower burn rate means better financial control.",
  },
  {
    title: "Savings Rate",
    desc: "The percentage of your income that you keep after expenses.",
  },
  {
    title: "Net Cashflow",
    desc: "Income minus expenses. Positive means you are saving, negative means you are spending more than you earn.",
  },
  {
    title: "Volatility",
    desc: "How much your spending fluctuates month to month. High volatility means irregular spending.",
  },
  {
    title: "Income Stability",
    desc: "How consistent your income is over time. Stable income indicates predictable cashflow.",
  },
  {
    title: "Runway",
    desc: "How sustainable your finances are based on your income and spending pattern.",
  },
  {
    title: "Negative Cashflow",
    desc: "A situation where expenses exceed income in a given period.",
  },
  {
    title: "Trend Direction",
    desc: "Shows whether your financial situation is improving, declining, or stable over time.",
  },
  {
    title: "Spending Concentration",
    desc: "Indicates whether most of your spending is focused in a few categories.",
  },
  {
    title: "Silent Drain",
    desc: "Small frequent expenses that together reduce your savings significantly.",
  },
  {
    title: "Expense Acceleration",
    desc: "When your spending is increasing rapidly compared to previous months.",
  },
];

export default function HelpGlossaryPage() {
  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold" }}>
        📘 Analytics Help & Glossary
      </h1>

      <p style={{ marginTop: 8, color: "#555" }}>
        Understand what each financial metric means and how to interpret your
        analytics.
      </p>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {TERMS.map((t, i) => (
          <div
            key={i}
            style={{
              padding: 16,
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ fontWeight: 600 }}>{t.title}</div>
            <div style={{ marginTop: 6, color: "#555", fontSize: 14 }}>
              {t.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
