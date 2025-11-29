
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "txData";

const TransferPage: React.FC = () => {
  const router = useRouter();

  // 🔹 all fields start BLANK
  const [paymentMode, setPaymentMode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [branch, setBranch] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      paymentMode,
      accountNumber,
      receiverName,
      branch,
      amount,
      narration,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }

    // go to REVIEW page (step 2)
    router.push("/transaction/review");
  };

  return (
    <div className="transaction-page">
      <header className="transaction-top-bar">
        <div className="transaction-logo-mark">*</div>
        <div className="transaction-logo-text">FinWinTransfer</div>
      </header>

      <main className="transaction-page-inner">
        {/* Stepper */}
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

        {/* ONLY ONE CARD – the form */}
        <section className="transaction-content-grid">
          <div className="transaction-card" style={{ gridColumn: "1 / -1" }}>
            <h2 className="transaction-card-title">Transfer Details</h2>

            <form className="transaction-form-grid" onSubmit={handleSubmit}>
              <div className="transaction-field">
                <label className="transaction-field-label" htmlFor="paymentMode">
                  Payment Mode
                </label>
                <select
                  id="paymentMode"
                  className="transaction-field-input"

                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  >
                  <option value="">Select Paymentmode</option>
                  <option value="UPIT">UPI</option>
                  <option value="NEFT">NEFT</option>

                </select>
              </div>

              <div className="transaction-field">
                <label
                  className="transaction-field-label"
                  htmlFor="accountNumber"
                >
                  Receiver Account Number
                </label>
                <input
                  id="accountNumber"
                  className="transaction-field-input"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>

              <div className="transaction-field">
                <label className="transaction-field-label" htmlFor="receiverName">
                  Receiver Name
                </label>
                <input
                  id="receiverName"
                  className="transaction-field-input"
                  placeholder="Enter receiver name"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </div>

              <div className="transaction-field">
                <label className="transaction-field-label" htmlFor="branch">
                  Branch
                </label>
                <select
                  id="branch"
                  className="transaction-field-select"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="">Select branch</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                </select>
              </div>

              <div className="transaction-field">
                <label className="transaction-field-label" htmlFor="amount">
                  Amount
                </label>
                <div className="transaction-field-row">
                  <span className="transaction-currency-prefix">₹</span>
                  <input
                    id="amount"
                    className="transaction-field-input"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Enter amount"
                    style={{ flex: 1 }}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="transaction-field">
                <div className="transaction-field-label">
                  Narration <span className="transaction-field-optional">(Optional)</span>
                </div>
                <textarea
                  id="narration"
                  className="transaction-field-textarea"
                  placeholder="Add a note for this transfer"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                />
              </div>

              <button type="submit" className="transaction-btn-primary">
                Proceed to Pay <span className="transaction-btn-arrow">➜</span>
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TransferPage;
