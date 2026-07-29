// app/analytics/components/CategoryPieChart.tsx

"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#60a5fa", "#fbbf24", "#f87171", "#34d399", "#a78bfa"];

type Props = {
  data: {
    category: string;
    amount: number;
  }[];
};

export default function CategoryPieChart({ data }: Props) {
  return (
    <div
      style={{
        background: "#111",
        padding: 16,
        borderRadius: 12
      }}
    >
      <h3 style={{ color: "#fff", marginBottom: 12 }}>
        Expense Categories
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            outerRadius={90}
            label
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
