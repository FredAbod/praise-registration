"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReceiptUpload({
  registrationId,
  existingUrl,
}: {
  registrationId: string;
  existingUrl?: string | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function onFileChange(f: File | null) {
    setFile(f);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a screenshot of your transfer first.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("receipt", file);
      const res = await fetch(`/api/ticket/${registrationId}/receipt`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-3 text-left">
      {existingUrl && (
        <a
          href={existingUrl}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden rounded-xl border border-bark-400/40"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingUrl}
            alt="Uploaded receipt"
            className="max-h-48 w-full object-contain bg-black/30"
          />
        </a>
      )}

      <label className="block text-xs uppercase tracking-wider text-parchment-100/60">
        {existingUrl ? "Replace receipt" : "Upload payment receipt"}
      </label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        className="w-full text-sm text-parchment-100/70 file:mr-3 file:rounded-lg file:border-0 file:bg-bark-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-parchment-50"
      />

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Preview"
          className="max-h-40 rounded-lg border border-parchment-100/15 object-contain"
        />
      )}

      {error && (
        <p className="rounded-lg border border-ember-500/30 bg-ember-500/10 px-3 py-2 text-sm text-ember-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full rounded-xl bg-bark-500 py-3 font-semibold text-parchment-50 transition-colors hover:bg-bark-600 disabled:opacity-50"
      >
        {loading
          ? "Uploading…"
          : existingUrl
            ? "Upload new receipt"
            : "Submit receipt"}
      </button>
    </form>
  );
}
