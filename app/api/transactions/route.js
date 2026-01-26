//app/api/transactions/route.js

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";
import { evaluateGoals } from "../../../lib/goalEngine/evaluateGoals";
import { logGoalViolations } from "../../../lib/goalEngine/violationLogger";


export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔐 Get logged-in user
    const { data: authData, error: authErr } =
      await supabaseAdmin.auth.getUser(token);

    if (authErr || !authData?.user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const authUUID = authData.user.id;

    const body = await req.json();
    const {
      paymentMode,
      accountNumber,
      branch,
      amount,
      narration,
      ignoreGoals = false
    } = body;


    const numericAmount = Number(amount);
    const numericBranchId = Number(branch);

    if (!paymentMode || !accountNumber || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // 👤 Get internal userId
    const { data: userRow } = await supabaseAdmin
      .from("users")
      .select("userId")
      .eq("auth_uuid", authUUID)
      .single();

    if (!userRow) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 400 }
      );
    }

    // 🟢 GET SENDER ACCOUNT (REAL FIX)
    const { data: sender } = await supabaseAdmin
      .from("account")
      .select("accountId, accNo, balance")
      .eq("userId", userRow.userId)
      .single();

    if (!sender) {
      return NextResponse.json(
        { error: "Sender account not found" },
        { status: 400 }
      );
    }

    if (sender.balance < numericAmount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // ⚠️ Goal check (pre-transaction)
    let goalViolations = [];

    const goalResult = await evaluateGoals({
      userId: userRow.userId,
      amount: numericAmount,
      narration: narration ?? "",
      trxtype: "debit",
      createdAt: new Date(),
    });

    if (goalResult.violated && !ignoreGoals) {
      return NextResponse.json(
        { warning: true, violations: goalResult.violations },
        { status: 200 }
      );
    }

    if (goalResult.violated && ignoreGoals) {
      goalViolations = goalResult.violations;
    }




    // 🟢 Receiver
    const { data: receiver } = await supabaseAdmin
      .from("account")
      .select("accountId, accNo, balance")
      .eq("accNo", accountNumber)
      .single();

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver account not found" },
        { status: 400 }
      );
    }

    // 🔢 REF NO
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,"");
    const refPrefix = `${paymentMode}${dateStr}`;

    const { data: lastTx } = await supabaseAdmin
      .from("transaction")
      .select("refNo")
      .like("refNo", `${refPrefix}%`)
      .order("refNo", { ascending: false })
      .limit(1);

    let next = "001";
    if (lastTx?.length) {
      next = String(parseInt(lastTx[0].refNo.slice(-3)) + 1).padStart(3,"0");
    }

    const refNo = `${refPrefix}${next}`;

    // 💰 Update balances
    await supabaseAdmin
      .from("account")
      .update({ balance: sender.balance - numericAmount })
      .eq("accountId", sender.accountId);

    await supabaseAdmin
      .from("account")
      .update({ balance: receiver.balance + numericAmount })
      .eq("accountId", receiver.accountId);

    // 🧾 Transactions
    await supabaseAdmin.from("transaction").insert([
      {
        accountId: sender.accountId,
        accNo: sender.accNo,
        amount: numericAmount,
        branchId: numericBranchId,
        narration,
        refNo,
        fromTo: receiver.accNo,
        mode: paymentMode,
        trxtype: "debit",
        status: "success",
      },
      {
        accountId: receiver.accountId,
        accNo: receiver.accNo,
        amount: numericAmount,
        branchId: numericBranchId,
        narration,
        refNo,
        fromTo: sender.accNo,
        mode: paymentMode,
        trxtype: "credit",
        status: "success",
      },
    ]);

    // 🧾 Log goal violations (if user ignored warnings)
    if (goalViolations.length > 0) {
      const { data: tx } = await supabaseAdmin
        .from("transaction")
        .select("transactionId")
        .eq("refNo", refNo)
        .eq("trxtype", "debit")
        .single();

      if (tx?.transactionId) {
        await logGoalViolations({
          violations: goalViolations,
          transactionId: tx.transactionId,
          attemptedAmount: numericAmount, // ✅ correct field
        });
      }
    }


    return NextResponse.json(
      { message: "Transaction successful", refNo },
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
