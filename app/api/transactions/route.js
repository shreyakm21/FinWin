import { NextResponse } from "next/server";
import { supabaseServer } from "../../../lib/supabaseServer";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      paymentMode,
      accountNumber, // receiver acc no
      branch,
      amount,
      narration,
    } = body;

    if (!paymentMode || !accountNumber || !branch || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // ✅ DATE ONLY : YYYYMMDD
    const dateStr = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");

    // =============================
    // Sender (demo / logged-in user)
    // =============================
    const senderAccountId = 1;
    const senderAccNo = "5001010001";

    // =============================
    // Receiver lookup
    // =============================
    const { data: receiver, error: recvErr } = await supabaseServer
      .from("account")
      .select("accountId, accNo")
      .eq("accNo", accountNumber)
      .single();

    if (recvErr || !receiver) {
      return NextResponse.json(
        { error: "Receiver account not found" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    const numericBranchId = Number(branch);

    // =================================================
    // 🔢 AUTO-INCREMENT REF NO (NO TIME, NO DASH)
    // Example: UPI20260102001
    // =================================================
    const refPrefix = `${paymentMode}${dateStr}`;

    const { data: lastTx } = await supabaseServer
      .from("transaction")
      .select("refNo")
      .like("refNo", `${refPrefix}%`)
      .order("refNo", { ascending: false })
      .limit(1);

    let nextNumber = "001";

    if (lastTx && lastTx.length > 0) {
      const lastRef = lastTx[0].refNo;
      const lastNum = parseInt(lastRef.slice(-3), 10);
      nextNumber = String(lastNum + 1).padStart(3, "0");
    }

    const refNo = `${refPrefix}${nextNumber}`;

    // =================================================
    // TRANSACTION ROWS
    // =================================================
    const rows = [
      {
        // 🔴 DEBIT
        accountId: senderAccountId,
        accNo: senderAccNo,
        amount: numericAmount,
        branchId: numericBranchId,
        narration: narration || null,
        createdAt: now,
        refNo,
        fromTo: receiver.accNo,
        mode: paymentMode,
        status: "success",
        trxtype: "debit",
      },
      {
        // 🟢 CREDIT
        accountId: receiver.accountId,
        accNo: receiver.accNo,
        amount: numericAmount,
        branchId: numericBranchId,
        narration: narration || null,
        createdAt: now,
        refNo,
        fromTo: senderAccNo,
        mode: paymentMode,
        status: "success",
        trxtype: "credit",
      },
    ];

    const { data, error } = await supabaseServer
      .from("transaction")
      .insert(rows)
      .select();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Transaction successful", refNo, data },
      { status: 201 }
    );
  } catch (err) {
    console.error("Route Error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
