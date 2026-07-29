// app/api/analytics/insights/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";
//import { categorizeTransaction } from "../../../../utils/analytics/categorizer";
import {
  categorizeTransactionSmart,
} from "../../../../utils/analytics/categorizer";

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

//Calculate Number of Months: Convert timestamps into Date objects
const dates = txns.map(t => new Date(t.createdAt));
//removes duplicates
const months = new Set(
  dates.map(d => `${d.getFullYear()}-${d.getMonth()}`)
).size;

const txnCount = txns.length;
const confidence = confidenceLabel(txnCount, months);

const enriched = await Promise.all(
  txns.map(async tx => ({
    ...tx,
    category: await categorizeTransactionSmart(
      tx.narration ?? "",
      tx.trxtype
    )
  }))
);

const debitTxns = enriched.filter(t => t.trxtype === "debit");

/* ---------- Top Expense Category ---------- */

let topExpenseCategory = null;
if (debitTxns.length > 0) {
  const map = new Map<string, number>();
  for (const d of debitTxns) {
    map.set(d.category, (map.get(d.category) ?? 0) + d.amount);
  }
  const [category, amount] = [...map.entries()].sort((a, b) => b[1] - a[1])[0];
  topExpenseCategory = { category, amount };
}

/* ---------- Income / Expense ---------- */

//Total Income: Adds all --> Salary, Interest, Refunds, etc...
const totalCredit = enriched
  .filter(t => t.trxtype === "credit")
  .reduce((s, t) => s + t.amount, 0);

//Total Expense: Adds all debit amounts
const totalDebit = debitTxns.reduce((s, t) => s + t.amount, 0);

//Savings Rate: (Total Income - Total Expense) / Total Income * 100
const savingsRate =
  totalCredit > 0 ? ((totalCredit - totalDebit) / totalCredit) * 100 : null;

/* ---------- Biggest Purchase ---------- */

let biggestPurchase = null;
if (debitTxns.length > 0) {
  const b = [...debitTxns].sort((a, b) => b.amount - a.amount)[0];
  biggestPurchase = {
    amount: b.amount,
    narration: b.narration,
    date: b.createdAt.split("T")[0]
  };
}
/*
{
 "amount":65000,
 "narration":"Laptop Purchase",
 "date":"2026-05-10"
}
*/

/* ---------- Weekend vs Weekday ---------- */

let weekendVsWeekday = null;
let weekend = 0;
let weekday = 0;

for (const tx of debitTxns) {
  const day = new Date(tx.createdAt).getDay();
  if (day === 0 || day === 6) weekend += tx.amount;
  else weekday += tx.amount;
}

if (weekend + weekday > 0) {
  weekendVsWeekday = {
    weekend,
    weekday,
    trend:
      weekend > weekday
        ? "Weekend-heavy"
        : weekday > weekend
        ? "Weekday-heavy"
        : "Balanced"
  };
}
/*
{
 "weekend":12000,
 "weekday":5000,
 "trend":"Weekend-heavy"
}
*/

/* ---------- Monthly Expense Trend ---------- */

const monthlyMap = new Map<string, number>();
const monthlyCategoryMap = new Map<
  string,
  Map<string, number>
>();

for (const tx of debitTxns) {
  const month = tx.createdAt.slice(0, 7); // YYYY-MM

  // Total monthly expense
  monthlyMap.set(
    month,
    (monthlyMap.get(month) ?? 0) + tx.amount
  );

  // Category-wise monthly expense
  if (!monthlyCategoryMap.has(month)) {
    monthlyCategoryMap.set(month, new Map());
  }

  const categoryMap = monthlyCategoryMap.get(month)!;

  categoryMap.set(
    tx.category,
    (categoryMap.get(tx.category) ?? 0) + tx.amount
  );
}

const sortedMonths = [...monthlyMap.keys()].sort();

const monthlyValues = sortedMonths.map(
  month => monthlyMap.get(month) ?? 0
);

let trend = null;
let avgMonthlyGrowth = null;
let explanation = null;
let drivers: { category: string; diff: number }[] = [];

const monthlyChanges: number[] = [];

