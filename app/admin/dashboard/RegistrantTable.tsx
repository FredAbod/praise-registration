"use client";

import { useEffect, useMemo, useState } from "react";
import type { RegistrationStatus } from "@/lib/event";

type Registration = {
  id: string;
  name: string;
  phone: string | null;
  assembly: string;
  district: string;
  status: RegistrationStatus;
  receipt_url: string | null;
  created_at: string;
  receipt_uploaded_at?: string | null;
  confirmed_at?: string | null;
};

const TABS: { key: "all" | RegistrationStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "awaiting_review", label: "Awaiting review" },
  { key: "pending_payment", label: "Pending payment" },
  { key: "confirmed", label: "Confirmed" },
  { key: "rejected", label: "Rejected" },
];

export default function RegistrantTable({
  initialRegistrations,
}: {
  initialRegistrations: Registration[];
}) {
  const [rows, setRows] = useState(initialRegistrations);
  const [tab, setTab] = useState<"all" | RegistrationStatus>("awaiting_review");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.assembly.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          (r.phone || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, tab, query]);

  async function updateStatus(id: string, status: RegistrationStatus) {
    setBusyId(id);
    setErrorMsg(null);
    const previous = rows;

    setRows((r) => r.map((row) => (row.id === id ? { ...row, status } : row)));

    const res = await fetch("/api/admin/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      const data = await res.json();
      setRows(previous);
      setErrorMsg(data.error || "Couldn't update this registrant.");
    }

    setBusyId(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                tab === t.key
                  ? "border-ember-400 bg-ember-400 text-ink-950 font-semibold"
                  : "border-parchment-100/20 text-parchment-100/70 hover:border-parchment-100/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, assembly, district…"
          className="w-full rounded-full border border-parchment-100/15 bg-black/25 px-4 py-2 text-sm text-parchment-50 outline-none placeholder:text-parchment-100/30 focus:border-ember-400 sm:w-64"
        />
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-lg border border-ember-500/30 bg-ember-500/10 px-4 py-2.5 text-sm text-ember-400">
          {errorMsg}
        </p>
      )}

      <div className="space-y-3 sm:hidden">
        {filtered.length === 0 && (
          <div className="glass-card rounded-2xl px-4 py-8 text-center text-parchment-100/40">
            No registrants here yet.
          </div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="glass-card rounded-2xl p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-parchment-50">{r.name}</p>
                <p className="truncate text-sm text-parchment-100/70">
                  {r.assembly} · {r.district}
                </p>
                {r.phone && (
                  <p className="text-xs text-parchment-100/45">{r.phone}</p>
                )}
              </div>
              <StatusPill status={r.status} />
            </div>
            {r.receipt_url && (
              <a
                href={r.receipt_url}
                target="_blank"
                rel="noreferrer"
                className="mb-3 block overflow-hidden rounded-lg border border-bark-400/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.receipt_url}
                  alt={`Receipt for ${r.name}`}
                  className="max-h-40 w-full object-contain bg-black/30"
                />
              </a>
            )}
            <div className="mb-3 text-xs text-parchment-100/40">
              <LocalDate value={r.created_at} />
            </div>
            <ActionButtons
              row={r}
              busy={busyId === r.id}
              onUpdate={updateStatus}
              full
            />
          </div>
        ))}
      </div>

      <div className="glass-card hidden overflow-hidden rounded-2xl sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-parchment-100/10 text-left text-xs uppercase tracking-wider text-parchment-100/45">
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Assembly / District</th>
                <th className="px-5 py-3 font-medium">Receipt</th>
                <th className="px-5 py-3 font-medium">Registered</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-parchment-100/40"
                  >
                    No registrants here yet.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-parchment-100/5 last:border-0"
                >
                  <td className="px-5 py-3.5 font-medium text-parchment-50">
                    <div>{r.name}</div>
                    {r.phone && (
                      <div className="text-xs text-parchment-100/45">{r.phone}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-parchment-100/70">
                    <div>{r.assembly}</div>
                    <div className="text-xs text-parchment-100/45">{r.district}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    {r.receipt_url ? (
                      <a
                        href={r.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block overflow-hidden rounded-lg border border-bark-400/40"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.receipt_url}
                          alt=""
                          className="h-14 w-14 object-cover"
                        />
                      </a>
                    ) : (
                      <span className="text-xs text-parchment-100/35">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-parchment-100/50">
                    <LocalDate value={r.created_at} />
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <ActionButtons
                      row={r}
                      busy={busyId === r.id}
                      onUpdate={updateStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActionButtons({
  row,
  busy,
  onUpdate,
  full,
}: {
  row: Registration;
  busy: boolean;
  onUpdate: (id: string, status: RegistrationStatus) => void;
  full?: boolean;
}) {
  return (
    <div className={`flex gap-2 ${full ? "" : "justify-end"}`}>
      <button
        disabled={busy || row.status === "confirmed"}
        onClick={() => onUpdate(row.id, "confirmed")}
        className={`rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/25 disabled:opacity-40 ${
          full ? "flex-1" : ""
        }`}
      >
        Confirm payment
      </button>
      <button
        disabled={busy || row.status === "rejected"}
        onClick={() => onUpdate(row.id, "rejected")}
        className={`rounded-full border border-red-500/30 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/25 disabled:opacity-40 ${
          full ? "flex-1" : ""
        }`}
      >
        Reject
      </button>
    </div>
  );
}

function LocalDate({ value }: { value: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(new Date(value).toLocaleString());
  }, [value]);
  return <span suppressHydrationWarning>{text}</span>;
}

function StatusPill({ status }: { status: RegistrationStatus }) {
  const map: Record<RegistrationStatus, string> = {
    pending_payment: "text-ember-400 border-ember-400/40 bg-ember-400/10",
    awaiting_review:
      "text-parchment-200 border-parchment-200/40 bg-parchment-200/10",
    confirmed: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
    rejected: "text-red-400 border-red-400/40 bg-red-400/10",
  };
  const labels: Record<RegistrationStatus, string> = {
    pending_payment: "Pending payment",
    awaiting_review: "Awaiting review",
    confirmed: "Confirmed",
    rejected: "Rejected",
  };
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${map[status]}`}
    >
      {labels[status]}
    </span>
  );
}
