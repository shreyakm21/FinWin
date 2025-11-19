import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../utils/supabaseAdmin";

export async function POST(req) {
  const { email } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("users")
    .select('*')
    .eq('email', email); // try unquoted first

  return NextResponse.json({ data, error: error ? error.message : null });
}
