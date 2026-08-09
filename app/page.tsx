import Image from "next/image";
import { supabaseAdmin, EVENT_CAPACITY } from "@/lib/supabase";
import RegisterForm from "@/app/components/RegisterForm";

export const dynamic = "force-dynamic";

async function getSpotsLeft() {
  try {
    const supabase = supabaseAdmin();
    const { count } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted");
    return Math.max(EVENT_CAPACITY - (count ?? 0), 0);
  } catch {
    return EVENT_CAPACITY;
  }
}

export default async function Home() {
  const spotsLeft = await getSpotsLeft();
  const claimed = EVENT_CAPACITY - spotsLeft;
  const percent = Math.min((claimed / EVENT_CAPACITY) * 100, 100);
  const full = spotsLeft <= 0;

  return (
    <main className="min-h-screen bg-hero-gradient">
      <div className="mx-auto w-full max-w-5xl px-5 pb-28 pt-6 sm:px-6 sm:py-14 lg:pb-14">
        {/* Header badge */}
        <div className="mb-6 flex items-center justify-between sm:mb-12">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center rounded-xl bg-cream-50 px-2 py-1 shadow-sm ring-1 ring-gold-500/30">
              <Image
                src="/logo.png"
                alt="Gbolahan Sings logo"
                width={614}
                height={406}
                priority
                className="h-6 w-auto sm:h-7"
              />
            </span>
            <span className="text-sm tracking-wide text-cream-100/70">
              Gbolahan_Sings
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-rust-600/90 px-3 py-1.5 text-xs font-semibold text-cream-50">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cream-50" />
            LIVE STREAMED
          </span>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Left: flyer + hero copy */}
          <div>
            {/* Flyer */}
            <div className="group relative mx-auto mb-8 max-w-md overflow-hidden rounded-3xl border border-gold-500/25 shadow-2xl shadow-black/40">
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-cream-50/10" />
              <Image
                src="/flyer.jpeg"
                alt="Praise Unfiltered 1.0 — The Praise Gathering with Gbolahan Sings, 6th September 2026, 3PM"
                width={1080}
                height={1080}
                priority
                sizes="(max-width: 1024px) 92vw, 480px"
                className="h-auto w-full"
              />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-gold-500 sm:text-sm">
              Praise
            </p>
            <h1 className="mb-1 font-display text-4xl font-black leading-[0.95] text-cream-50 sm:text-6xl">
              Unfiltered
              <span className="align-super text-xl text-rust-400 sm:text-3xl ml-1">
                1.0
              </span>
            </h1>
            <div className="mb-6 mt-2 inline-block">
              <p className="font-display text-base italic leading-none text-gold-400 sm:text-lg">
                The
              </p>
              <p className="bg-gradient-to-r from-gold-400 via-rust-400 to-rust-600 bg-clip-text font-display text-2xl font-extrabold text-transparent sm:text-4xl">
                Praise Gathering
              </p>
              <p className="mt-1 text-sm tracking-wide text-cream-100/60">
                Where praise goes beyond words
              </p>
            </div>

            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <DetailCard label="Artist" value="Gbolahan Sings" />
              <DetailCard label="Date" value="6th Sept, 2026" />
              <DetailCard label="Time" value="3:00 PM" />
              <DetailCard label="Venue" value="Disclosed after registration" span />
              <DetailCard label="Seats" value={`${EVENT_CAPACITY} guests only`} span />
            </div>

            {/* Spots progress */}
            <div className="glass-card mb-8 rounded-2xl p-5">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm text-cream-100/70">Seats confirmed</span>
                <span className="font-display font-bold text-gold-500">
                  {claimed} / {EVENT_CAPACITY}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-500 to-rust-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-cream-100/40">
                {full
                  ? "All seats claimed — thank you for the overwhelming response!"
                  : "Limited seats. Registration closes automatically once we hit capacity."}
              </p>
            </div>

            <p className="text-sm text-cream-100/60">
              For sponsorship enquiries:{" "}
              <a href="tel:+2348081872673" className="text-cream-50 underline-offset-2 hover:underline">
                +234 808 187 2673
              </a>
              ,{" "}
              <a href="tel:+2348152271422" className="text-cream-50 underline-offset-2 hover:underline">
                +234 815 227 1422
              </a>
            </p>
          </div>

          {/* Right: registration form */}
          <div id="register" className="scroll-mt-6 lg:sticky lg:top-14">
            <h2 className="mb-4 font-display text-xl font-bold text-cream-50">
              Reserve your seat
            </h2>
            <RegisterForm full={full} />
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      {!full && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold-500/20 bg-navy-900/85 px-5 py-3 backdrop-blur-md lg:hidden">
          <a
            href="#register"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rust-500 py-3.5 text-base font-semibold text-cream-50 shadow-lg shadow-rust-600/25 active:bg-rust-600"
          >
            Reserve my seat
            <span aria-hidden>↓</span>
          </a>
        </div>
      )}
    </main>
  );
}

function DetailCard({
  label,
  value,
  span,
}: {
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div
      className={`glass-card rounded-xl px-4 py-3 ${
        span ? "col-span-2 sm:col-span-3" : ""
      }`}
    >
      <p className="mb-0.5 text-[11px] uppercase tracking-wider text-cream-100/45">
        {label}
      </p>
      <p className="text-sm font-semibold text-cream-50">{value}</p>
    </div>
  );
}
