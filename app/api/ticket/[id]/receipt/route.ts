import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { uploadReceipt } from "@/lib/cloudinary";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing registration id." }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data: row, error: fetchError } = await supabase
      .from("registrations")
      .select("id, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!row) {
      return NextResponse.json({ error: "Registration not found." }, { status: 404 });
    }

    if (row.status === "confirmed") {
      return NextResponse.json(
        { error: "Payment already confirmed — receipt can't be changed." },
        { status: 409 }
      );
    }

    if (row.status === "rejected") {
      return NextResponse.json(
        { error: "This registration was rejected. Contact the organisers." },
        { status: 409 }
      );
    }

    const form = await req.formData();
    const file = form.get("receipt");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Please choose a receipt image to upload." },
        { status: 400 }
      );
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Upload a JPG, PNG, or WEBP image of your receipt." },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be under 5MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadReceipt(buffer, id, file.type);

    const { error: updateError } = await supabase
      .from("registrations")
      .update({
        receipt_url: url,
        receipt_uploaded_at: new Date().toISOString(),
        status: "awaiting_review",
      })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, receipt_url: url });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "Upload failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
