"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EVENT } from "@/lib/event";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-gradient px-6">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-sm rounded-2xl p-7 sm:p-8"
      >
        <div className="mb-4 max-w-[100px] overflow-hidden rounded-xl border border-bark-400/40">
          <Image
            src="/flyer.jpg"
            alt={EVENT.title}
            width={200}
            height={280}
            className="h-auto w-full"
          />
        </div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-ember-400">
          {EVENT.title} — Admin
        </p>
        <h1 className="mb-6 font-display text-2xl font-bold text-parchment-50">
          Admin sign in
        </h1>

        <label className="mb-1.5 block text-xs uppercase tracking-wider text-parchment-100/60">
          Admin password
        </label>
        <div className="relative mb-4">
          <input
            required
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-xl border border-parchment-100/15 bg-black/25 px-4 py-3 pr-16 text-base text-parchment-50 outline-none focus:border-ember-400"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-2 my-auto h-fit rounded-lg px-2 py-1 text-xs font-semibold text-parchment-100/60 hover:text-ember-400"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-ember-500/30 bg-ember-500/10 px-3 py-2 text-sm text-ember-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-bark-500 py-3 font-semibold text-parchment-50 transition-colors hover:bg-bark-600 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
