//app/finwin_dashboard/page.tsx

"use client";
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import Link from "next/link";                     
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/navigation";



const loadSenderAccount = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) return;

  const res = await fetch("/api/overview", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  // 🔥 IMPORTANT
  if (json?.primaryAccNo) {
    sessionStorage.setItem("senderAccNo", json.primaryAccNo);
    console.log("✅ senderAccNo set:", json.primaryAccNo);
  }
};



/* =======================
   🔔 NEW: notification state
======================= */
type NotificationItem = {
  notificationId: number;
  title: string;
  message: string;
  createdAt: string;
  refId: number;
};


// ---------- Component ----------
const FinWinDashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

 /* 🔔  */
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  


  // overview can be null until loaded
  const [overview, setOverview] = useState<{
    username?: string | null;
    accountBalance: number;
    recentTransactions: number;
    upcomingBills: number;
    totalSavings: number;
    features?: { transactionsAvailable?: boolean; billsAvailable?: boolean; savingsAvailable?: boolean; accountTableAvailable?: boolean };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<any | null>(null);

const [recentTxns, setRecentTxns] = useState<any[]>([]);
const [upcomingBill, setUpcomingBill] = useState<any>(null);

  const toggleSidebarLinks = () => setIsSidebarOpen(s => !s);

  // --- New: balance preview state/timer ---
  // showBalancePreview controls whether the actual amount is shown in the BIG numeric area
  const [showBalancePreview, setShowBalancePreview] = useState(false);
  const previewTimerRef = useRef<number | null>(null);

  /* =======================
     Notification actions
  ======================= */
  
  const markAsRead = async (notificationId: number) => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return;

    await fetch("/api/notifications/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notificationId }),
    });

    // 🧹 remove from local state immediately
    setNotifications(prev =>
      prev.filter(n => n.notificationId !== notificationId)
    );
  };

  const snoozeReminder = async (
    notificationId: number,
    reminderId: number,
    snoozeFor: string
  ) => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return;

    // mark notification read
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notificationId }),
    });

    // snooze reminder
    await fetch("/api/reminders/snooze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reminderId,
        snoozeFor,
      }),
    });

    setNotifications(prev =>
      prev.filter(n => n.notificationId !== notificationId)
    );
  };



  const revealBalanceFor10s = () => {
    // restart timer if already running
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
    }

    setShowBalancePreview(true);
    previewTimerRef.current = window.setTimeout(() => {
      setShowBalancePreview(false);
      previewTimerRef.current = null;
    }, 1000);
  };


 /* =======================
     🔔 NEW: trigger reminders
  ======================= */
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) return;

      await fetch("/api/reminders/trigger", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    })();
  }, []);

  /* =======================
     🔔 NEW: fetch notifications
  ======================= */
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (Array.isArray(json)) {
        setNotifications(json);
      }
    })();
  }, []);  

/* 🔔 Close popup on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest(".notification-area")) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handler);
    }

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [showNotifications]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (previewTimerRef.current) {
        window.clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
    };
  }, []);

  // Chart setup (kept as you had it)
const [monthlyFlow, setMonthlyFlow] = useState<
  { month: string; credit: number; debit: number }[]
>([]);

/* ============================
   ✅ Fetch Monthly Income/Expense
============================ */
useEffect(() => {
  const fetchMonthlyFlow = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    if (!token) return;

    const res = await fetch("/api/analytics/monthly", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

if (json?.monthly) {
  const cleaned = json.monthly.map((item: any) => ({
    month: item.month.slice(0, 7), // ✅ force YYYY-MM
    credit: Number(item.credit),
    debit: Number(item.debit),
  }));

  setMonthlyFlow(cleaned);
}

  };

  fetchMonthlyFlow();
}, []);

