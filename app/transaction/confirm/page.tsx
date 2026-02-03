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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">✦</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">FinWin</h1>
            <p className="text-xs text-slate-400">Transfer</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 overflow-y-auto flex flex-col justify-center">
        {/* STEPPER */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-1 flex-shrink-0">
                <span className="text-emerald-400 font-semibold text-sm">✓</span>
              </div>
              <span className="text-xs font-medium text-slate-300">Details</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-500/40 to-slate-700 mx-1 mb-5" />

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-1 flex-shrink-0">
                <span className="text-emerald-400 font-semibold text-sm">✓</span>
              </div>
              <span className="text-xs font-medium text-slate-300">Review</span>
            </div>

            {/* Line */}
            <div className={`flex-1 h-0.5 mx-1 mb-5 ${
              success
                ? "bg-gradient-to-r from-emerald-500/40 to-emerald-500/40"
                : "bg-gradient-to-r from-blue-500 to-purple-600"
            }`} />

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 shadow-lg flex-shrink-0 ${
                success
                  ? "bg-emerald-500/20 border border-emerald-500/40"
                  : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/30"
              }`}>
                <span className={`font-semibold text-sm ${
                  success ? "text-emerald-400" : "text-white"
                }`}>
                  {success ? "✓" : "3"}
                </span>
              </div>
              <span className={`text-xs font-medium ${
                success ? "text-emerald-400" : "text-white"
              }`}>
                Confirm
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT CARD */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-xl max-w-md w-full text-center">
            {!success ? (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💳</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Ready to Send</h2>
                  <p className="text-sm text-slate-400">Confirm your transaction details</p>
                </div>

                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 mb-6">
                  <p className="text-slate-300 text-xs mb-2">Amount to Send</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                    {formattedAmount}
                  </p>
                  <div className="border-t border-slate-600/50 pt-3">
                    <p className="text-slate-400 text-xs">To: <span className="text-slate-200 font-semibold">{tx.receiverName}</span></p>
                  </div>
                </div>

                <button
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:shadow-none mb-2"
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>

                <button
                  className="w-full px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200 border border-slate-600 text-sm"
                  onClick={() => router.push("/finwin_dashboard")}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-400 mb-2">Payment Successful</h2>
                  <p className="text-sm text-slate-400">Your transaction has been completed</p>
                </div>

                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4 mb-6">
                  <p className="text-slate-300 text-xs mb-2">Amount Sent</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                    {formattedAmount}
                  </p>
                  <div className="border-t border-slate-600/50 pt-3">
                    <p className="text-slate-400 text-xs">To: <span className="text-slate-200 font-semibold">{tx.receiverName}</span></p>
                  </div>
                </div>

                <button
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/30"
                  onClick={() => router.push("/transaction")}
                >
                  Make Another Transfer
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfirmPage;
