// app/GT/reminders/components/ReminderForm.tsx

"use client";

import { useState } from "react";
import { supabase } from "../../../../utils/supabaseClient";

export default function ReminderForm({ onSuccess }: any) {
  const [displayName, setDisplayName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [date, setDate] = useState("");

  const handleSubmit = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;

    const payload = {
      displayName,
      accountNumber,
      frequency,
      nextTriggerAt: date,
      scheduleJson: {}, // future-proof
    };

    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSuccess();
    } else {
      alert("Failed to create reminder");
    }
  };

  return (
    <div className="gt-form">
      <input
        placeholder="Display name (e.g. EXT-MHCEB)"
        value={displayName}
        onChange={e => setDisplayName(e.target.value)}
      />

      <input
        placeholder="Account number"
        value={accountNumber}
        onChange={e => setAccountNumber(e.target.value)}
      />

      <select value={frequency} onChange={e => setFrequency(e.target.value)}>
        <option value="MONTHLY">Monthly</option>
        <option value="HALFYEARLY">Every 6 Months</option>
        <option value="YEARLY">Yearly</option>
      </select>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
      />

      <button className="transaction-btn-primary" onClick={handleSubmit}>
        Save Reminder
      </button>
    </div>
  );
}
