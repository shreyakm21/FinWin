// app/analytics/components/InsightCard.tsx
type InsightCardProps = {
  title: string;
  content: string;
  subtext?: string;
};

export default function InsightCard({ title, content, subtext }: InsightCardProps) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "12px",
        background: "#fff",
        color: "#111",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)"

      }}
    >
      <div style={{ fontSize: "14px", opacity: 0.7 }}>{title}</div>

      <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "8px" }}>
        {content}
      </div>

      {subtext && (
        <div style={{ fontSize: "12px", opacity: 0.6, marginTop: "6px" }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
