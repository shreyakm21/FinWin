"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "txData";

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      router.push("/transaction");
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) return null;

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

          <div className="transaction-step transaction-step--active">
            <div className="transaction-step-number">2</div>
            <div className="transaction-step-label">Review</div>
          </div>

          <div className="transaction-step">
            <div className="transaction-step-number">3</div>
            <div className="transaction-step-label">Confirm</div>
          </div>
        </section>

        {/* ===== CENTERED CONTENT ===== */}
        <section
          className="transaction-content-grid"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 40,
          }}
        >
          {/* ===== SUMMARY CARD ===== */}
          <div
            className="transaction-card"
            style={{ maxWidth: 420, width: "100%" }}
          >
            <h3 className="transaction-card-title">Transfer Summary</h3>

            <div className="summary-row">
              <span>Payment Mode</span>
              <span className="badge">{data.paymentMode}</span>
            </div>

            <div className="summary-row">
              <span>Amount</span>
              <span className="summary-amount">₹ {data.amount}</span>
            </div>

            <div className="summary-row">
              <span>Receiver</span>
              <span>{data.receiverName}</span>
            </div>

            <div className="summary-row">
              <span>Branch</span>
              <span>{data.branch}</span>
            </div>

            <div className="summary-row">
              <span>Reference Number</span>
              <span className="summary-ref">
                {data.refNo || "FINWIN-REF-PENDING"}
              </span>
            </div>

            <div className="summary-row">
              <span>Date</span>
              <span>{data.date}</span>
            </div>

            {data.narration && (
              <div className="summary-narration">
                <span>Narration</span>
                <p>{data.narration}</p>
              </div>
            )}

            <button
              type="button"
              className="transaction-btn-primary"
              style={{ marginTop: 20, width: "100%" }}
              onClick={() => router.push("/transaction/confirm")}
            >
              Confirm Payment
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
