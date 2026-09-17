import Image from "next/image";
import RegisterForm from "@/app/components/RegisterForm";
import { EVENT, formatNaira, paymentDetails } from "@/lib/event";

export const dynamic = "force-dynamic";

export default function Home() {
  const pay = paymentDetails();

  return (
    <main className="min-h-screen bg-hero-gradient">
      <div className="mx-auto w-full max-w-5xl px-5 pb-28 pt-6 sm:px-6 sm:py-14 lg:pb-14">
        <div className="mb-8 flex flex-col gap-2 sm:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-parchment-200/70 sm:text-xs">
            {EVENT.org}
          </p>
          <p className="text-sm text-parchment-100/65">{EVENT.orgLine}</p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div>
            <div className="relative mx-auto mb-8 max-w-md overflow-hidden rounded-2xl border border-bark-400/40 shadow-2xl shadow-black/50">
              <Image
                src="/flyer.jpg"
                alt={`${EVENT.title} — ${EVENT.theme}`}
                width={1080}
                height={1620}
                priority
                sizes="(max-width: 1024px) 92vw, 480px"
                className="h-auto w-full"
              />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-ember-400">
              {EVENT.orgLine}
            </p>
            <h1 className="mb-3 font-display text-4xl font-bold leading-[1.05] text-parchment-50 sm:text-5xl">
              {EVENT.title}
            </h1>
            <p className="mb-1 font-display text-xl italic text-parchment-200 sm:text-2xl">
              {EVENT.theme}
            </p>
            <p className="mb-8 text-sm text-parchment-100/55">{EVENT.scripture}</p>

            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              <DetailCard label="Dates" value={EVENT.datesShort} />
              <DetailCard label="Fee" value={formatNaira(pay.amountNgn)} />
              <DetailCard label="Arrive" value="1pm Friday" />
              <DetailCard label="Venue" value={EVENT.venue} span />
            </div>

            <div className="surface-card mb-6 rounded-2xl p-5">
              <p className="mb-1 text-xs uppercase tracking-wider text-parchment-100/45">
                Registration fee
              </p>
              <p className="font-display text-2xl font-bold text-ember-400">
                {formatNaira(pay.amountNgn)}
              </p>
              <p className="mt-2 text-sm text-parchment-100/65">
                After you register, you&apos;ll transfer to{" "}
                <span className="text-parchment-50">{pay.bank}</span> and upload
                your receipt. Your ticket QR unlocks once payment is confirmed.
              </p>
            </div>
          </div>

          <div id="register" className="scroll-mt-6 lg:sticky lg:top-14">
            <h2 className="mb-4 font-display text-xl font-bold text-parchment-50">
              Register for the retreat
            </h2>
            <RegisterForm />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-bark-400/30 bg-ink-950/90 px-5 py-3 backdrop-blur-md lg:hidden">
        <a
          href="#register"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-bark-500 py-3.5 text-base font-semibold text-parchment-50 shadow-lg shadow-black/30 active:bg-bark-600"
        >
          Register now
          <span aria-hidden>↓</span>
        </a>
      </div>
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
      <p className="mb-0.5 text-[11px] uppercase tracking-wider text-parchment-100/45">
        {label}
      </p>
      <p className="text-sm font-semibold text-parchment-50">{value}</p>
    </div>
  );
}
