// lib/goalEngine/spendCalculators.ts

import { supabaseAdmin } from "../../utils/supabaseAdmin";
import { categorizeTransaction } from "../../utils/analytics/categorizer";

type SpendWindow = {
  start: Date;
  end: Date;
};

export async function calculateSpentAmount({
  userId,
  window,
  categoryName,
}: {
  userId: number;
  window: SpendWindow;
  categoryName?: string;
}): Promise<number> {
  const supabase = supabaseAdmin;

  // 1️⃣ Fetch user accounts
  const { data: accounts } = await supabase
    .from("account")
    .select("accountId")
    .eq("userId", userId);

  if (!accounts || accounts.length === 0) return 0;

  const accountIds = accounts.map(a => a.accountId);

  // 2️⃣ Fetch debit transactions in window
  const { data: transactions } = await supabase
    .from("transaction")
    .select("amount, narration, trxtype, createdAt")
    .in("accountId", accountIds)
    .eq("trxtype", "debit")
    .gte("createdAt", window.start.toISOString())
    .lte("createdAt", window.end.toISOString());

  if (!transactions || transactions.length === 0) return 0;

  // 3️⃣ Aggregate
  let sum = 0;

  for (const tx of transactions) {
    if (categoryName) {
      const category = categorizeTransaction(tx.narration ?? "", "debit");
      if (category !== categoryName) continue;
    }
    sum += tx.amount;
  }

  return sum;
}
