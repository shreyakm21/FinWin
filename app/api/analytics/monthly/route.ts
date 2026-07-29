// app/api/analytics/monthly/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

/* ---------- helper ---------- */

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  const date = new Date(Number(y), Number(m) - 1);
  return date.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}

/* ---------- API ---------- */

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year"); // optional filter

  const supabase = supabaseAdmin();

  const { data: authData, error: authErr } =
    await supabase.auth.getUser(token);

  if (authErr || !authData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authUUID = authData.user.id;

  /* ---------- map auth → userId ---------- */

  const { data: userRow } = await supabase
    .from("users")
    .select("userId")
    .eq("auth_uuid", authUUID)
    .single();

  if (!userRow?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userRow.userId;

  /* ---------- fetch ALL transactions (no year limit) ---------- */

  let query = supabase
    .from("transaction")
    .select(`
      amount,
      trxtype,
      createdAt,
      account!inner ( userId )
    `)
    .eq("account.userId", userId);

  // optional year filter (kept for compatibility)
  if (yearParam) {
    const start = `${yearParam}-01-01`;
    const end = `${yearParam}-12-31`;
    query = query.gte("createdAt", start).lte("createdAt", end);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return NextResponse.json({
      monthly: [],
      kpis: {
        totalIncome: 0,
        totalExpense: 0,
        net: 0,
        avgTxnAmount: 0,
        transactionCount: 0,
      },
    });
  }

  /* ---------- monthly aggregation ---------- */

  const monthlyMap = new Map<string, { credit: number; debit: number }>();

  let totalIncome = 0;
  let totalExpense = 0;
  let sumAmount = 0;

  for (const tx of data) {
    const month = tx.createdAt.slice(0, 7); // YYYY-MM

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
      month,                     // YYYY-MM (for sorting & compare)
      label: monthLabel(month),  // "Jan 2026" (for dropdown)
      credit: values.credit,
      debit: values.debit,
    }));

  /* ---------- response ---------- */

  return NextResponse.json({
    monthly,
    kpis: {
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
      avgTxnAmount: sumAmount / data.length,
      transactionCount: data.length,
    },
  });
}
