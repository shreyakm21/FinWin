//app\api\goals\metrics\route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../utils/supabaseAdmin";
import { categorizeTransaction } from "../../../../utils/analytics/categorizer";

export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json([], { status: 401 });

  const { data: auth } = await supabaseAdmin.auth.getUser(token);
  if (!auth?.user) return NextResponse.json([], { status: 401 });

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("userId")
    .eq("auth_uuid", auth.user.id)
    .single();

  const { data: goals } = await supabaseAdmin
    .from("UserGoal")
    .select("*")
    .eq("userId", user.userId)
    .eq("isActive", true);

  const { data: txs } = await supabaseAdmin
    .from("transaction")
    .select("amount, narration, createdAt")
    .eq("trxtype", "debit")
    .gte("createdAt", new Date(Date.now() - 30 * 864e5).toISOString());

  const result = goals.map(g => {
    let spent = 0;

    for (const tx of txs || []) {
      if (g.categoryName) {
        const cat = categorizeTransaction(tx.narration ?? "", "debit");
        if (cat !== g.categoryName) continue;
      }
      spent += tx.amount;
    }

    return {
      ...g,
      currentSpent: spent,
    };
  });

  return NextResponse.json(result);
}
