// app/account_detail/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient"; // browser client only

const CHECK_ACCOUNT_API = "/api/check-account"; // server route
const GET_USERID_API = "/api/get-userid"; // server route that returns { userId?: number }

const customStyles = {
  brandMark: {
    backgroundColor: "#1E90FF",
    color: "white",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "6px",
    fontSize: "1rem",
    marginRight: "0.5rem",
    lineHeight: 1,
    display: "inline-block",
  } as React.CSSProperties,
  logoTextFinwin: { fontWeight: 700, fontSize: "1.125rem", color: "#1E90FF" } as React.CSSProperties,
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f4f7f9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
};

// Helper: map branch city name -> branchId
const getBranchId = (city: string | null): number => {
  if (!city) return 1;
  const map: Record<string, number> = {
    Mumbai: 1,
    Delhi: 2,
    Bangalore: 3,
  };
  return map[city] ?? 1;
};

// Helper: normalize UI account labels to DB 'acctype' values
const normalizeAcctype = (label: string) => {
  const l = label?.toLowerCase?.() ?? "";
  if (l.includes("saving")) return "Savings";
  if (l.includes("check") || l.includes("current")) return "Current";
  if (l.includes("fixed")) return "Fixed Deposit";
  return label; // fallback to whatever the UI sent
};

const BankAccountDetails: React.FC = () => {
  const router = useRouter();
  const [accountType, setAccountType] = useState("Savings Account");
  const [currentBalance, setCurrentBalance] = useState("");
  const [branchCity, setBranchCity] = useState("Mumbai");
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userUUID, setUserUUID] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null); // integer ID if exists
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    const fetchUserAndId = async () => {
      setError(null);
      setLoadingInitial(true);

      try {
        // 1) get authenticated user (browser client)
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) {
          console.error("auth.getUser error:", userErr);
          setError("Authentication error. Please log in again.");
          router.push("/login");
          return;
        }

        const user = userData?.user ?? null;
        if (!user || !user.email) {
          router.push("/login");
          return;
        }

        setUserUUID(user.id);

        // 2) call server route to get integer userId (server uses supabaseAdmin)
        const res = await fetch(GET_USERID_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.warn("GET_USERID non-OK:", res.status, text);
          // don't hard-redirect — allow user to continue and create both profile+account server-side
          setProfileMissing(true);
          setUserId(null);
          return;
        }

        const json = await res.json();
        // If server returns userId undefined/null -> profile missing
        if (json?.userId == null) {
          setProfileMissing(true);
          setUserId(null);
        } else {
          setUserId(Number(json.userId));
          setProfileMissing(false);
        }
      } catch (err) {
        console.error("Failed to call get-userid route:", err);
        // allow user to continue but mark profile missing
        setProfileMissing(true);
        setUserId(null);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchUserAndId();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const balanceNum = parseFloat(currentBalance);
    if (isNaN(balanceNum) || balanceNum <= 0) {
      setError("Balance must be a positive number.");
      setLoading(false);
      return;
    }

    try {
      // Always use the server-side check-account API (handles both profile-missing and existing profile)
      if (!userUUID) {
        setError("User session missing. Please log in again.");
        setLoading(false);
        return;
      }

      const payload: any = {
        uuid: userUUID,
        acctype: normalizeAcctype(accountType),
        balance: balanceNum,
        branchId: getBranchId(branchCity),
      };

      // Optionally include integer userId for server convenience (server can ignore it)
      if (userId != null) payload.userId = userId;

      const res = await fetch(CHECK_ACCOUNT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("check-account route failed:", res.status, txt);
        setError("Server failed to create/check account. Check server logs.");
        setLoading(false);
        return;
      }

      const json = await res.json();
      if (json?.error) {
        setError(json.error);
        setLoading(false);
        return;
      }

      // success -> navigate
      router.push("/account_created");
    } catch (e: any) {
      console.error("Account creation failed:", e);
      setError("An unexpected error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return <div style={customStyles.pageContainer}>Loading...</div>;
  }

  // Allow account creation even when profile is missing; show a small notice
  return (
    <div style={customStyles.pageContainer} className="antialiased">
      <div className="bg-white shadow-2xl w-full max-w-md rounded-lg">
        <header className="w-full py-4 px-8 border-b border-gray-100 flex justify-start items-center">
          <a href="#" className="flex items-center no-underline hover:opacity-90 transition-opacity">
            <span style={customStyles.brandMark}>FW</span>
            <span style={customStyles.logoTextFinwin}>FinWin</span>
          </a>
        </header>

        <main className="p-4 sm:p-8">
          <div className="w-full bg-white rounded-xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">Create Bank Account</h1>
              <p className="text-sm text-gray-500 mt-1">
                {userId ? (
                  <>
                    Customer ID: <span className="font-mono text-xs text-blue-600">{userId}</span>
                  </>
                ) : (
                  <span className="text-xs text-orange-600">No profile found — we'll create it for you while creating the account</span>
                )}
              </p>
            </div>

            {error && <div className="p-3 mb-4 rounded-lg font-medium bg-red-100 text-red-700 border border-red-300">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <select id="account_type" name="account_type" value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm">
                  <option>Savings Account</option>
                  <option>Checking Account</option>
                  <option>Fixed Deposit</option>
                </select>
              </div>

              <div className="mb-5">
                <label htmlFor="current_balance" className="block text-sm font-medium text-gray-700 mb-2">Initial Balance</label>
                <input
                  type="number"
                  id="current_balance"
                  name="current_balance"
                  placeholder="Minimum e.g., 50000"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                />
              </div>

              <div className="mb-8">
                <label htmlFor="branch_city" className="block text-sm font-medium text-gray-700 mb-2">Branch City</label>
                <select id="branch_city" name="branch_city" value={branchCity} onChange={(e) => setBranchCity(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm">
                  <option>Mumbai</option>
                  <option>Bangalore</option>
                  <option>Delhi</option>
                </select>
              </div>

              <div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg">
                  {loading ? "Processing..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BankAccountDetails;
