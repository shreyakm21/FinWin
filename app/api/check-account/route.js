import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

async function generateNextAccountNumber(supabaseAdmin) {
  const PREFIX = "1010001"; // fixed bank prefix

  const { data, error } = await supabaseAdmin
    .from("account")
    .select("accNo")
    .like("accNo", `${PREFIX}%`)
    .order("accNo", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error("Failed to fetch last account number");
  }

  // First account
  if (!data || data.length === 0) {
    return `${PREFIX}0001`; // 10100010001
  }

  const lastAccNo = data[0].accNo;
  const lastNumber = parseInt(lastAccNo.slice(PREFIX.length), 10);
  const nextNumber = lastNumber + 1;

  return `${PREFIX}${String(nextNumber).padStart(4, "0")}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("check-account payload:", body);

    const {
      uuid,
      email,
      acctype,
      balance: rawBalance,
      branchId,
      userId: providedUserId,
    } = body ?? {};

    // ---------------- VALIDATION ----------------
    if (!acctype || typeof rawBalance === "undefined" || !branchId) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields (acctype, balance, branchId)" },
        { status: 400 }
      );
    }

    const balance = Number(rawBalance);
    if (Number.isNaN(balance) || balance <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid balance" },
        { status: 400 }
      );
    }

    // ---------------- RESOLVE USER ID ----------------
    let userId = providedUserId ?? null;

    if (!userId && uuid) {
      const { data: uByUuid, error } = await supabaseAdmin
        .from("users")
        .select("userId")
        .eq("auth_uuid", uuid)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }

      if (uByUuid?.userId != null) userId = uByUuid.userId;
    }

    if (!userId && email) {
      const { data: uByEmail, error } = await supabaseAdmin
        .from("users")
        .select("userId")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { ok: false, error: error.message },
          { status: 500 }
        );
      }

      if (uByEmail?.userId != null) userId = uByEmail.userId;
    }

    // ---------------- CREATE USER IF NEEDED ----------------
    if (!userId) {
      if (!email) {
        return NextResponse.json(
          { ok: false, error: "User not found" },
          { status: 404 }
        );
      }

      const { data: newUser, error } = await supabaseAdmin
        .from("users")
        .insert([
          {
            email,
            auth_uuid: uuid ?? null,
            roleId: 4,
          },
        ])
        .select("userId")
        .single();

      if (error || !newUser) {
        return NextResponse.json(
          { ok: false, error: "Failed to create user" },
          { status: 500 }
        );
      }

      userId = newUser.userId;
    }

    // ---------------- CHECK EXISTING ACCOUNT ----------------
    const { data: existingAccount, error: accErr } = await supabaseAdmin
      .from("account")
      .select("*")
      .eq("userId", userId)
      .maybeSingle();

    if (accErr) {
      return NextResponse.json(
        { ok: false, error: accErr.message },
        { status: 500 }
      );
    }

    if (existingAccount) {
      return NextResponse.json(
        { ok: true, existed: true, data: existingAccount },
        { status: 200 }
      );
    }

    // ---------------- CREATE ACCOUNT ----------------
    const accNo = await generateNextAccountNumber(supabaseAdmin);

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("account")
      .insert([
        {
          userId,
          acctype,
          balance,
          branchId,
          accNo,
          createdAt: new Date().toISOString(),
        },
      ])
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, created: true, data: inserted },
      { status: 200 }
    );

  } catch (err) {
    console.error("check-account unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: String(err.message || err) },
      { status: 500 }
    );
  }
}
