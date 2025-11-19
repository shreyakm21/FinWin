// app/api/check-account/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("check-account payload:", body);

    const {
      uuid,               // auth UUID from Supabase Auth (preferred)
      email,              // optional email fallback
      acctype,            // account type (DB column 'acctype')
      balance: rawBalance,// incoming balance (may be string/number)
      branchId,           // integer branch id
      userId: providedUserId,
    } = body ?? {};

    // basic validation
    if (!acctype || typeof rawBalance === "undefined" || !branchId) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields (acctype, balance, branchId)" },
        { status: 400 }
      );
    }

    // ensure numeric balance
    const balance = Number(rawBalance);
    if (Number.isNaN(balance) || balance <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid balance" }, { status: 400 });
    }

    // 1) Resolve integer userId: prefer providedUserId, then auth_uuid (uuid), then email
    let userId = providedUserId ?? null;

    if (!userId) {
      if (uuid) {
        const { data: uByUuid, error: uByUuidErr } = await supabaseAdmin
          .from("users")
          .select("userId")
          .eq("auth_uuid", uuid)
          .maybeSingle();

        if (uByUuidErr) {
          console.error("Error fetching user by uuid:", uByUuidErr);
          return NextResponse.json({ ok: false, error: uByUuidErr.message }, { status: 500 });
        }

        if (uByUuid?.userId != null) userId = uByUuid.userId;
      }
    }

    if (!userId && email) {
      const { data: uByEmail, error: uByEmailErr } = await supabaseAdmin
        .from("users")
        .select("userId")
        .eq("email", email)
        .maybeSingle();

      if (uByEmailErr) {
        console.error("Error fetching user by email:", uByEmailErr);
        return NextResponse.json({ ok: false, error: uByEmailErr.message }, { status: 500 });
      }

      if (uByEmail?.userId != null) userId = uByEmail.userId;
    }

    // If still no userId, create a minimal user row if we have an email (so account creation can proceed)
    if (!userId) {
      if (!email) {
        return NextResponse.json({ ok: false, error: "User not found (no uuid/userId/email provided)" }, { status: 404 });
      }

      // Insert minimal user: email, auth_uuid (if available), roleId = 4
      const newUserObj = {
        email,
        roleId: 4,
      };
      if (uuid) newUserObj.auth_uuid = uuid;

      const { data: newUserData, error: newUserErr } = await supabaseAdmin
        .from("users")
        .insert([newUserObj])
        .select("userId")
        .limit(1);

      if (newUserErr) {
        console.error("Error creating minimal user:", newUserErr);
        return NextResponse.json({ ok: false, error: newUserErr.message }, { status: 500 });
      }

      userId = newUserData?.[0]?.userId ?? null;
      if (!userId) {
        return NextResponse.json({ ok: false, error: "Failed to create user" }, { status: 500 });
      }
    }

    // 2) Check if an account already exists for this user
    const { data: existingAccount, error: existingError } = await supabaseAdmin
      .from("account")
      .select("*")
      .eq("userId", userId)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking existing account:", existingError);
      return NextResponse.json({ ok: false, error: existingError.message }, { status: 500 });
    }

    if (existingAccount) {
      // if account exists, return it
      const sanitized = { ...existingAccount };
      return NextResponse.json({ ok: true, existed: true, data: sanitized }, { status: 200 });
    }

    // 3) Insert new account row (use camelCase column names matching your table)
    const accNo = `5001${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;

    const insertObj = {
      userId,
      acctype,
      balance,
      branchId,
      accNo,
      createdAt: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("account")
      .insert([insertObj])
      .select("*")
      .limit(1);

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: true, data: inserted?.[0] ?? null }, { status: 200 });
  } catch (err) {
    console.error("check-account unexpected error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
