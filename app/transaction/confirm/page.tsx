
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "txData";

const ConfirmPage: React.FC = () => {
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
          <div className="transaction-step">
            <div className="transaction-step-number">2</div>
            <div className="transaction-step-label">Review</div>
          </div>
          <div className="transaction-step transaction-step--active">
            <div className="transaction-step-number">3</div>
            <div className="transaction-step-label">Confirm</div>
          </div>
        </section>

        <section className="transaction-content-grid">
          <div className="transaction-card" style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            <h2 className="transaction-card-title" style={{ color: "#16a34a" }}>
              ✔ Transaction Successful
            </h2>
            <p style={{ marginTop: 8 }}>
              You sent <strong>{formattedAmount}</strong> to{" "}
              <strong>{tx.receiverName || "receiver"}</strong>.
            </p>

            <div style={{ marginTop: 24 }}>
              <button
                className="transaction-btn-primary"
                style={{ width: 200 }}
                onClick={() => {
                  sessionStorage.removeItem(STORAGE_KEY);
                  router.push("/transaction");
                }}
              >
                Make Another Transfer
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ConfirmPage;
