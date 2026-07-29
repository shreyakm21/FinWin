type Props = {
  title: string;
  description: string;
};

export default function EmptyState({ title, description }: Props) {
  return (
    <div
      style={{
        padding: 24,
        background: "#111",
        borderRadius: 12,
        color: "#fff",
        textAlign: "center",
        opacity: 0.7
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: 14 }}>{description}</p>
    </div>
  );
}
