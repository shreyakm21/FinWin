// app/transaction/confirm/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";

// ⭐ REQUIRED
const STORAGE_KEY = "txData";
const SENDER_KEY = "senderAccNo"; // ⭐ sender account number

const ConfirmPage: React.FC = () => {
  const router = useRouter();
  const [tx, setTx] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 🔹 Load transaction + senderAccNo
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const senderAccNo = sessionStorage.getItem(SENDER_KEY);

    console.log("🟡 txData:", raw);
    console.log("🟡 senderAccNo:", senderAccNo);

    if (!raw) {
      router.replace("/transaction");
      return;
    }
    setTx(JSON.parse(raw));
  }, [router]);

  if (!tx) return null;

  // 🔹 Confirm payment
  const handleConfirm = async () => {
    setLoading(true);

    // ✅ sender account number
    const senderAccNo = sessionStorage.getItem(SENDER_KEY);
    if (!senderAccNo) {
      alert("Sender account not found. Please login again.");
      setLoading(false);
      router.push("/finwin_dashboard");
      return;
    }

    // ✅ build payload exactly as backend expects
    const payload = {
      paymentMode: tx.paymentMode,
      senderAccNo: senderAccNo, // ⭐ IMPORTANT
      accountNumber: String(tx.accountNumber), // receiver acc no
      branch: String(tx.branch), // branchId
      amount: String(tx.amount), // amount
      narration: tx.narration || null,
      ignoreGoals: tx.ignoreGoals === true, // ✅ ADD THIS
    };

    console.log("🟢 FINAL PAYLOAD:", payload);

    try {
      // ✅ GET AUTH TOKEN (MOST IMPORTANT FIX)
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session?.access_token) {
        alert("Session expired. Please login again.");
        setLoading(false);
        router.push("/login");
        return;
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`, // ⭐ FIX
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Transaction failed");
        setLoading(false);
        router.push("/transaction");
        return;
      }

      // ✅ SUCCESS
      sessionStorage.removeItem(STORAGE_KEY);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error("❌ Network error:", err);
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
        {/* STEPPER */}
        <section className="transaction-stepper">
          <div className="transaction-step transaction-step--completed">
            <div className="transaction-step-number">✔</div>
            <div className="transaction-step-label">Details</div>
          </div>
          <div className="transaction-step transaction-step--completed">
            <div className="transaction-step-number">✔</div>
            <div className="transaction-step-label">Review</div>
          </div>
          <div
            className={`transaction-step ${
              success ? "transaction-step--completed" : "transaction-step--active"
            }`}
          >
            <div className="transaction-step-number">
              {success ? "✔" : "3"}
            </div>
            <div className="transaction-step-label">Confirm</div>
          </div>
        </section>

        {/* CARD */}
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
