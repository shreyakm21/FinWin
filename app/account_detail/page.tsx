"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";

const CHECK_ACCOUNT_API = "/api/check-account";
const GET_USERID_API = "/api/get-userid";

// Helper
const getBranchId = (city: string | null): number => {
  if (!city) return 1;
  const map: Record<string, number> = {
    Mumbai: 1,
    Delhi: 2,
    Bangalore: 3,
  };
  return map[city] ?? 1;
};

const normalizeAcctype = (label: string) => {
  const l = label?.toLowerCase?.() ?? "";
  if (l.includes("saving")) return "Savings";
  if (l.includes("check") || l.includes("current")) return "Current";
  if (l.includes("fixed")) return "Fixed Deposit";
  return label;
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
  const [userId, setUserId] = useState<number | null>(null);

  // LOAD USER
  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          router.push("/login");
          return;
        }

        setUserUUID(data.user.id);

        const res = await fetch(GET_USERID_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.user.email }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json?.userId != null) {
            setUserId(Number(json.userId));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingInitial(false);
      }
    };

    init();
  }, [router]);

  // SUBMIT
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

    if (userId != null) payload.userId = userId;

    const res = await fetch(CHECK_ACCOUNT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    console.log("🟢 check-account response:", json);

    if (!res.ok || json?.ok === false) {
      setError(json?.error || "Account creation failed");
      setLoading(false);
      return;
    }

    // 🔥🔥🔥 THIS IS THE REAL FIX 🔥🔥🔥
    if (json?.data?.accNo) {
      sessionStorage.setItem("senderAccNo", json.data.accNo);
      console.log("✅ senderAccNo SAVED:", json.data.accNo);
    } else {
      console.error("❌ accNo missing in response");
    }

    router.push("/account_created");
  } catch (e) {
    console.error("Account creation failed:", e);
    setError("Unexpected server error");
  } finally {
    setLoading(false);
  }
};
};

export default BankAccountDetails;
