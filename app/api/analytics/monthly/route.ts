// app/api/analytics/monthly/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

export async function GET(req: Request) {
  /**
   * 🔐 1️⃣ Authenticate via Bearer token (SAME AS /api/transactions)
   */
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const supabase = supabaseAdmin();

  const { data: authData, error: authErr } =
    await supabase.auth.getUser(token);

  if (authErr || !authData?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const authUUID = authData.user.id;

  /**
   * 👤 2️⃣ Map auth user → internal userId
   */
  const { data: userRow } = await supabase
    .from("users")
    .select("userId")
    .eq("auth_uuid", authUUID)
    .single();

  if (!userRow?.userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = userRow.userId;

  /**
   * 📊 3️⃣ Fetch transactions for this user
   */
  const { data, error } = await supabase
    .from("transaction")
    .select(`
      amount,
      trxtype,
      createdAt,
      account!inner ( userId )
    `)
    .eq("account.userId", userId);

  if (error || !data || data.length === 0) {
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
   * 📅 4️⃣ Monthly aggregation
   */
  const monthlyMap = new Map<string, { credit: number; debit: number }>();
  let totalIncome = 0;
  let totalExpense = 0;
  let sumAmount = 0;

  for (const tx of data) {
    const month = tx.createdAt.slice(0, 7);

    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { credit: 0, debit: 0 });
    }

    if (tx.trxtype === "credit") {
      monthlyMap.get(month)!.credit += tx.amount;
      totalIncome += tx.amount;
    } else {
      monthlyMap.get(month)!.debit += tx.amount;
      totalExpense += tx.amount;
    }

    sumAmount += tx.amount;
  }

  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({
      month,
      credit: values.credit,
      debit: values.debit
    }));

  /**
   * 📤 5️⃣ Response
   */
  return NextResponse.json({
    monthly,
    kpis: {
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
      avgTxnAmount: sumAmount / data.length,
      transactionCount: data.length
    }
  });
}
