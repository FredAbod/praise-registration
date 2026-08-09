import Image from "next/image";
import { supabaseAdmin, EVENT_CAPACITY } from "@/lib/supabase";
import RegistrantTable from "./RegistrantTable";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = supabaseAdmin();
  const { data: registrations, error } = await supabase
    .from("registrations")
    .select("id, name, email, phone, status, created_at")
    .order("created_at", { ascending: false });

  const accepted = (registrations || []).filter(
    (r) => r.status === "accepted"
  ).length;
  const pending = (registrations || []).filter(
    (r) => r.status === "pending"
  ).length;
  const rejected = (registrations || []).filter(
    (r) => r.status === "rejected"
  ).length;

  return (
    <main className="min-h-screen bg-hero-gradient px-4 py-8 sm:px-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="hidden w-fit items-center rounded-xl bg-cream-50 px-2.5 py-1.5 shadow-sm ring-1 ring-gold-500/30 sm:flex">
              <Image
                src="/logo.png"
                alt="Gbolahan Sings logo"
                width={614}
                height={406}
                className="h-8 w-auto"
              />
            </span>
            <div>
              <p className="uppercase tracking-[0.25em] text-[10px] text-gold-500 font-semibold mb-1 sm:text-xs sm:tracking-[0.3em]">
                The Praise Gathering — Admin
              </p>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-cream-50">
                Registrations
              </h1>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Confirmed" value={`${accepted} / ${EVENT_CAPACITY}`} accent="text-emerald-400" />
          <StatCard label="Pending" value={String(pending)} accent="text-gold-500" />
          <StatCard label="Not approved" value={String(rejected)} accent="text-rust-400" />
          <StatCard label="Total registered" value={String(registrations?.length || 0)} accent="text-cream-50" />
        </div>

        {error && (
          <p className="text-rust-400 bg-rust-500/10 border border-rust-500/30 rounded-lg px-4 py-3 mb-6">
            Couldn&apos;t load registrations: {error.message}
          </p>
        )}

        <RegistrantTable
          initialRegistrations={registrations || []}
          capacity={EVENT_CAPACITY}
          accepted={accepted}
        />
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
      <p className="text-[11px] uppercase tracking-wider text-cream-100/45 mb-0.5">
        {label}
      </p>
      <p className={`font-display font-bold text-xl ${accent}`}>{value}</p>
    </div>
  );
}