if (monthlyValues.length >= 2) {
  let increases = 0;
  let decreases = 0;

  for (let i = 1; i < monthlyValues.length; i++) {
    const previous = monthlyValues[i - 1];
    const current = monthlyValues[i];

    if (previous === 0) continue;

    const growth =
      ((current - previous) / previous) * 100;

    monthlyChanges.push(
      Number(growth.toFixed(1))
    );

    if (growth > 5) increases++;
    else if (growth < -5) decreases++;
  }

  avgMonthlyGrowth =
    monthlyChanges.length > 0
      ? Number(
          (
            monthlyChanges.reduce(
              (a, b) => a + b,
              0
            ) / monthlyChanges.length
          ).toFixed(1)
        )
      : 0;

  if (increases > decreases) {
    trend =
      avgMonthlyGrowth > 15
        ? "Strongly Rising"
        : "Mostly Rising";
  } else if (decreases > increases) {
    trend =
      avgMonthlyGrowth < -15
        ? "Strongly Falling"
        : "Mostly Falling";
  } else {
    trend = "Fluctuating";
  }

  /* ---------- Driver Analysis ---------- */

  const currentMonth =
    sortedMonths[sortedMonths.length - 1];

  const previousMonth =
    sortedMonths[sortedMonths.length - 2];

  const currentCategories =
    monthlyCategoryMap.get(currentMonth) ??
    new Map();

  const previousCategories =
    monthlyCategoryMap.get(previousMonth) ??
    new Map();

  const allCategories = new Set([
    ...currentCategories.keys(),
    ...previousCategories.keys()
  ]);

  drivers = [...allCategories]
    .map(category => ({
      category,
      diff:
        (currentCategories.get(category) ?? 0) -
        (previousCategories.get(category) ?? 0)
    }))
    .sort(
      (a, b) =>
        Math.abs(b.diff) -
        Math.abs(a.diff)
    )
    .slice(0, 2);

  /* ---------- Human Explanation ---------- */

  if (
    trend.includes("Rising") &&
    drivers.length
  ) {
    explanation = `Expenses increased mainly due to higher ${drivers
      .map(d => d.category)
      .join(" and ")} spending.`;
  } else if (
    trend.includes("Falling") &&
    drivers.length
  ) {
    explanation = `Expenses reduced mainly due to lower ${drivers
      .map(d => d.category)
      .join(" and ")} spending.`;
  } else {
    explanation =
      "Monthly spending remained relatively consistent.";
  }
}

/* ---------- Unusual Transaction (Outlier) ---------- */

let unusualTransaction = null;
if (debitTxns.length >= 5) {
  const avg =
    debitTxns.reduce((s, t) => s + t.amount, 0) / debitTxns.length;

  const outlier = debitTxns.find(t => t.amount > avg * 3);
  if (outlier) {
    unusualTransaction = {
      amount: outlier.amount,
      narration: outlier.narration,
      date: outlier.createdAt.split("T")[0]
    };
  }
}

/* ---------- Cashflow Risk ---------- */

let cashflowRisk = null;
if (totalCredit > 0) {
  const burnRate = totalDebit / totalCredit;
  cashflowRisk =
    burnRate > 0.9 ? "High" : burnRate > 0.7 ? "Moderate" : "Healthy";
}

/* ---------- Savings Projection ---------- */

let savingsProjection = null;
if (monthlyValues.length >= 2 && totalCredit > 0) {
  const avgExpense =
    monthlyValues.reduce((a, b) => a + b, 0) / monthlyValues.length;
  const predictedExpense = Math.round(avgExpense);
  const predictedSavings = totalCredit / months - predictedExpense;

  savingsProjection = {
    nextMonthExpense: predictedExpense,
    expectedSavings: Math.round(predictedSavings)
  };
}

/* ---------- Behaviour Tag ---------- */

let behaviour = "Balanced";
if (savingsRate !== null) {
  if (savingsRate >= 25) behaviour = "Saver";
  else if (savingsRate < 10) behaviour = "Spender";
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
    biggestPurchase,
    weekendVsWeekday,
    trend: trend
      ? {
          direction: trend,
          avgMonthlyGrowth,
          monthlyChanges,
          drivers,
          explanation
        }
      : null,
    unusualTransaction,
    cashflowRisk,
    savingsProjection,
    behaviour
  }
});
}
