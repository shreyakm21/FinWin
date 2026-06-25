type KPICardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function KPICard({ title, value, subtitle }: KPICardProps) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "#111",
        color: "#fff",
        minWidth: "220px"
      }}
    >
      <div style={{ fontSize: "14px", opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "6px" }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.6 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
