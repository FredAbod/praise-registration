import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, isValidSessionToken } from "@/lib/auth";
import { supabaseAdmin, EVENT_CAPACITY } from "@/lib/supabase";

export async function POST(req: Request) {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!(await isValidSessionToken(token))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id, status } = await req.json();

  if (!id || !["pending", "accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  if (status === "accepted") {
    const { count, error: countError } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted");

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((count ?? 0) >= EVENT_CAPACITY) {
      return NextResponse.json(
        { error: `All ${EVENT_CAPACITY} seats are already confirmed.` },
        { status: 409 }
      );
    }
  }

  const { error } = await supabase
    .from("registrations")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
