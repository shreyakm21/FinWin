// app/api/analytics/insights/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
import { categorizeTransaction } from "../../../../utils/analytics/categorizer";

function confidenceLabel(txnCount: number, months: number) {
  if (txnCount >= 30 && months >= 3) return "High";
  if (txnCount >= 10) return "Medium";
  return "Low";
}

export async function GET(req: Request) {
  /**
   * 🔐 1️⃣ Authenticate via Bearer token (SAME AS /api/transactions)
   */
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdmin();

  const { data: authData, error: authErr } =
    await supabase.auth.getUser(token);

  if (authErr || !authData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userRow.userId;

  /**
   * 📊 3️⃣ Fetch accounts
   */
  const { data: accounts } = await supabase
    .from("account")
    .select("accountId")
    .eq("userId", userId);

  if (!accounts?.length) {
    return NextResponse.json({
      confidence: { label: "Low", transactionCount: 0, months: 0 },
      insights: {
        topExpenseCategory: null,
        savingsRate: null,
        biggestPurchase: null,
        weekendVsWeekday: null,
        savingsProjection: null
      }
    });
  }

  const accountIds = accounts.map(a => a.accountId);

  /**
   * 💳 4️⃣ Fetch transactions
   */
  const { data: txns } = await supabase
    .from("transaction")
    .select("amount, trxtype, narration, createdAt")
    .in("accountId", accountIds);

  if (!txns?.length) {
    return NextResponse.json({
      confidence: { label: "Low", transactionCount: 0, months: 0 },
      insights: {
        topExpenseCategory: null,
        savingsRate: null,
        biggestPurchase: null,
        weekendVsWeekday: null,
        savingsProjection: null
      }
    });
  }

  /**
   * 📈 5️⃣ Analytics computation
   */
  const dates = txns.map(t => new Date(t.createdAt));
  const months = new Set(
    dates.map(d => `${d.getFullYear()}-${d.getMonth()}`)
  ).size;

  const txnCount = txns.length;
  const confidence = confidenceLabel(txnCount, months);

  const enriched = txns.map(tx => ({
    ...tx,
    category: categorizeTransaction(tx.narration ?? "", tx.trxtype)
  }));

  const debitTxns = enriched.filter(t => t.trxtype === "debit");

  let topExpenseCategory = null;
  if (debitTxns.length > 0) {
    const map = new Map<string, number>();
    for (const d of debitTxns) {
      map.set(d.category, (map.get(d.category) ?? 0) + d.amount);
    }
    const [category, amount] = [...map.entries()].sort((a, b) => b[1] - a[1])[0];
    topExpenseCategory = { category, amount };
  }

  const totalCredit = enriched
    .filter(t => t.trxtype === "credit")
    .reduce((s, t) => s + t.amount, 0);

  const totalDebit = debitTxns.reduce((s, t) => s + t.amount, 0);

  const savingsRate =
    totalCredit > 0 ? ((totalCredit - totalDebit) / totalCredit) * 100 : null;

  let biggestPurchase = null;
  if (debitTxns.length > 0) {
    const b = [...debitTxns].sort((a, b) => b.amount - a.amount)[0];
    biggestPurchase = {
      amount: b.amount,
      narration: b.narration,
      date: b.createdAt.split("T")[0]
    };
  }

  /**
   * 📤 6️⃣ Response
   */
  return NextResponse.json({
    confidence: { label: confidence, transactionCount: txnCount, months },
    insights: {
      topExpenseCategory,
      savingsRate:
        savingsRate !== null
          ? {
              rate: Number(savingsRate.toFixed(1)),
              emoji: savingsRate >= 20 ? "📈" : "⚠️"
            }
          : null,
      biggestPurchase
    }
  });
}
