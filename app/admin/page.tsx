"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <main className="min-h-screen bg-hero-gradient flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-2xl p-7 w-full max-w-sm sm:p-8"
      >
        <span className="mb-4 flex w-fit items-center rounded-xl bg-cream-50 px-3 py-1.5 shadow-sm ring-1 ring-gold-500/30">
          <Image
            src="/logo.png"
            alt="Gbolahan Sings logo"
            width={614}
            height={406}
            className="h-7 w-auto"
          />
        </span>
        <p className="uppercase tracking-[0.3em] text-xs text-gold-500 font-semibold mb-1">
          The Praise Gathering
        </p>
        <h1 className="font-display font-bold text-2xl text-cream-50 mb-6">
          Admin sign in
        </h1>

        <label className="block text-xs uppercase tracking-wider text-cream-100/60 mb-1.5">
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
            className="w-full rounded-xl bg-black/25 border border-cream-100/15 focus:border-gold-500 outline-none px-4 py-3 pr-16 text-base text-cream-50"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-2 my-auto h-fit rounded-lg px-2 py-1 text-xs font-semibold text-cream-100/60 hover:text-gold-500"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        {error && (
          <p className="text-rust-400 text-sm bg-rust-500/10 border border-rust-500/30 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rust-500 hover:bg-rust-600 disabled:opacity-60 transition-colors text-cream-50 font-semibold py-3 rounded-xl"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
