// app/analytics/components/MonthlyBarChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function MonthlyBarChart({ data }: any) {
  return (
    <div
      style={{
        background: "#111",
        padding: 16,
        borderRadius: 12
      }}
    >
      <h3 style={{ color: "#fff", marginBottom: 12 }}>
        Monthly Income vs Expense
      </h3>

      <ResponsiveContainer width="100%" aspect={2}>
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Legend />
          <Bar dataKey="credit" fill="#4ade80" />
          <Bar dataKey="debit" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
