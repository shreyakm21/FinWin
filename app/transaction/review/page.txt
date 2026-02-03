// app/transaction/review/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";

import GoalWarningModal from "../../GT/components/GoalWarningModal";
import "../../GT/styles/goal-warning.css";

const STORAGE_KEY = "txData";

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [goalViolations, setGoalViolations] = useState<any[] | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      router.push("/transaction");
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) return null;

  // 🔎 Check goals before final confirmation
  const handleConfirm = async () => {
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session?.access_token) {
        alert("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      const payload = {
        paymentMode: data.paymentMode,
        accountNumber: String(data.accountNumber),
        branch: String(data.branch),
        amount: String(data.amount),
        narration: data.narration || null,
      };

      const res = await fetch("/api/goal-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      // ⚠️ Goal violation detected
      if (result?.violated && result.violations?.length > 0) {
        setGoalViolations(result.violations);
        setLoading(false);
        return;
      }

      // ✅ No violations → continue normally
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      router.push("/transaction/confirm");

    } catch (err) {
      console.error("Goal check failed:", err);
      alert("Unable to check goals. Please try again.");
      setLoading(false);
    }
  };

  // ✅ User accepts violation
  const handleProceedAnyway = () => {
    const updated = {
      ...data,
      ignoreGoals: true,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setGoalViolations(null);
    router.push("/transaction/confirm");
  };

  // ❌ User cancels payment due to goal violation (ONLY ADDITION)
  const handleCancelViolation = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setGoalViolations(null);
    router.replace("/finwin_dashboard");
  };

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
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Checking goals..." : "Confirm Payment"}
            </button>
          </div>
        </section>
      </main>

      {/* ⚠️ GOAL WARNING MODAL */}
      {goalViolations && (
        <GoalWarningModal
          violations={goalViolations}
          onCancel={handleCancelViolation}   /* ONLY CHANGE */
          onProceed={handleProceedAnyway}
        />
      )}
    </div>
  );
}
