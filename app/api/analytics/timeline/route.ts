// app/api/analytics/timeline/route.ts

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
      { transactions: [] },
      { status: 401 }
    );
  }

  const supabase = supabaseAdmin();

  const { data: authData, error: authErr } =
    await supabase.auth.getUser(token);

  if (authErr || !authData?.user) {
    return NextResponse.json(
      { transactions: [] },
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
      { transactions: [] },
      { status: 401 }
    );
  }

  const userId = userRow.userId;

  /**
   * 📊 3️⃣ Fetch user accounts
   */
  const { data: accounts } = await supabase
    .from("account")
    .select("accountId")
    .eq("userId", userId);

  if (!accounts?.length) {
    return NextResponse.json({ transactions: [] });
  }

  const accountIds = accounts.map(a => a.accountId);
  let balance = 0;

  /**
   * 📈 4️⃣ Fetch transactions (ordered)
   */
  const { data: txns } = await supabase
    .from("transaction")
    .select("amount, trxtype, narration, createdAt")
    .in("accountId", accountIds)
    .order("createdAt", { ascending: true });

  if (!txns?.length) {
    return NextResponse.json({ transactions: [] });
  }

  /**
   * 🧮 5️⃣ Build timeline with running balance
   */
  const timeline = txns.map(tx => {
    balance += tx.trxtype === "credit" ? tx.amount : -tx.amount;

    return {
      date: tx.createdAt.split("T")[0],
      narration: tx.narration,
      trxtype: tx.trxtype,
      amount: tx.amount,
      runningBalance: balance
    };
  });

  return NextResponse.json({ transactions: timeline });
}