/* ============================
   ✅ Normalize Months (Jan–Dec)
============================ */
const normalizeMonthlyFlow = () => {
  const now = new Date();
  const months: string[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  return months.map(m => {
    const found = monthlyFlow.find(x => x.month === m);

    return {
      month: m,
      credit: found?.credit ?? 0,
      debit: found?.debit ?? 0,
    };
  });
};

/* ============================
   ✅ Chart Render (Dynamic)
============================ */
useEffect(() => {
  if (!chartRef.current) return;

  if (chartInstance.current) {
    chartInstance.current.destroy();
  }

  const ctx = chartRef.current.getContext("2d");
  if (!ctx) return;

  // ✅ Always Build Full Year Jan–Dec
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  // ✅ Start with all zeros
  const incomeData = Array(12).fill(0);
  const expenseData = Array(12).fill(0);

  // ✅ Fill values from Supabase monthlyFlow
  monthlyFlow.forEach(item => {
    const date = new Date(item.month + "-01");
    const index = date.getMonth(); // Jan=0

    incomeData[index] = item.credit;
    expenseData[index] = item.debit;
  });

  // ✅ Gradient Fill (Like Your Image)
  const incomeGradient = ctx.createLinearGradient(0, 0, 0, 250);
  incomeGradient.addColorStop(0, "rgba(59,130,246,0.35)");
  incomeGradient.addColorStop(1, "rgba(59,130,246,0)");

  const expenseGradient = ctx.createLinearGradient(0, 0, 0, 250);
  expenseGradient.addColorStop(0, "rgba(34,197,94,0.35)");
  expenseGradient.addColorStop(1, "rgba(34,197,94,0)");

  chartInstance.current = new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: "#3b82f6",
          backgroundColor: incomeGradient,
          fill: true,
          tension: 0.45,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
        },
        {
          label: "Expenses",
          data: expenseData,
          borderColor: "#22c55e",
          backgroundColor: expenseGradient,
          fill: true,
          tension: 0.45,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },

        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString("en-IN")}`,
          },
        },
      },

      scales: {
        x: {
          grid: { display: false },
        },

        y: {
          grid: {
            borderDash: [6, 6],
            color: "#e5e7eb",
          },
          ticks: {
            callback: (v) => "₹" + Number(v) / 1000 + "k",
          },
        },
      },
    },
  });

  return () => {
    chartInstance.current?.destroy();
  };
}, [monthlyFlow]);


//Upcoming Bills FETCH
useEffect(() => {
  const fetchUpcomingBill = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/bills/upcoming", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    setUpcomingBill(json.upcomingBill);
  };

  fetchUpcomingBill();
}, []);
const daysUntilDue = (date: string) => {
  const due = new Date(date);
  const today = new Date();

  const diff = due.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};




//RECENT TRANSACTIONS FETCH
useEffect(() => {
  const fetchRecentTransactions = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (!token) return;

    const res = await fetch("/api/transactions/recent", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (Array.isArray(json)) {
      setRecentTxns(json);
    }
  };

  fetchRecentTransactions();
}, []);



   
  // 🔄 REFRESH BALANCE AFTER TRANSACTION
useEffect(() => {
  const fetchLatestBalance = async () => {
    const senderAccNo = sessionStorage.getItem("senderAccNo");

    if (!senderAccNo) return;

    const { data, error } = await supabase
      .from("account")
      .select("balance")
      .eq("accNo", senderAccNo)
      .single();

    if (!error && data) {
      setOverview(prev =>
        prev
          ? { ...prev, accountBalance: Number(data.balance) }
          : prev
      );
    }
  };

  fetchLatestBalance();
}, []);

  // ---------- fetch overview ----------
  useEffect(() => {
  let mounted = true;

  (async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token ?? null;
      if (!accessToken) return;

      const res = await fetch("/api/overview", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const payload = await res.json();

      if (!res.ok) return;

      if (mounted) {
        setOverview({
          username: payload.username,
          accountBalance: payload.accountBalance,
          recentTransactions: payload.recentTransactions,
          upcomingBills: payload.upcomingBills,
          totalSavings: payload.totalSavings,
        });

        if (payload?.primaryAccNo) {
  sessionStorage.setItem("senderAccNo", payload.primaryAccNo);
  console.log("✅ senderAccNo stored in session:", payload.primaryAccNo);
}
      }
    } finally {
      if (mounted) setLoading(false);
    }
  })();

  return () => {
    mounted = false;
  };
}, []);

  const linksClass = `other-links ${isSidebarOpen ? "" : "hidden-toggle"}`;
  const arrowClass = `${isSidebarOpen ? "rotated-icon" : ""}`;
  const fmtCurrency = (v: number) =>
    v.toLocaleString("en-IN", { style: "currency", currency: "INR" });


  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-slate-200 flex flex-col sticky top-0 h-screen overflow-y-auto md:flex max-md:hidden">
        {/* Logo */}
        <div className="flex items-center space-x-3 p-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">FinWin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          <button
            onClick={toggleSidebarLinks}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h4v4H4zM10 6h4v4h-4zM4 12h4v4H4zM10 12h4v4h-4z"/>
              </svg>
              <span>Dashboard</span>
            </div>
            <svg className={`w-4 h-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Submenu */}
          <div className={`space-y-1 overflow-hidden transition-all ${isSidebarOpen ? 'max-h-96' : 'max-h-0'}`}>
            <Link href="/transaction" className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Transfer Money</span>
            </Link>
            <button className="w-full text-left flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1"/>
              </svg>
              <span>Pay Bills</span>
            </button>
            <Link href="/analytics" className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <span>Analytics</span>
            </Link>
            <Link href="/GT" className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span>Goal Tracker</span>
            </Link>
            <Link href="/reminders" className="flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span>Reminders</span>
            </Link>
            <button className="w-full text-left flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M3 6h18M9 3h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z"/>
              </svg>
              <span>Accounts</span>
            </button>
            <Link href="/history" className="w-full text-left flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"/>
              </svg>
              <span>History</span>
            </Link>
            <button className="w-full text-left flex items-center space-x-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.172l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <span>Support</span>
            </button>
          </div>
        </nav>

        {/* Footer Links */}
        <div className="border-t border-slate-100 p-6 space-y-2 text-xs text-slate-600">
          <a href="#" className="block hover:text-slate-900 transition-colors">Company</a>
          <a href="#" className="block hover:text-slate-900 transition-colors">Support</a>
          <a href="#" className="block hover:text-slate-900 transition-colors">Legal</a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="w-full px-4 py-2.5 text-sm rounded-lg bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-6 ml-6">
              {/* Notifications */}
              <div className="relative notification-area">
                <button
                  onClick={() => setShowNotifications(s => !s)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1"/>
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 font-semibold text-slate-900">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.notificationId} className="px-4 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="font-medium text-slate-900 mb-1">{n.title}</div>
                            <div className="text-sm text-slate-600 mb-2">{n.message}</div>
                            <div className="text-xs text-slate-400 mb-3">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {n.refId && (
                                <>
                                  <button
                                    className="text-xs px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors font-medium"
                                    onClick={(e) =>{
                                      e.stopPropagation();
                                      router.push(`/notifications/pay/${n.refId}`)
                                    }}
                                  >
                                    Pay Now
                                  </button>
                                  <button
                                    className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors font-medium"
                                    onClick={() => snoozeReminder(n.notificationId, n.refId, "1_DAY")}
                                  >
                                    Snooze 1d
                                  </button>
                                  <button
                                    className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors font-medium"
                                    onClick={() => snoozeReminder(n.notificationId, n.refId, "1_WEEK")}
                                  >
                                    Snooze 1w
                                  </button>
                                </>
                              )}
                              <button
                                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition-colors font-medium"
                                onClick={() => markAsRead(n.notificationId)}
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout & User */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    {loading ? "Loading..." : overview?.username ? `${overview.username}` : "Welcome"}
                  </div>
                  <div className="text-xs text-slate-500">Premium Member</div>
                </div>
                <a href="/login">
                  <button className="px-4 py-2 text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg transition-colors">
                    Logout
                  </button>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {loading ? "..." : overview?.username}</h1>
                <p className="text-blue-100">Manage your finances with ease and confidence</p>
              </div>
              <Link href="/transaction" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors">
                + Quick Transfer
              </Link>
            </div>
          </div>

          {/* Overview Cards */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Account Balance Card */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600">Account Balance</h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <p
                  role="button"
                  tabIndex={0}
                  onClick={revealBalanceFor10s}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") revealBalanceFor10s(); }}
                  className="text-3xl font-bold text-slate-900 cursor-pointer select-none mb-4 hover:text-blue-600 transition-colors"
                  title="Click to reveal balance"
                  aria-pressed={showBalancePreview}
                >
                  {showBalancePreview ? (overview ? fmtCurrency(overview.accountBalance) : "₹0.00") : "••••••"}
                </p>
                <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">View details →</a>
              </div>

              {/* Recent Transactions Card */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600">Recent Transactions</h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"/>
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{overview ? overview.recentTransactions : 0}</p>
                <p className="text-xs text-slate-500 mb-4">Due in 7 days</p>
                {!overview?.features?.transactionsAvailable && <p className="text-xs text-slate-400">Feature coming soon</p>}
                <a href="#" className="text-xs text-purple-600 hover:text-purple-700 font-medium">View all →</a>
              </div>

{/* Upcoming Bills Card */}
<div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-200">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-medium text-slate-600">
      Upcoming Bill
    </h3>

    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center">
      <svg
        className="w-5 h-5 text-amber-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeWidth="2"
          strokeLinecap="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  </div>

{upcomingBill ? (
  <>
    {/* Bill Name */}
    <p className="text-lg font-semibold text-slate-900">
      {upcomingBill.displayName}
    </p>

    {/* Amount */}
    <p className="text-2xl font-bold text-slate-900 mt-2">
      ₹{upcomingBill.amount?.toLocaleString("en-IN")}
    </p>

    {/* Due Info */}
    <p className="text-xs text-amber-600 font-medium mt-3">
      Due in {daysUntilDue(upcomingBill.nextTriggerAt)} days
    </p>

    {/* Buttons Row */}
    <div className="mt-4 flex gap-2 flex-wrap items-center">

      {/* ✅ Pay Now Button */}
      <button
        className="text-xs px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded transition-colors font-medium"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/notifications/pay/${upcomingBill.reminderId}`);
        }}
      >
        Pay Now
      </button>

      {/* View Reminders Button */}
      <button
        onClick={() => router.push("/reminders")}
        className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded transition-colors font-medium"
      >
        View All →
      </button>
    </div>
  </>
) : (
  <>
    <p className="text-sm text-slate-500">
      No upcoming bills 🎉
    </p>
    <p className="text-xs text-slate-400 mt-2">
      You're all caught up.
    </p>
  </>
)}

</div>


              {/* Total Savings Card */}
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-600">Total Savings</h3>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeWidth="2" strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-2">{overview ? fmtCurrency(overview.totalSavings) : "₹0.00"}</p>
                {!overview?.features?.savingsAvailable && <p className="text-xs text-slate-400 mb-4">Feature coming soon</p>}
                <a href="#" className="text-xs text-green-600 hover:text-green-700 font-medium">View details →</a>
              </div>
            </div>
          </section>

          {/* Quick Actions & Chart */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                <Link href="/transaction" className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1"/>
                  </svg>
                  <span>Send Money</span>
                </Link>
                <button className="flex items-center justify-center space-x-2 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"/>
                  </svg>
                  <span>Pay Bills</span>
                </button>
                <button className="flex items-center justify-center space-x-2 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" d="M3 6h18M9 3h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                  </svg>
                  <span>Manage Accounts</span>
                </button>
              </div>
            </div>

            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-md border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Monthly Cash Flow</h2>
              <p className="text-sm text-slate-600 mb-6">Income vs Expenses trends</p>
              <div className="h-64">
                <canvas id="monthlyFlowChart" ref={chartRef}></canvas>
              </div>
              <div className="mt-6 flex gap-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600">Income</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-600">Expenses</span>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Transactions Table */}
          <section className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">DATE</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">TYPE</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">AMOUNT</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">MODE</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">FROM/TO</th>
                    
                  </tr>
                </thead>
<tbody>
  {recentTxns.length === 0 ? (
    <tr>
      <td colSpan={6} className="text-center py-6 text-slate-500">
        No recent transactions found.
      </td>
    </tr>
  ) : (
    recentTxns.map(tx => (
      <tr
        key={tx.transactionId}
        className="border-b hover:bg-slate-50 transition"
      >
        {/* Date */}
        <td className="py-3 px-4 text-slate-600">
          {new Date(tx.createdAt).toLocaleDateString("en-IN")}
        </td>

        {/* Narration */}
        <td className="py-3 px-4 font-medium text-slate-800">
          {tx.narration}
        </td>

        {/* Type */}
        <td
          className={`py-3 px-4 font-semibold ${
            tx.trxtype === "credit"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {tx.trxtype.toUpperCase()}
        </td>

        {/* Amount */}
        <td className="py-3 px-4 font-semibold text-slate-900">
          ₹{tx.amount.toLocaleString("en-IN")}
        </td>

        {/* Status */}
        <td className="py-3 px-4">
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
<div className="mt-6 flex justify-end">
  <button
    onClick={() => router.push("/history")}
    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
  >
    View all →
  </button>
</div>


            </div>
          </section>
        </div>
      </main>
    </div>
  );
};


export default FinWinDashboard;
