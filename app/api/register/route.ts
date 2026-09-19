import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const assembly = String(body.assembly || "").trim();
    const district = String(body.district || "").trim();

    if (!name || !assembly || !district) {
      return NextResponse.json(
        { error: "Name, assembly, and district are required." },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("registrations")
      .insert({
        name,
        phone: phone || null,
        assembly,
        district,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
