// app/reminders/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../utils/supabaseClient";

type ReminderItem = {
  reminderId: number;
  displayName: string;
  accountNumber: string;
  frequency: string;
  nextTriggerAt: string;
  isActive: boolean;
  amount: number | null;
};

const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [displayName, setDisplayName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [amount, setAmount] = useState<number | "">("");

  const fetchReminders = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      alert("Not logged in!");
      return;
    }
    const res = await fetch("/api/reminders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setReminders(Array.isArray(json) ? json : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const createReminder = async () => {
    if (!displayName || !accountNumber) {
      alert("Please fill all required fields");
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/reminders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        displayName,
        accountNumber,
        frequency,
        amount: amount === "" ? null : amount,
      }),
    });
    const json = await res.json();
    if (json?.error) {
      alert("Failed: " + json.error);
      return;
    }
    alert("✅ Reminder Created Successfully!");
    setDisplayName("");
    setAccountNumber("");
    setFrequency("MONTHLY");
    setAmount("");
    fetchReminders();
  };

  const cancelReminder = async (reminderId: number) => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/reminders/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reminderId }),
    });
    if (res.ok) {
      setReminders(prev => prev.filter(r => r.reminderId !== reminderId));
    } else {
      alert("Failed to cancel reminder");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-0 tracking-wide">
          💳 Payment Reminders
        </h1>
          <Link
            href="/finwin_dashboard"
            className="text-black text-2xl md:text-3xl hover:text-gray-700 transition"
          >
            🏠︎
          </Link>

      </div>

      {/* Create Reminder Form */}
      <div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                      border border-slate-700/50 shadow-lg p-6 mb-10">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          Create New Reminder
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Reminder Name (e.g. Netflix)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 
                       focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            placeholder="Pay To Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 
                       focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            placeholder="Amount (optional)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 
                       focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 
                       focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="HALFYEARLY">Half-Yearly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        <button
          onClick={createReminder}
          className="mt-6 w-full md:w-auto bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500 
                     text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition"
        >
          + Add Reminder
        </button>
      </div>

{/* Reminder List */}
<div className="rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
                border border-slate-700/50 shadow-lg p-6">
  <h2 className="text-lg font-semibold text-slate-100 mb-4">
    Your Active Reminders
  </h2>
  {loading ? (
    <p className="text-slate-400">Loading reminders...</p>
  ) : reminders.length === 0 ? (
    <p className="text-slate-400">No reminders created yet.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reminders.map((r) => (
        <div
          key={r.reminderId}
          className="rounded-lg border border-slate-700 bg-slate-800/60 p-5 
                     flex flex-col justify-between shadow hover:shadow-lg transition"
        >
          <div>
            <p className="font-semibold text-slate-100">{r.displayName}</p>
            <p className="text-sm text-slate-400">Pay To: {r.accountNumber}</p>
            <p className="text-sm text-slate-400">Frequency: {r.frequency}</p>
            <p className="text-sm text-slate-400">
              Next Trigger: {new Date(r.nextTriggerAt).toLocaleString("en-IN")}
            </p>
            {r.amount && (
              <p className="text-sm text-indigo-400">Amount: ₹{r.amount}</p>
            )}
          </div>
          <button
            onClick={() => cancelReminder(r.reminderId)}
            className="mt-4 text-red-400 text-sm font-medium hover:text-red-300 transition self-end"
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  )}
</div>

    </div>
  );
};

export default RemindersPage;
