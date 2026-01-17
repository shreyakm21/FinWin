"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "txData";

const TransferPage: React.FC = () => {
  const router = useRouter();

  const [paymentMode, setPaymentMode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [branch, setBranch] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ validation
    if (!paymentMode || !accountNumber || !receiverName || !branch || !amount) {
      alert("Please fill all required fields");
      return;
    }

    // ✅ Store ONLY for review (no DB yet)
    const payload = {
      paymentMode,
      accountNumber,
      receiverName,
      branch,
      amount,
      narration,
      date: new Date().toISOString().split("T")[0],
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // 👉 go to review page
    router.push("/transaction/review");
  };

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
          <div className="transaction-step transaction-step--active">
            <div className="transaction-step-number">1</div>
            <div className="transaction-step-label">Details</div>
          </div>

          <div className="transaction-step">
            <div className="transaction-step-number">2</div>
            <div className="transaction-step-label">Review</div>
          </div>

          <div className="transaction-step">
            <div className="transaction-step-number">3</div>
            <div className="transaction-step-label">Confirm</div>
          </div>
        </section>

        {/* FORM CARD */}
        <section className="transaction-content-grid">
          <div className="transaction-card" style={{ gridColumn: "1 / -1" }}>
            <h2 className="transaction-card-title">Transfer Details</h2>

            <form className="transaction-form-grid" onSubmit={handleSubmit}>
              {/* Payment Mode */}
              <div className="transaction-field">
                <label className="transaction-field-label">
                  Payment Mode
                </label>
                <select
                  className="transaction-field-input"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="">Select Payment Mode</option>
                  <option value="UPIT">UPI</option>
                  <option value="NEFT">NEFT</option>
                </select>
              </div>

              {/* Receiver Account */}
              <div className="transaction-field">
                <label className="transaction-field-label">
                  Receiver Account Number
                </label>
                <input
                  className="transaction-field-input"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              {/* Receiver Name */}
              <div className="transaction-field">
                <label className="transaction-field-label">
                  Receiver Name
                </label>
                <input
                  className="transaction-field-input"
                  placeholder="Enter receiver name"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </div>

              {/* Branch */}
              <div className="transaction-field">
                <label className="transaction-field-label">
                  Branch
                </label>
                <select
                  className="transaction-field-select"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="">Select branch</option>
                  <option value="1">Mumbai</option>
                  <option value="2">Delhi</option>
                  <option value="3">Bengaluru</option>
                  <option value="4">Chennai</option>
                </select>
              </div>

              {/* Amount */}
              <div className="transaction-field">
                <label className="transaction-field-label">
                  Amount
                </label>
                <div className="transaction-field-row">
                  <span className="transaction-currency-prefix">₹</span>
                  <input
                    className="transaction-field-input"
                    type="number"
                    min={1}
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Narration */}
              <div className="transaction-field">
                <div className="transaction-field-label">
                  Narration <span>(Optional)</span>
                </div>
                <textarea
                  className="transaction-field-textarea"
                  placeholder="Add a note for this transfer"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="transaction-btn-primary"
                onClick={() => router.push("/finwin_dashboard")}
              >
                Abort ➜
              </button>

              <button type="submit" className="transaction-btn-primary">
                Proceed to Pay ➜
              </button>
              
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TransferPage;
