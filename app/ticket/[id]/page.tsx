import { headers } from "next/headers";
import QRCode from "qrcode";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getRegistration(id: string) {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("registrations")
    .select("id, name, email, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

function siteUrl() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const protocol = h.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}`;
}

const STATUS_COPY: Record<
  string,
  { label: string; color: string; blurb: string }
> = {
  pending: {
    label: "Pending Review",
    color: "text-gold-500 border-gold-500/60 bg-gold-500/10",
    blurb: "You're on the list! We'll confirm your spot shortly.",
  },
  accepted: {
    label: "Confirmed",
    color: "text-emerald-400 border-emerald-400/60 bg-emerald-400/10",
    blurb: "You're confirmed. Show this QR code at the door.",
  },
  rejected: {
    label: "Not Approved",
    color: "text-rust-400 border-rust-400/60 bg-rust-400/10",
    blurb: "We're unable to confirm your spot for this session.",
  },
};

export default async function TicketPage({
  params,
}: {
  params: { id: string };
}) {
  const registration = await getRegistration(params.id);

  if (!registration) {
    return (
      <main className="min-h-screen bg-hero-gradient flex items-center justify-center px-5 py-12 sm:px-6">
        <div className="glass-card rounded-2xl p-7 text-center max-w-md sm:p-10">
          <h1 className="font-display text-2xl font-bold text-cream-50 mb-3">
            Ticket not found
          </h1>
          <p className="text-cream-100/70 mb-6">
            We couldn&apos;t find a registration with that link. Double-check the
            QR code or link you used.
          </p>
          <Link
            href="/"
            className="inline-block bg-rust-500 hover:bg-rust-600 transition-colors text-cream-50 font-semibold px-6 py-3 rounded-full"
          >
            Back to registration
          </Link>
        </div>
      </main>
    );
  }

  const ticketUrl = `${siteUrl()}/ticket/${registration.id}`;
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
    margin: 1,
    width: 320,
    color: { dark: "#0d2f2c", light: "#faf3e6" },
  });

  const status = STATUS_COPY[registration.status] ?? STATUS_COPY.pending;

  return (
    <main className="min-h-screen bg-hero-gradient flex items-center justify-center px-5 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-6 sm:p-10 text-center shadow-2xl">
          <span className="mx-auto mb-4 flex w-fit items-center rounded-xl bg-cream-50 px-3 py-1.5 shadow-sm ring-1 ring-gold-500/30">
            <Image
              src="/logo.png"
              alt="Gbolahan Sings logo"
              width={614}
              height={406}
              className="h-7 w-auto"
            />
          </span>
          <p className="uppercase tracking-[0.3em] text-xs text-gold-500 font-semibold mb-2">
            The Praise Gathering
          </p>
          <h1 className="font-display text-3xl font-extrabold text-cream-50 leading-tight mb-1">
            Praise Unfiltered <span className="text-rust-400">1.0</span>
          </h1>
          <p className="text-cream-100/70 text-sm mb-6">
            Gbolahan Sings · 6th September 2026 · 3PM
          </p>

          <div className="mx-auto mb-4 inline-block rounded-2xl bg-cream-50 p-3 sm:p-4">
            <img
              src={qrDataUrl}
              alt="Ticket QR code"
              width={220}
              height={220}
              className="block h-auto w-[200px] max-w-full rounded-lg sm:w-[220px]"
            />
          </div>

          <a
            href={qrDataUrl}
            download={`praise-unfiltered-ticket-${registration.id}.png`}
            className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-gold-500/60 bg-gold-500/10 px-5 py-2 text-sm font-semibold text-gold-500 transition-colors hover:bg-gold-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download QR code
          </a>

          <div
            className={`inline-block border rounded-full px-4 py-1.5 text-sm font-semibold mb-4 ${status.color}`}
          >
            {status.label}
          </div>

          <p className="text-cream-100/80 text-sm mb-6">{status.blurb}</p>

          <div className="text-left bg-black/20 rounded-xl p-4 space-y-1.5 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-cream-100/60">Guest</span>
              <span className="text-cream-50 font-medium">
                {registration.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream-100/60">Email</span>
              <span className="text-cream-50 font-medium truncate ml-4">
                {registration.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cream-100/60">Venue</span>
              <span className="text-cream-50 font-medium">
                Disclosed after confirmation
              </span>
            </div>
          </div>

          <p className="text-xs text-cream-100/50">
            Bookmark or screenshot this page — it always shows your current
            status.
          </p>
        </div>
      </div>
    </main>
  );
}
