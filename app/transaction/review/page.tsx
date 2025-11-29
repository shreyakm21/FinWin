"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "txData";

const ReviewPage: React.FC = () => {
  const router = useRouter();
  const [tx, setTx] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/transaction");
      return;
    }
    try {
      setTx(JSON.parse(raw));
    } catch {
      router.replace("/transaction");
    }
  }, [router]);

  if (!tx) return null;

  const formattedAmount =
    tx.amount && !isNaN(Number(tx.amount))
      ? `₹ ${Number(tx.amount).toLocaleString("en-IN")}`
      : "₹ 0";

  return (
    <div className="transaction-page">
      <header className="transaction-top-bar">
        <div className="transaction-logo-mark">*</div>
        <div className="transaction-logo-text">FinWinTransfer</div>
      </header>

      <main className="transaction-page-inner">
        <section className="transaction-stepper">
          <div className="transaction-step">
            <div className="transaction-step-number">1</div>
            <div className="transaction-step-label">Details</div>
          </div>
          <div className="transaction-step transaction-step--active">
            <div className="transaction-step-number">2</div>
            <div className="transaction-step-label">Review</div>
          </div>
          <div className="transaction-step">
            <div className="transaction-step-number">3</div>
            <div className="transaction-step-label">Confirm</div>
          </div>
        </section>

        <section className="transaction-content-grid">
          <div className="transaction-card" style={{ gridColumn: "1 / -1" }}>
            <h2 className="transaction-card-title">Transfer Summary</h2>

            <div className="transaction-summary-list">
              <div className="transaction-summary-row">
                <span className="transaction-summary-label">Payment Mode:</span>
                <span className="transaction-summary-value">
                  {tx.paymentMode || "—"}
                </span>
              </div>
              <div className="transaction-summary-row">
                <span className="transaction-summary-label">Amount:</span>
                <span className="transaction-summary-value transaction-summary-value--amount">
                  {formattedAmount}
                </span>
              </div>
              <div className="transaction-summary-row">
                <span className="transaction-summary-label">Receiver:</span>
                <span className="transaction-summary-value">
                  {tx.receiverName || "—"}
                </span>
              </div>
              <div className="transaction-summary-row">
                <span className="transaction-summary-label">Account No.:</span>
                <span className="transaction-summary-value">
                  {tx.accountNumber || "—"}
                </span>
              </div>
              <div className="transaction-summary-row">
                <span className="transaction-summary-label">Branch:</span>
                <span className="transaction-summary-value">
                  {tx.branch || "—"}
                </span>
              </div>
              <div className="transaction-summary-row">
                <span className="transaction-summary-label">Date:</span>
                <span className="transaction-summary-value">
                  {tx.createdAt
                    ? tx.createdAt.slice(0, 10)
                    : new Date().toISOString().slice(0, 10)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="transaction-summary-section-title">Narration:</div>
              <div className="transaction-summary-value" style={{ marginTop: 6 }}>
                {tx.narration || "—"}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                className="transaction-btn-primary"
                style={{
                  background: "#fff",
                  color: "#111",
                  border: "1px solid #e5e7eb",
                  width: 160,
                }}
                onClick={() => router.push("/transaction")}
              >
                ← Back
              </button>
              <button
                className="transaction-btn-primary"
                style={{ width: 160 }}
                onClick={() => router.push("/transaction/confirm")}
              >
                Next →
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReviewPage;
