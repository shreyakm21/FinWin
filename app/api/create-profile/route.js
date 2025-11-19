// app/api/create-profile/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";
import bcrypt from "bcryptjs";

/**
 * Create-profile API
 * - Accepts both snake_case and camelCase keys from the client.
 * - Protects the integer PK 'userId' from being supplied by client code.
 * - If a user with the same email exists, returns that row instead of inserting (avoids duplicates).
 * - Optionally stores incoming auth UUID into `auth_uuid` column if it exists in your DB.
 * - Sets roleId = 4 for new users.
 * - Hashes password if provided (never stores plaintext; never returns hashed password to client).
 */
export async function POST(req) {
  try {
    const body = await req.json();

    // normalize inputs (accept snake_case or camelCase)
    const userIdRaw = body.userId ?? body.user_id ?? null;
    const email = body.email ?? null;
    const firstname = body.firstname ?? body.first_name ?? null;
    const lastname = body.lastname ?? body.last_name ?? null;
    const address = body.address ?? null;
    const city = body.city ?? null;
    const pincode = body.pincode ?? null;

    // accept phone from client (snake_case or camelCase)
    const phone = body.phone_number ?? body.phoneNumber ?? body.phone ?? null;

    // accept password (do not store plaintext)
    const rawPassword = body.password ?? body.pass ?? null;

    console.log("create-profile payload:", { userIdRaw, email, firstname, lastname, address, city, pincode, phone, passwordProvided: !!rawPassword });

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Missing required field: email is required." },
        { status: 400 }
      );
    }

    // 0) If a user already exists with this email, return it (avoid duplicate inserts)
    const { data: existingByEmail, error: existingErr } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingErr) {
      console.error("Error checking existing user by email:", existingErr);
      return NextResponse.json({ ok: false, error: "Database error checking existing user" }, { status: 500 });
    }

    if (existingByEmail) {
      // user already exists — return it (client can treat this as success)
      // Do not return password field even if present
      if (existingByEmail.password) delete existingByEmail.password;
      return NextResponse.json({ ok: true, data: existingByEmail, existed: true }, { status: 200 });
    }

    // Build insert object — DO NOT set the integer primary key `userId` here.
    const insertObj = {
      email,
      firstname,
      lastname,
      address,
      city,
      pincode,
      roleId: 4, // default role
    };

    // map phone
    if (phone) insertObj.phoneno = phone;

    // If incoming auth id is UUID-like, optionally store it in auth_uuid column
    const isUuidLike =
      typeof userIdRaw === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdRaw);

    if (isUuidLike) {
      insertObj.auth_uuid = userIdRaw;
    }

    // Hash password if provided (never store plaintext)
    if (rawPassword) {
      try {
        const hashedPassword = await bcrypt.hash(rawPassword, 10); // 10 salt rounds
        insertObj.password = hashedPassword;
      } catch (hashErr) {
        console.error("Password hash failed:", hashErr);
        // proceed without password rather than failing the whole request
      }
    }

    // Defensive: ensure the primary key integer column is not supplied by client
    if ("userId" in insertObj) delete insertObj.userId;
    if ("user_id" in insertObj) delete insertObj.user_id;

    // Log sanitized insert object (do not log password)
    const sanitizedLog = { ...insertObj };
    if ("password" in sanitizedLog) sanitizedLog.password = "[REDACTED]";
    console.log("About to insert user row:", sanitizedLog);

    // Insert new profile; DB will generate integer PK (userId) automatically
    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([insertObj])
      .select()
      .limit(1);

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // remove password from the returned object before sending to client
    const inserted = data?.[0] ?? null;
    if (inserted && inserted.password) delete inserted.password;

    return NextResponse.json({ ok: true, data: inserted }, { status: 200 });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
