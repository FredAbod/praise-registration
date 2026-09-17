import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase";
import { EVENT } from "@/lib/event";
import RegistrantTable from "./RegistrantTable";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = supabaseAdmin();
  const { data: registrations, error } = await supabase
    .from("registrations")
    .select(
      "id, name, email, phone, status, receipt_url, created_at, receipt_uploaded_at, confirmed_at"
    )
    .order("created_at", { ascending: false });

  const rows = registrations || [];
  const pendingPayment = rows.filter((r) => r.status === "pending_payment").length;
  const awaitingReview = rows.filter((r) => r.status === "awaiting_review").length;
  const confirmed = rows.filter((r) => r.status === "confirmed").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;

  return (
    <main className="min-h-screen bg-hero-gradient px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="hidden overflow-hidden rounded-xl border border-bark-400/40 sm:block sm:w-14">
              <Image
                src="/flyer.jpg"
                alt={EVENT.title}
                width={112}
                height={160}
                className="h-auto w-full"
              />
            </span>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-ember-400 sm:text-xs sm:tracking-[0.3em]">
                {EVENT.title} — Admin
              </p>
              <h1 className="font-display text-2xl font-bold text-parchment-50 sm:text-3xl">
                Registrations
              </h1>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard label="Awaiting review" value={String(awaitingReview)} accent="text-parchment-200" />
          <StatCard label="Pending payment" value={String(pendingPayment)} accent="text-ember-400" />
          <StatCard label="Confirmed" value={String(confirmed)} accent="text-emerald-400" />
          <StatCard label="Rejected" value={String(rejected)} accent="text-red-400" />
          <StatCard label="Total" value={String(rows.length)} accent="text-parchment-50" />
        </div>

        {error && (
          <p className="mb-6 rounded-lg border border-ember-500/30 bg-ember-500/10 px-4 py-3 text-ember-400">
            Couldn&apos;t load registrations: {error.message}
          </p>
        )}

        <RegistrantTable initialRegistrations={rows} />
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="glass-card rounded-xl px-4 py-3">
      <p className="mb-0.5 text-[11px] uppercase tracking-wider text-parchment-100/45">
        {label}
      </p>
      <p className={`font-display text-xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
