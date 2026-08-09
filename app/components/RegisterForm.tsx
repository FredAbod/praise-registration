"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm({ full }: { full: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState(full);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.full) setClosed(true);
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      router.push(`/ticket/${data.id}`);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  if (closed) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <p className="font-display font-bold text-lg text-gold-500 mb-1">
          We're fully booked
        </p>
        <p className="text-cream-100/70 text-sm">
          All 50 seats for Praise Unfiltered 1.0 have been claimed. Follow{" "}
          <span className="text-cream-50 font-medium">@Gbolahan_Sings</span>{" "}
          for the livestream link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wider text-cream-100/60 mb-1.5">
          Full name
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className="w-full rounded-xl bg-black/25 border border-cream-100/15 focus:border-gold-500 outline-none px-4 py-3.5 text-base text-cream-50 placeholder:text-cream-100/30 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-cream-100/60 mb-1.5">
          Email address
        </label>
        <input
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl bg-black/25 border border-cream-100/15 focus:border-gold-500 outline-none px-4 py-3.5 text-base text-cream-50 placeholder:text-cream-100/30 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-cream-100/60 mb-1.5">
          Phone number
        </label>
        <input
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234..."
          className="w-full rounded-xl bg-black/25 border border-cream-100/15 focus:border-gold-500 outline-none px-4 py-3.5 text-base text-cream-50 placeholder:text-cream-100/30 transition-colors"
        />
      </div>

      {error && (
        <p className="text-rust-400 text-sm bg-rust-500/10 border border-rust-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-rust-500 hover:bg-rust-600 disabled:opacity-60 transition-colors text-cream-50 font-semibold py-3.5 rounded-xl shadow-lg shadow-rust-600/20"
      >
        {loading ? "Reserving your seat…" : "Reserve my seat"}
      </button>

      <p className="text-center text-xs text-cream-100/40">
        You'll get a QR code ticket right after registering.
      </p>
    </form>
  );
}
