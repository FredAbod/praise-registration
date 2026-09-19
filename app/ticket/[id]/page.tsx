import { headers } from "next/headers";
import QRCode from "qrcode";
import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import DownloadQrButton from "./DownloadQrButton";
import ReceiptUpload from "./ReceiptUpload";
import {
  EVENT,
  formatNaira,
  paymentDetails,
  type RegistrationStatus,
} from "@/lib/event";

export const dynamic = "force-dynamic";

async function getRegistration(id: string) {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, name, phone, assembly, district, status, receipt_url, created_at, receipt_uploaded_at, confirmed_at"
    )
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
  RegistrationStatus,
  { label: string; color: string; blurb: string }
> = {
  pending_payment: {
    label: "Awaiting payment",
    color: "text-ember-400 border-ember-400/60 bg-ember-400/10",
    blurb:
      "Transfer the registration fee below, then upload a screenshot of your receipt.",
  },
  awaiting_review: {
    label: "Payment under review",
    color: "text-parchment-200 border-parchment-200/60 bg-parchment-200/10",
    blurb:
      "We've received your receipt. An admin will confirm your payment shortly.",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-emerald-400 border-emerald-400/60 bg-emerald-400/10",
    blurb: "You're confirmed. Show this QR code at the door.",
  },
  rejected: {
    label: "Not approved",
    color: "text-red-400 border-red-400/60 bg-red-400/10",
    blurb:
      "We couldn't confirm this registration. Contact the organisers if you need help.",
  },
};

export default async function TicketPage({
  params,
}: {
  params: { id: string };
}) {
  const registration = await getRegistration(params.id);
  const pay = paymentDetails();

  if (!registration) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-5 py-12 sm:px-6">
        <div className="glass-card max-w-md rounded-2xl p-7 text-center sm:p-10">
          <h1 className="mb-3 font-display text-2xl font-bold text-parchment-50">
            Ticket not found
          </h1>
          <p className="mb-6 text-parchment-100/70">
            We couldn&apos;t find a registration with that link.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-bark-500 px-6 py-3 font-semibold text-parchment-50 transition-colors hover:bg-bark-600"
          >
            Back to registration
          </Link>
        </div>
      </main>
    );
  }

  const statusKey = (registration.status ||
    "pending_payment") as RegistrationStatus;
  const status = STATUS_COPY[statusKey] ?? STATUS_COPY.pending_payment;
  const isConfirmed = statusKey === "confirmed";
  const canUpload =
    statusKey === "pending_payment" || statusKey === "awaiting_review";

  const ticketUrl = `${siteUrl()}/ticket/${registration.id}`;
  const qrDataUrl = isConfirmed
    ? await QRCode.toDataURL(ticketUrl, {
        margin: 1,
        width: 320,
        color: { dark: "#241810", light: "#f7f0e4" },
      })
    : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-5 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-3xl p-6 text-center shadow-2xl sm:p-10">
          <div className="mx-auto mb-4 max-w-[140px] overflow-hidden rounded-xl border border-bark-400/40">
            <Image
              src="/flyer.jpg"
              alt={EVENT.title}
              width={280}
              height={400}
              className="h-auto w-full"
            />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-ember-400">
            {EVENT.title}
          </p>
          <h1 className="mb-1 font-display text-2xl font-bold leading-tight text-parchment-50 sm:text-3xl">
            {EVENT.theme}
          </h1>
          <p className="mb-6 text-sm text-parchment-100/70">
            {EVENT.datesShort} · {EVENT.venueShort}
          </p>

          <div
            className={`mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-semibold ${status.color}`}
          >
            {status.label}
          </div>
          <p className="mb-6 text-sm text-parchment-100/80">{status.blurb}</p>

          <div className="mb-6 space-y-1.5 rounded-xl bg-black/20 p-4 text-left text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-parchment-100/60">Guest</span>
              <span className="font-medium text-parchment-50">
                {registration.name}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-parchment-100/60">Assembly</span>
              <span className="text-right font-medium text-parchment-50">
                {registration.assembly}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-parchment-100/60">District</span>
              <span className="text-right font-medium text-parchment-50">
                {registration.district}
              </span>
            </div>
            {registration.phone && (
              <div className="flex justify-between gap-3">
                <span className="text-parchment-100/60">Phone</span>
                <span className="font-medium text-parchment-50">
                  {registration.phone}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <span className="text-parchment-100/60">Venue</span>
              <span className="text-right font-medium text-parchment-50">
                {EVENT.venueShort}
              </span>
            </div>
          </div>

          {!isConfirmed && (
            <div className="mb-6 rounded-xl border border-ember-400/40 bg-ember-400/10 p-4 text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ember-400">
                Pay {formatNaira(pay.amountNgn)}
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-parchment-100/60">Bank</dt>
                  <dd className="font-semibold text-parchment-50">{pay.bank}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-parchment-100/60">Account name</dt>
                  <dd className="text-right font-semibold text-parchment-50">
                    {pay.accountName}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-parchment-100/60">Account number</dt>
                  <dd className="font-mono text-lg font-bold tracking-wide text-parchment-50">
                    {pay.accountNumber}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {canUpload && (
            <div className="mb-6">
              <ReceiptUpload
                registrationId={registration.id}
                existingUrl={registration.receipt_url}
              />
            </div>
          )}

          {isConfirmed && qrDataUrl && (
            <>
              <div className="mx-auto mb-4 inline-block rounded-2xl bg-parchment-50 p-3 sm:p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Ticket QR code"
                  width={220}
                  height={220}
                  className="block h-auto w-[200px] max-w-full rounded-lg sm:w-[220px]"
                />
              </div>
              <DownloadQrButton
                qrDataUrl={qrDataUrl}
                fileName={`youth-retreat-ticket-${registration.id}.png`}
              />
              <div className="mb-4 rounded-xl border border-ember-400/40 bg-ember-400/10 px-4 py-3">
                <p className="text-sm font-semibold text-ember-400">
                  Keep this QR code safe
                </p>
                <p className="mt-1 text-xs text-parchment-100/70">
                  Download or screenshot it and have it ready at the door.
                </p>
              </div>
            </>
          )}

          <p className="text-xs text-parchment-100/50">
            Bookmark this page — it always shows your current status.
          </p>
        </div>
      </div>
    </main>
  );
}
