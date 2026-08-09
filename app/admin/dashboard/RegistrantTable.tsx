"use client";

import { useMemo, useState } from "react";

type Registration = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

const TABS: { key: "all" | Registration["status"]; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Confirmed" },
  { key: "rejected", label: "Not approved" },
];

export default function RegistrantTable({
  initialRegistrations,
  capacity,
  accepted,
}: {
  initialRegistrations: Registration[];
  capacity: number;
  accepted: number;
}) {
  const [rows, setRows] = useState(initialRegistrations);
  const [tab, setTab] = useState<"all" | Registration["status"]>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [acceptedCount, setAcceptedCount] = useState(accepted);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, tab, query]);

  async function updateStatus(id: string, status: Registration["status"]) {
    setBusyId(id);
    setErrorMsg(null);
    const previous = rows;
    const prevRow = rows.find((r) => r.id === id);

    // optimistic update
    setRows((r) => r.map((row) => (row.id === id ? { ...row, status } : row)));
    if (status === "accepted" && prevRow?.status !== "accepted") {
      setAcceptedCount((c) => c + 1);
    } else if (prevRow?.status === "accepted" && status !== "accepted") {
      setAcceptedCount((c) => Math.max(c - 1, 0));
    }

    const res = await fetch("/api/admin/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!res.ok) {
      const data = await res.json();
      setRows(previous);
      setAcceptedCount(accepted);
      setErrorMsg(data.error || "Couldn't update this registrant.");
    }

    setBusyId(null);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-3.5 py-1.5 rounded-full border transition-colors ${
                tab === t.key
                  ? "bg-gold-500 text-navy-900 border-gold-500 font-semibold"
                  : "border-cream-100/20 text-cream-100/70 hover:border-cream-100/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, phone…"
          className="rounded-full bg-black/25 border border-cream-100/15 focus:border-gold-500 outline-none px-4 py-2 text-sm text-cream-50 placeholder:text-cream-100/30 w-full sm:w-64"
        />
      </div>

      {errorMsg && (
        <p className="text-rust-400 bg-rust-500/10 border border-rust-500/30 rounded-lg px-4 py-2.5 mb-4 text-sm">
          {errorMsg}
        </p>
      )}

      {acceptedCount >= capacity && (
        <p className="text-gold-500 bg-gold-500/10 border border-gold-500/30 rounded-lg px-4 py-2.5 mb-4 text-sm">
          All {capacity} seats are confirmed. Registration is closed for new guests.
        </p>
      )}

      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {filtered.length === 0 && (
          <div className="glass-card rounded-2xl px-4 py-8 text-center text-cream-100/40">
            No registrants here yet.
          </div>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="glass-card rounded-2xl p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-cream-50">{r.name}</p>
                <p className="truncate text-sm text-cream-100/70">{r.email}</p>
                <p className="text-xs text-cream-100/45">{r.phone}</p>
              </div>
              <StatusPill status={r.status} />
            </div>
            <div className="mb-3 text-xs text-cream-100/40">
              {new Date(r.created_at).toLocaleString()}
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

      {/* Desktop: table */}
      <div className="glass-card hidden overflow-hidden rounded-2xl sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-cream-100/45 text-xs uppercase tracking-wider border-b border-cream-100/10">
                <th className="px-5 py-3 font-medium">Guest</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Registered</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-cream-100/40">
                    No registrants here yet.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-cream-100/5 last:border-0">
                  <td className="px-5 py-3.5 text-cream-50 font-medium">{r.name}</td>
                  <td className="px-5 py-3.5 text-cream-100/70">
                    <div>{r.email}</div>
                    <div className="text-xs text-cream-100/45">{r.phone}</div>
                  </td>
                  <td className="px-5 py-3.5 text-cream-100/50 text-xs">
                    {new Date(r.created_at).toLocaleString()}
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
  onUpdate: (id: string, status: Registration["status"]) => void;
  full?: boolean;
}) {
  return (
    <div className={`flex gap-2 ${full ? "" : "justify-end"}`}>
      <button
        disabled={busy || row.status === "accepted"}
        onClick={() => onUpdate(row.id, "accepted")}
        className={`text-xs font-semibold px-3 py-2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors ${
          full ? "flex-1" : ""
        }`}
      >
        Accept
      </button>
      <button
        disabled={busy || row.status === "rejected"}
        onClick={() => onUpdate(row.id, "rejected")}
        className={`text-xs font-semibold px-3 py-2 rounded-full bg-rust-500/15 text-rust-400 border border-rust-500/30 hover:bg-rust-500/25 disabled:opacity-40 transition-colors ${
          full ? "flex-1" : ""
        }`}
      >
        Reject
      </button>
    </div>
  );
}

function StatusPill({ status }: { status: Registration["status"] }) {
  const map = {
    pending: "text-gold-500 border-gold-500/40 bg-gold-500/10",
    accepted: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
    rejected: "text-rust-400 border-rust-400/40 bg-rust-400/10",
  };
  const labels = { pending: "Pending", accepted: "Confirmed", rejected: "Not approved" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status]}`}>
      {labels[status]}
    </span>
  );
}
