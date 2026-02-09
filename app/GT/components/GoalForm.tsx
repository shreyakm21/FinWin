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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !amount) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      setLoading(false);
      return;
    }

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

    setLoading(false);

    if (res.ok) {
      onSuccess();
    } else {
      alert("Failed to create goal");
    }
  };

  return (
    <div className="w-full max-w-md space-y-3">
      {/* Goal Title Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-200 mb-1">
          Goal Title
        </label>
        <input
          placeholder="e.g., Shopping Budget"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-200 mb-1">
          Limit Amount (₹)
        </label>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Goal Type Select */}
      <div>
        <label className="block text-xs font-semibold text-slate-200 mb-1">
          Goal Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
        >
          <option value="SPEND_LIMIT" className="bg-slate-900">
            Overall Spend
          </option>
          <option value="CATEGORY_LIMIT" className="bg-slate-900">
            Category Spend
          </option>
        </select>
      </div>

      {/* Category Select - Conditional */}
      {type === "CATEGORY_LIMIT" && (
        <div className="animate-in fade-in duration-200">
          <label className="block text-xs font-semibold text-slate-200 mb-1">
            Select Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900">
              Select category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-slate-900">
                {c}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Frequency Select */}
      <div>
        <label className="block text-xs font-semibold text-slate-200 mb-1">
          Frequency
        </label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
        >
          <option value="PER_TRANSFER" className="bg-slate-900">
            Per Transaction
          </option>
          <option value="DAILY" className="bg-slate-900">
            Daily (cumulative)
          </option>
          <option value="MONTHLY" className="bg-slate-900">
            Monthly (cumulative)
          </option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center gap-2 mt-1"
      >
        {loading ? (
          <>
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          "Save Goal"
        )}
      </button>
    </div>
  );
}
