import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // 🔐 Get auth user
    const { data: authData, error: authErr } =
      await supabaseAdmin.auth.getUser(token);

    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const authUUID = authData.user.id;

    // 🟢 SAFE fetch user (no crash)
    const { data: userRow, error: userErr } = await supabaseAdmin
      .from("users")
      .select("userId, firstname")
      .eq("auth_uuid", authUUID)
      .maybeSingle();

    if (userErr || !userRow) {
      return NextResponse.json({
        username: null,
        accountBalance: 0,
        primaryAccNo: null,
        recentTransactions: 0,
        upcomingBills: 0,
        totalSavings: 0,
      });
    }

    const localUserId = userRow.userId;

    // 🏦 Fetch account(s)
    const { data: accountRows, error: accErr } = await supabaseAdmin
      .from("account")
      .select("balance, accNo")
      .eq("userId", localUserId);

    if (accErr) {
      console.error("Account fetch error:", accErr);
      return NextResponse.json(
        { error: "Account fetch failed" },
        { status: 500 }
      );
    }

    let accountBalance = 0;
    let primaryAccNo = null;

    if (Array.isArray(accountRows) && accountRows.length > 0) {
      accountBalance = accountRows.reduce(
        (sum, row) => sum + Number(row.balance || 0),
        0
      );
      primaryAccNo = accountRows[0].accNo; // ⭐ senderAccNo
    }

    return NextResponse.json({
      username: userRow.firstname,
      accountBalance,
      primaryAccNo,
      recentTransactions: 0,
      upcomingBills: 0,
      totalSavings: 0,
    });
  } catch (err) {
    console.error("Overview API crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
