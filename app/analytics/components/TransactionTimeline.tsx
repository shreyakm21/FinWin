"use client";

type Txn = {
  date: string;
  narration: string;
  trxtype: "credit" | "debit";
  amount: number;
  runningBalance: number;
};

export default function TransactionTimeline({ data }: { data: Txn[] }) {
  return (
    <div
      style={{
        marginTop: "32px",
        background: "#111",
        padding: "16px",
        borderRadius: "12px",
        color: "#fff"
      }}
    >
      <h3 style={{ marginBottom: "16px" }}>🕒 Transaction Timeline</h3>

      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {data.map((tx, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: "1px solid #222"
            }}
          >
            <div>
              <div style={{ fontSize: "13px", opacity: 0.6 }}>{tx.date}</div>
              <div>{tx.narration}</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: tx.trxtype === "credit" ? "#4ade80" : "#f87171"
                }}
              >
                {tx.trxtype === "credit" ? "+" : "-"}₹
                {tx.amount.toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.6 }}>
                Bal: ₹{tx.runningBalance.toLocaleString()}
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div style={{ opacity: 0.6 }}>No transactions found</div>
        )}
      </div>
    </div>
  );
}
