export default function AnalyticsSkeleton() {
  const box = {
    background: "#1a1a1a",
    borderRadius: "12px",
    height: "80px"
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ ...box, width: 220, marginBottom: 24 }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16
        }}
      >
        <div style={box} />
        <div style={box} />
        <div style={box} />
        <div style={box} />
      </div>

      <div style={{ ...box, height: 320, marginTop: 32 }} />
      <div style={{ ...box, height: 320, marginTop: 24 }} />
    </div>
  );
}
