'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';
import GoalWarningModal from '../../GT/components/GoalWarningModal';
import '../../GT/styles/goal-warning.css';

const STORAGE_KEY = 'txData';

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [goalViolations, setGoalViolations] = useState<any[] | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) {
      router.push('/transaction');
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) return null;

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData?.session?.access_token) {
        alert('Session expired. Please login again.');
        router.push('/login');
        return;
      }

      const payload = {
        paymentMode: data.paymentMode,
        accountNumber: String(data.accountNumber),
        branch: String(data.branch),
        amount: String(data.amount),
        narration: data.narration || null,
      };

      const res = await fetch('/api/goal-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result?.violated && result.violations?.length > 0) {
        setGoalViolations(result.violations);
        setLoading(false);
        return;
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      router.push('/transaction/confirm');
    } catch (err) {
      console.error('Goal check failed:', err);
      alert('Unable to check goals. Please try again.');
      setLoading(false);
    }
  };

  const handleProceedAnyway = () => {
    const updated = {
      ...data,
      ignoreGoals: true,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setGoalViolations(null);
    router.push('/transaction/confirm');
  };

  const handleCancelViolation = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setGoalViolations(null);
    router.replace('/finwin_dashboard');
  };

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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 overflow-y-auto flex flex-col">
        {/* STEPPER */}
        <div className="mb-4">
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
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-1 shadow-lg shadow-blue-500/30 flex-shrink-0">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <span className="text-xs font-medium text-white">Review</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-slate-700 mx-1 mb-5" />

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-1 flex-shrink-0">
                <span className="text-slate-400 font-semibold text-sm">3</span>
              </div>
              <span className="text-xs font-medium text-slate-400">Confirm</span>
            </div>
          </div>
        </div>

        {/* SUMMARY CARD */}
        <div className="mb-3 flex-1 flex flex-col">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-5 shadow-2xl shadow-slate-950/50 backdrop-blur-xl flex flex-col flex-1">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white mb-0.5">Transfer Summary</h2>
              <p className="text-xs text-slate-400">Review your transaction details</p>
            </div>

            {/* Summary Details */}
            <div className="space-y-3 mb-4 flex-1 overflow-y-auto">
              {/* Payment Mode */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-slate-300 font-medium text-sm">Payment Mode</span>
                <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-400/30">
                  {data.paymentMode}
                </span>
              </div>

              {/* Amount - Highlighted */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50 bg-gradient-to-r from-emerald-500/10 to-transparent p-2 rounded-lg -mx-2">
                <span className="text-slate-300 font-medium text-sm">Amount</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  ₹ {data.amount}
                </span>
              </div>

              {/* Receiver */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-slate-300 font-medium text-sm">Receiver</span>
                <span className="text-white font-semibold text-sm">{data.receiverName}</span>
              </div>

              {/* Branch */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-slate-300 font-medium text-sm">Branch</span>
                <span className="text-slate-200 text-sm">{data.branch}</span>
              </div>

              {/* Reference Number */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-slate-300 font-medium text-sm">Reference</span>
                <span className="text-slate-300 text-xs font-mono bg-slate-900/50 px-2 py-0.5 rounded border border-slate-700">
                  {data.refNo || 'FINWIN-REF-PENDING'}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
                <span className="text-slate-300 font-medium text-sm">Date</span>
                <span className="text-slate-200 text-sm">{data.date}</span>
              </div>

              {/* Narration - if exists */}
              {data.narration && (
                <div className="pb-3">
                  <span className="text-slate-300 font-medium block mb-1 text-sm">Narration</span>
                  <p className="bg-slate-900/50 border border-slate-700/50 text-slate-300 p-2 rounded-lg text-xs">
                    {data.narration}
                  </p>
                </div>
              )}
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3">
              <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414L10 3.586l4.707 4.707a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span>Secure and encrypted</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm rounded-lg transition-colors duration-200 border border-slate-600"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-center mt-3">
          <p className="text-blue-300 text-xs">
            By confirming, you authorize this payment. Transaction details will be verified.
          </p>
        </div>
      </main>

      {/* GOAL WARNING MODAL */}
      {goalViolations && (
        <GoalWarningModal
          violations={goalViolations}
          onCancel={handleCancelViolation}
          onProceed={handleProceedAnyway}
        />
      )}
    </div>
  );
}
