"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <span className="text-lg font-bold text-white">✦</span>
            </div>
            <span className="text-xl font-bold text-white">FinWin</span>
          </div>
          <button
            onClick={() => router.push("/finwin_dashboard")}
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* STEPPER */}
        <div className="mb-12">
          <div className="flex items-center justify-between gap-4">
            {/* Step 1 */}
            <div className="flex flex-1 flex-col items-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <span className="text-sm font-medium text-white">Details</span>
            </div>

            {/* Connector 1 */}
            <div className="mb-6 flex-1 h-1 bg-slate-700"></div>

            {/* Step 2 */}
            <div className="flex flex-1 flex-col items-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800">
                <span className="text-sm font-bold text-slate-400">2</span>
              </div>
              <span className="text-sm font-medium text-slate-400">Review</span>
            </div>

            {/* Connector 2 */}
            <div className="mb-6 flex-1 h-1 bg-slate-700"></div>

            {/* Step 3 */}
            <div className="flex flex-1 flex-col items-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-800">
                <span className="text-sm font-bold text-slate-400">3</span>
              </div>
              <span className="text-sm font-medium text-slate-400">Confirm</span>
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-gray-900 via-slate-900 to-black p-8 backdrop-blur-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Transfer Details</h2>
            <p className="mt-2 text-slate-400">Enter the details of your transfer</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Payment Mode & Receiver Account Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Payment Mode */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-200">
                  Payment Mode <span className="text-red-400">*</span>
                </label>
                <select
                  className="rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="">Select Payment Mode</option>
                  <option value="UPIT">UPI</option>
                  <option value="NEFT">NEFT</option>
                </select>
              </div>

              {/* Receiver Account Number */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-200">
                  Receiver Account <span className="text-red-400">*</span>
                </label>
                <input
                  className="rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Receiver Name & Branch Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Receiver Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-200">
                  Receiver Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  type="text"
                  placeholder="Enter receiver name"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </div>

              {/* Branch */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-200">
                  Branch <span className="text-red-400">*</span>
                </label>
                <select
                  className="rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200">
                Amount <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-lg font-semibold text-slate-400">
                  ₹
                </span>
                <input
                  className="w-full rounded-lg border border-slate-600/50 bg-slate-700/50 pl-8 pr-4 py-3 text-slate-100 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  type="number"
                  min={1}
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Narration */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-200">
                Narration{" "}
                <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                className="min-h-24 rounded-lg border border-slate-600/50 bg-slate-700/50 px-4 py-3 text-slate-100 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Add a note for this transfer"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push("/finwin_dashboard")}
                className="flex-1 rounded-lg border border-slate-600/50 bg-slate-700/50 px-6 py-3 text-sm font-semibold text-slate-100 transition-all hover:border-slate-500/50 hover:bg-slate-700/70"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-blue-500/40"
              >
                Proceed to Pay
              </button>
            </div>
          </form>
        </div>

        {/* Security Info */}
        <div className="mt-8 flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
          <Check className="h-5 w-5 text-green-400" />
          <p className="text-sm text-slate-300">
            FINWIN
          </p>
        </div>
      </main>
    </div>
  );
};

export default TransferPage;
