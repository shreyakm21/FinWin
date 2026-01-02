"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "txData";

const ConfirmPage: React.FC = () => {
  const router = useRouter();

  const [tx, setTx] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🔹 Load transaction
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/transaction");
      return;
    }
    setTx(JSON.parse(raw));
  }, [router]);

  if (!tx) return null;

  // 🔹 Confirm payment (FIXED)
  const handleConfirm = async () => {
    setLoading(true);

    // ✅ IMPORTANT FIX: send correct types
    const payload = {
      ...tx,
      accountNumber: String(tx.accountNumber),
      branch: String(tx.branch),
      amount: String(tx.amount),
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // ❌ Backend error
      if (!res.ok) {
        alert(data.error || "Transaction failed");
        setLoading(false);

        // 👉 OK केल्यावर Details page
        router.push("/transaction");
        return;
      }

      // ✅ SUCCESS
      sessionStorage.removeItem(STORAGE_KEY);
      setSuccess(true);
      setLoading(false);
    } catch {
      alert("Network error");
      setLoading(false);
      router.push("/transaction");
    }
  };

  const formattedAmount =
    tx.amount && !isNaN(Number(tx.amount))
      ? `₹ ${Number(tx.amount).toLocaleString("en-IN")}`
      : "₹ 0";

  return (
    <div className="transaction-page">
      {/* HEADER */}
      <header className="transaction-top-bar">
        <div className="transaction-logo-mark">*</div>
        <div className="transaction-logo-text">FinWinTransfer</div>
      </header>

      <main className="transaction-page-inner">
        {/* ===== STEPPER ===== */}
        <section className="transaction-stepper">
          <div className="transaction-step transaction-step--completed">
            <div className="transaction-step-number">✔</div>
            <div className="transaction-step-label">Details</div>
          </div>

          <div className="transaction-step transaction-step--completed">
            <div className="transaction-step-number">✔</div>
            <div className="transaction-step-label">Review</div>
          </div>

          {/* ✅ CONFIRM STEP */}
          <div
            className={`transaction-step ${
              success
                ? "transaction-step--completed"
                : "transaction-step--active"
            }`}
          >
            <div className="transaction-step-number">
              {success ? "✔" : "3"}
            </div>
            <div className="transaction-step-label">Confirm</div>
          </div>
        </section>

        {/* ===== CARD ===== */}
        <section className="transaction-content-grid">
          <div
            className="transaction-card"
            style={{ gridColumn: "1 / -1", textAlign: "center" }}
          >
            {!success ? (
              <>
                <h2 className="transaction-card-title">
                  Ready to Complete Transaction
                </h2>

                <p style={{ marginTop: 10 }}>
                  You are sending <strong>{formattedAmount}</strong> to{" "}
                  <strong>{tx.receiverName}</strong>
                </p>

                <div style={{ marginTop: 24 }}>
                  <button
                    className="transaction-btn-primary"
                    onClick={handleConfirm}
                    disabled={loading}
                    style={{ width: 240 }}
                  >
                    {loading ? "Processing..." : "Confirm Payment"}
                  </button>
                </div>

                <div style={{ marginTop: 16 }}>
                  <button
                    className="transaction-btn-secondary"
                    onClick={() => router.push("/finwin_dashboard")}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2
                  className="transaction-card-title"
                  style={{ color: "#16a34a" }}
                >
                  ✔ Transaction Successful
                </h2>

                <p style={{ marginTop: 10 }}>
                  <strong>{formattedAmount}</strong> sent to{" "}
                  <strong>{tx.receiverName}</strong>
                </p>

                <div style={{ marginTop: 24 }}>
                  <button
                    className="transaction-btn-primary"
                    onClick={() => router.push("/transaction")}
                    style={{ width: 260 }}
                  >
                    Make Another Transaction
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ConfirmPage;
