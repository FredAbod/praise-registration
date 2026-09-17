import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { RegistrationStatus } from "@/lib/event";

const ALLOWED: RegistrationStatus[] = [
  "pending_payment",
  "awaiting_review",
  "confirmed",
  "rejected",
];

export async function POST(req: Request) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!(await isValidSessionToken(token))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id, status } = await req.json();

  if (!id || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  const patch: Record<string, unknown> = { status };
  if (status === "confirmed") {
    patch.confirmed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("registrations")
    .update(patch)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
