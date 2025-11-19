// app/api/debug-admin/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select('*')
      .limit(1);

    return NextResponse.json({ ok: true, sample: data, error });
  } catch (err) {
    return NextResponse.json({ ok: false, err: String(err) }, { status: 500 });
  }
}
