// app/GT/components/GoalForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

const CATEGORIES = [
  "Entertainment",
  "Food",
  "Shopping",
  "Bills & Utilities",
  "Travel & Commute",
];

export default function GoalForm({ onSuccess }: any) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("SPEND_LIMIT");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");

  const handleSubmit = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return;

    const payload: any = {
      title,
      goalType: type,
      limitAmount: Number(amount),
      frequency,
      startDate: new Date().toISOString(),
    };

    if (type === "CATEGORY_LIMIT") {
      payload.categoryName = category;
    }

    const res = await fetch("/api/goals", {
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
      alert("Failed to create goal");
    }
  };

  return (
    <div className="gt-form">
      <input
        placeholder="Goal title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        type="number"
        placeholder="Limit amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="SPEND_LIMIT">Overall Spend</option>
        <option value="CATEGORY_LIMIT">Category Spend</option>
      </select>

      {type === "CATEGORY_LIMIT" && (
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Select category</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      {/* 🔽 Frequency semantics fixed */}
      <select value={frequency} onChange={e => setFrequency(e.target.value)}>
        <option value="PER_TRANSFER">Per Transaction</option>
        <option value="DAILY">Daily (cumulative)</option>
        <option value="MONTHLY">Monthly (cumulative)</option>
      </select>

      <button className="transaction-btn-primary" onClick={handleSubmit}>
        Save Goal
      </button>
    </div>
  );
}
