// app/analytics/components/BalanceLineChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function BalanceLineChart({ data }: any) {
  return (
    <div
      style={{
        background: "#111",
        padding: 16,
        borderRadius: 12,
        marginTop: 32
      }}
    >
      <h3 style={{ color: "#fff", marginBottom: 12 }}>
        💰 Running Balance
      </h3>

      <ResponsiveContainer width="100%" aspect={2}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Line
            dataKey="runningBalance"
            stroke="#60a5fa"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
