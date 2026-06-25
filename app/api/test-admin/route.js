// app/api/test-admin/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin"; // adjust if utils is elsewhere

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")   // exact string as used elsewhere
      .select("userId, email")
      .limit(1);

    return NextResponse.json({ ok: true, data, error });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
