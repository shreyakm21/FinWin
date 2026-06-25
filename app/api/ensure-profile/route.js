// app/api/ensure-profile/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin"; // adjust path if needed

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body?.email;
    const auth_uuid = body?.auth_uuid ?? null;

    if (!email) {
      return NextResponse.json({ ok: false, error: "Missing email in request" }, { status: 400 });
    }

    // 1) check existing profile by email
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("users")
      .select('"userId", "email"')
      .eq('"email"', email)
      .maybeSingle();

    if (selErr && selErr.code !== "PGRST116") {
      // return the error from Supabase to help debugging
      return NextResponse.json({ ok: false, error: selErr }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ ok: true, created: false, userId: existing.userId });
    }

    // 2) insert profile row (adjust columns to your schema)
    const insertPayload = {
      email: email,
      auth_uuid: auth_uuid,   // optional column if you store auth.uuid
      created_at: new Date().toISOString()
      // add other required columns here (or set defaults in DB)
    };

    const { data: insData, error: insErr } = await supabaseAdmin
      .from('banking."User"')
      .insert([insertPayload])
      .select('"userId"')
      .maybeSingle();

    if (insErr) {
      return NextResponse.json({ ok: false, error: insErr }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: true, userId: insData?.userId ?? null });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
