// @ts-nocheck
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 401 }
      );
    }

    // Get Supabase Auth user
    const { data: userData, error: authErr } =
      await supabaseAdmin.auth.getUser(token);

    if (authErr || !userData?.user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const authUUID = userData.user.id; // supabase auth UUID

    // Get your internal userId and firstname
    const { data: userRow } = await supabaseAdmin
      .from("users")
      .select("userId, firstname")
      .eq("auth_uuid", authUUID)
      .single();

    const localUserId = userRow?.userId;
    const firstname = userRow?.firstname ?? null;

    // Fetch account balance using local userId
    let accountBalance = 0;

    const { data: accountRows } = await supabaseAdmin
      .from("account")
      .select("balance")
      .eq("userId", localUserId);

    if (Array.isArray(accountRows)) {
      accountBalance = accountRows.reduce(
        (sum, row) => sum + Number(row.balance || 0),
        0
      );
    }

    return NextResponse.json({
      username: firstname,
      accountBalance,
      recentTransactions: 0,
      upcomingBills: 0,
      totalSavings: 0,
    });

  } catch (err) {
    console.error("overview route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
