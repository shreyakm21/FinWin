// app/api/transactions/history/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseServer";

export async function GET(req: Request) {
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

  // Map auth_uuid → userId
  const { data: userRow } = await supabase
    .from("users")
    .select("userId")
    .eq("auth_uuid", authUUID)
    .single();

  if (!userRow?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userRow.userId;

  // Fetch all transactions
  const { data, error } = await supabase
    .from("transaction")
    .select(
      `transactionId, narration, amount, trxtype, status, mode, createdAt, fromTo,
       account!inner(userId)`
    )
    .eq("account.userId", userId)
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
