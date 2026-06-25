// app/api/update-last-login/route.js
import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("users")
      .update({ lastlogin: now })
      .eq("email", email);

    if (error) {
      console.error("update-last-login supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("update-last-login unexpected error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
