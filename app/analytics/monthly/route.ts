// app/api/analytics/monthly/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  /**
   * 1️⃣ Create Supabase client with auth cookies
   */
  const cookieStore = await cookies();

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false
      },
      global: {
        headers: {
          Cookie: cookieStore.toString()
        }
      },
      db: {
        schema: "banking"
      }
    }
  );

  /**
   * 2️⃣ Get authenticated user
   */
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /**
   * 3️⃣ Map auth user → banking.users.userId
   */
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("userId")
    .eq("email", user.email)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({
      monthly: [],
      kpis: {
        totalIncome: 0,
        totalExpense: 0,
        net: 0,
        avgTxnAmount: 0,
        transactionCount: 0
      }
    });
  }

  const userId = profile.userId;

  /**
   * 4️⃣ Fetch user's accounts
   */
  const { data: accounts, error: accError } = await supabase
    .from("account")
    .select("accountId")
    .eq("userId", userId);

  if (accError || !accounts || accounts.length === 0) {
    return NextResponse.json({
      monthly: [],
      kpis: {
        totalIncome: 0,
        totalExpense: 0,
        net: 0,
        avgTxnAmount: 0,
        transactionCount: 0
      }
    });
  }

  const accountIds = accounts.map(a => a.accountId);

  /**
   * 5️⃣ Fetch transactions
   */
  const { data: txns, error } = await supabase
    .from("transaction")
    .select("amount, trxtype, createdAt")
    .in("accountId", accountIds);

  if (error || !txns) {
    return NextResponse.json({
      monthly: [],
      kpis: {
        totalIncome: 0,
        totalExpense: 0,
        net: 0,
        avgTxnAmount: 0,
        transactionCount: 0
      }
    });
  }

  /**
   * 6️⃣ Monthly aggregation
   */
  const monthlyMap: Record<string, { credit: number; debit: number }> = {};
  let totalIncome = 0;
  let totalExpense = 0;

  txns.forEach(tx => {
    const month = tx.createdAt.slice(0, 7);

    if (!monthlyMap[month]) {
      monthlyMap[month] = { credit: 0, debit: 0 };
    }

    if (tx.trxtype === "credit") {
      monthlyMap[month].credit += tx.amount;
      totalIncome += tx.amount;
    } else {
      monthlyMap[month].debit += tx.amount;
      totalExpense += tx.amount;
    }
  });

  const monthly = Object.entries(monthlyMap).map(([month, v]) => ({
    month,
    credit: v.credit,
    debit: v.debit
  }));

  const transactionCount = txns.length;
  const avgTxnAmount =
    transactionCount === 0
      ? 0
      : (totalIncome + totalExpense) / transactionCount;

  return NextResponse.json({
    monthly,
    kpis: {
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
      avgTxnAmount,
      transactionCount
    }
  });
}
