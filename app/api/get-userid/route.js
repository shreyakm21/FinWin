// app/api/get-userid/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ error: "Missing email" }, { status: 400 });

    // 1️⃣ Get the user's integer ID from the users table
    const { data: userRow, error: userErr } = await supabaseAdmin
      .from("users")
      .select("userId")
      .eq("email", email)
      .maybeSingle();

    if (userErr) {
      console.error("get-userid error:", userErr);
      return NextResponse.json({ error: userErr.message }, { status: 500 });
    }

    const userId = userRow?.userId ?? null;
    let hasAccount = false;

    // 2️⃣ If userId found, check if that user already has an account
    if (userId !== null) {
      const { data: accountRow, error: accountErr } = await supabaseAdmin
        .from("account")
        .select("accountId")
        .eq("userId", userId)
        .maybeSingle();

      if (accountErr) {
        console.error("get-userid account check error:", accountErr);
        return NextResponse.json(
          { error: accountErr.message },
          { status: 500 }
        );
      }

      hasAccount = !!accountRow;
    }

    // 3️⃣ Return both userId and hasAccount
    return NextResponse.json({ userId, hasAccount }, { status: 200 });
  } catch (err) {
    console.error("get-userid unexpected error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
