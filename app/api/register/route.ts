import { NextResponse } from "next/server";
import { supabaseAdmin, EVENT_CAPACITY } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are all required." },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // Enforce the 50 accepted-guest cap.
    const { count: acceptedCount, error: countError } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted");

    if (countError) throw countError;

    if ((acceptedCount ?? 0) >= EVENT_CAPACITY) {
      return NextResponse.json(
        {
          error:
            "We've reached our 50-guest capacity for this event. Registration is now closed.",
          full: true,
        },
        { status: 409 }
      );
    }

    // Prevent duplicate registrations from the same email.
    const { data: existing, error: existingError } = await supabase
      .from("registrations")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      return NextResponse.json(
        { id: existing.id, alreadyRegistered: true },
        { status: 200 }
      );
    }

    const { data, error } = await supabase
      .from("registrations")
      .insert({ name, email, phone, status: "pending" })
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

export async function GET() {
  try {
    const supabase = supabaseAdmin();
    const { count, error } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted");

    if (error) throw error;

    const accepted = count ?? 0;
    return NextResponse.json({
      accepted,
      capacity: EVENT_CAPACITY,
      spotsLeft: Math.max(EVENT_CAPACITY - accepted, 0),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { accepted: 0, capacity: EVENT_CAPACITY, spotsLeft: EVENT_CAPACITY },
      { status: 200 }
    );
  }
}
