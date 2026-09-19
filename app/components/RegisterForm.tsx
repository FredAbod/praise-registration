"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [assembly, setAssembly] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, assembly, district }),
      });
      const data = await res.json();

      if (!res.ok) {
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

  const fieldClass =
    "w-full rounded-xl border border-parchment-100/15 bg-black/25 px-4 py-3.5 text-base text-parchment-50 outline-none transition-colors placeholder:text-parchment-100/30 focus:border-ember-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card space-y-4 rounded-2xl p-6 sm:p-8"
    >
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-parchment-100/60">
          Full name
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-parchment-100/60">
          Assembly
        </label>
        <input
          required
          value={assembly}
          onChange={(e) => setAssembly(e.target.value)}
          placeholder="Your assembly"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-parchment-100/60">
          District
        </label>
        <input
          required
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="Your district"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wider text-parchment-100/60">
          Phone number{" "}
          <span className="normal-case tracking-normal text-parchment-100/40">
            (optional)
          </span>
        </label>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+234..."
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-ember-500/30 bg-ember-500/10 px-3 py-2 text-sm text-ember-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-bark-500 py-3.5 font-semibold text-parchment-50 shadow-lg shadow-black/25 transition-colors hover:bg-bark-600 disabled:opacity-60"
      >
        {loading ? "Registering…" : "Continue to payment"}
      </button>

      <p className="text-center text-xs text-parchment-100/40">
        Next step: transfer ₦500 and upload your payment receipt.
      </p>
    </form>
  );
}
