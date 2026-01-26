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

  /* ===========================
     🔹 Fetch User Reminders
  ============================ */
  const fetchReminders = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      alert("Not logged in!");
      return;
    }

    const res = await fetch("/api/reminders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (Array.isArray(json)) {
      setReminders(json);
    } else {
      setReminders([]);
    }
    setLoading(false);
    };

  useEffect(() => {
    fetchReminders();
  }, []);

  /* ===========================
     🔹 Create Reminder
  ============================ */
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

    // Reset Form
    setDisplayName("");
    setAccountNumber("");
    setFrequency("MONTHLY");
    setAmount("");

    fetchReminders();
  };

  /* ===========================
     🔹 Cancel Reminder
  ============================ */
  const cancelReminder = async (reminderId: number) => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/reminders/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reminderId }),
    });

    if (res.ok) {
      // ✅ remove from UI after Supabase update
      setReminders(prev => prev.filter(r => r.reminderId !== reminderId));
    } else {
      alert("Failed to cancel reminder");
    }
  };


  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Payment Reminders
        </h1>

        <Link
          href="/finwin_dashboard"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* ===========================
          🔹 Create Reminder Form
      ============================ */}
      <div className="bg-white shadow rounded-lg p-5 mb-8">
        <h2 className="font-semibold text-lg mb-4">
          Create New Reminder
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Display Name */}
          <input
            placeholder="Reminder Name (e.g. Netflix)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border p-2 rounded"
          />

          {/* Account Number */}
          <input
            placeholder="Pay To Account Number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="border p-2 rounded"
          />

          {/* Amount */}
          <input
            placeholder="Amount (optional)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border p-2 rounded"
          />

          {/* Frequency */}
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="HALFYEARLY">Half-Yearly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>

        <button
          onClick={createReminder}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Reminder
        </button>
      </div>

      {/* ===========================
          🔹 Reminder List
      ============================ */}
      <div className="bg-white shadow rounded-lg p-5">
        <h2 className="font-semibold text-lg mb-4">
          Your Active Reminders
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading reminders...</p>
        ) : reminders.length === 0 ? (
          <p className="text-gray-500">No reminders created yet.</p>
        ) : (
          <div className="space-y-3">
            {reminders.map((r) => (
              <div
                key={r.reminderId}
                className="border rounded p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{r.displayName}</p>
                  <p className="text-sm text-gray-600">
                    Pay To: {r.accountNumber}
                  </p>

                  <p className="text-sm text-gray-500">
                    Frequency: {r.frequency}
                  </p>

                  <p className="text-sm text-gray-500">
                    Next Trigger:{" "}
                    {new Date(r.nextTriggerAt).toLocaleString("en-IN")}
                  </p>

                  {r.amount && (
                    <p className="text-sm text-gray-700">
                      Amount: ₹{r.amount}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => cancelReminder(r.reminderId)}
                  className="text-red-600 text-sm hover:underline"
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
