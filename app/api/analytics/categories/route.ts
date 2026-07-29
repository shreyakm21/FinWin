// app/api/analytics/categories/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
import {
  categorizeTransaction,
  categorizeTransactionSmart,
} from "../../../../utils/analytics/categorizer";

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
      { categories: [], totalExpense: 0 },
      { status: 401 }
    );
  }

  const supabase = supabaseAdmin();

  const { data: authData, error: authErr } =
    await supabase.auth.getUser(token);

  if (authErr || !authData?.user) {
    return NextResponse.json(
      { categories: [], totalExpense: 0 },
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
      { categories: [], totalExpense: 0 },
      { status: 401 }
    );
  }

  const userId = userRow.userId;

  /**
   * 📊 3️⃣ Fetch accounts
   */
  const { data: accounts } = await supabase
    .from("account")
    .select("accountId")
    .eq("userId", userId);

  if (!accounts || accounts.length === 0) {
    return NextResponse.json({ categories: [], totalExpense: 0 });
  }

  const accountIds = accounts.map(a => a.accountId);

  /**
   * 💸 4️⃣ Fetch debit transactions
   */
  const { data: transactions } = await supabase
    .from("transaction")
    .select("amount, narration, trxtype, createdAt")
    .in("accountId", accountIds)
    .eq("trxtype", "debit");

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({ categories: [], totalExpense: 0 });
  }

  /**
   * 🧮 5️⃣ Categorize & aggregate
   */
  const categoryMap = new Map<string, number>();
  let totalExpense = 0;

  for (const tx of transactions) {
    const category = await categorizeTransactionSmart(
      tx.narration ?? "",
      tx.trxtype
    );

    categoryMap.set(category, (categoryMap.get(category) ?? 0) + tx.amount);
    totalExpense += tx.amount;
  }

/* ---------- Weekday Spending ---------- */

const weekdayMap: Record<string, number> = {
  Mon: 0,
  Tue: 0,
  Wed: 0,
  Thu: 0,
  Fri: 0,
  Sat: 0,
  Sun: 0,
};
const weekdayCount: Record<string, number> = {
  Mon: 0,
  Tue: 0,
  Wed: 0,
  Thu: 0,
  Fri: 0,
  Sat: 0,
  Sun: 0,
};


for (const tx of transactions) {
  if (!tx.createdAt) continue;

  const d = new Date(tx.createdAt).getDay(); // 0=Sun
  const key =
    d === 0
      ? "Sun"
      : d === 1
      ? "Mon"
      : d === 2
      ? "Tue"
      : d === 3
      ? "Wed"
      : d === 4
      ? "Thu"
      : d === 5
      ? "Fri"
      : "Sat";

  weekdayMap[key] += tx.amount;
  weekdayCount[key] += 1;
}
const weekdayAvg: Record<string, number> = {
  Mon: 0,
  Tue: 0,
  Wed: 0,
  Thu: 0,
  Fri: 0,
  Sat: 0,
  Sun: 0,
};

for (const day in weekdayMap) {
  const count = weekdayCount[day];
  weekdayAvg[day] =
    count > 0 ? Math.round(weekdayMap[day] / count) : 0;
}


  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 5);

  const categories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category, amount]) => ({ category, amount }));

  return NextResponse.json({
    categories,
    totalExpense,
    weekdaySpending: weekdayAvg,
    weekdayTotals: weekdayMap

  });

}
