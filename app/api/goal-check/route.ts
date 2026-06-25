// app/api/goal-check/route.ts

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { evaluateGoals } from "../../../lib/goalEngine/evaluateGoals";
//import { supabaseAdmin } from "../../utils/supabaseAdmin";


export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const { data: authData } = await supabase.auth.getUser(token);

  if (!authData?.user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("userId")
    .eq("auth_uuid", authData.user.id)
    .single();

  if (!userRow) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  const body = await req.json();

  const result = await evaluateGoals({
    userId: userRow.userId,
    amount: Number(body.amount),
    narration: body.narration ?? "",
    trxtype: "debit",
    createdAt: new Date(),
  });

  return NextResponse.json(result);
}
