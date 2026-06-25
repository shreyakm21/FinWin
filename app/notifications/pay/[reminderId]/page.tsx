// app/notifications/pay/[reminderId]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Reminder = {
  reminderId: number;
  displayName: string;
  accountNumber: string;
  amount: number;
};

const ReminderPayPage = () => {
  const router = useRouter();
  const params = useParams();
  console.log("PARAMS:", params);

  // ✅ reminderId should be derived safely
  const reminderIdRaw = params?.reminderId;
  const reminderId = reminderIdRaw ? Number(reminderIdRaw) : null;

  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [loading, setLoading] = useState(true);

  // user fields
  const [paymentMode, setPaymentMode] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [branch, setBranch] = useState("");

  // autofilled fields
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  /* ===========================
     Fetch Reminder Details
  =========================== */
  useEffect(() => {
    if (!reminderId || isNaN(reminderId)) return;

    const fetchReminder = async () => {
      setLoading(true);

      const res = await fetch(`/api/reminders/${reminderId}`);
      const data = await res.json();

      if (!res.ok) {
        console.error("Reminder fetch failed:", data);

        // ✅ redirect safely inside effect
        router.push("/finwin_dashboard");
        return;
      }

      setReminder(data);

      // autofill
      setAccountNumber(data.accountNumber);
      setAmount(data.amount ? String(data.amount) : "");
      setNarration(data.displayName);

      setLoading(false);
    };

    fetchReminder();
  }, [reminderId]);

  /* ===========================
     Submit → Go to Review Page
  =========================== */
  const handleProceed = () => {
    if (!paymentMode || !receiverName || !branch || !amount) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      paymentMode,
      accountNumber,
      receiverName,
      branch,
      amount,
      narration,
      date: new Date().toISOString().split("T")[0],
    };

    sessionStorage.setItem("txData", JSON.stringify(payload));

    router.push("/transaction/review");
  };

  /* ===========================
     UI
  =========================== */
  if (!reminderId) {
    return (
      <div className="p-10 text-center text-gray-600">
        Invalid Reminder Link
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Loading reminder payment...
      </div>
    );
  }

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Pay Reminder: {reminder?.displayName}
      </h1>

      {/* Autofilled */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Account Number</label>
        <input
          value={accountNumber}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Amount</label>
        <input
          value={amount}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium">Narration</label>
        <input
          value={narration}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />
      </div>

      {/* User Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Payment Mode</label>
        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Mode</option>
          <option value="UPIT">UPI</option>
          <option value="NEFT">NEFT</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Receiver Name</label>
        <input
          value={receiverName}
          onChange={(e) => setReceiverName(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Enter receiver name"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium">Branch</label>
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Branch</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Delhi">Delhi</option>
          <option value="Bengaluru">Bengaluru</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push("/finwin_dashboard")}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>

        <button
          onClick={handleProceed}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Proceed to Pay →
        </button>
      </div>
    </div>
  );
};

export default ReminderPayPage;



