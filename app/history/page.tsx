// app/history/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

type Transaction = {
  transactionId: number;
  narration: string;
  amount: number;
  trxtype: "credit" | "debit";
  status: string;
  mode: string;
  createdAt: string;
  fromTo: string;
};

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔍 Search
  const [search, setSearch] = useState("");

  // Fetch all transactions
  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      if (!token) return;

      const res = await fetch("/api/transactions/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (Array.isArray(json)) {
        setTransactions(json);
      }

      setLoading(false);
    };

    fetchHistory();
  }, []);

  // Filter by search
  const filteredTxns = transactions.filter(tx =>
    tx.narration.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Transaction History
        </h1>
        <p className="text-slate-600 mb-6">
          View all your income and expense transactions.
        </p>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search narration (e.g. shopping, bill...)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Narration</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Mode</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTxns.map(tx => (
                  <tr
                    key={tx.transactionId}
                    className="border-b hover:bg-slate-50 transition"
                  >
                    {/* Date */}
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    {/* Narration */}
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {tx.narration}
                    </td>

                    {/* Type */}
                    <td
                      className={`px-4 py-3 font-semibold ${
                        tx.trxtype === "credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.trxtype.toUpperCase()}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 font-semibold">
                      ₹{tx.amount.toLocaleString("en-IN")}
                    </td>

                    {/* Mode */}
                    <td className="px-4 py-3 text-slate-600">{tx.mode}</td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
