"use client";

import { useState } from "react";

export default function DownloadQrButton({
  qrDataUrl,
  fileName,
}: {
  qrDataUrl: string;
  fileName: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const blob = await (await fetch(qrDataUrl)).blob();
      const file = new File([blob], fileName, { type: "image/png" });

      // On mobile, the <a download> attribute is unreliable (iOS Safari
      // ignores it). The Web Share API opens the native sheet so the user
      // can "Save Image" to their photos or share it.
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
      };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({
          files: [file],
          title: "Praise Unfiltered ticket",
        });
        return;
      }

      // Desktop / browsers without file sharing: real download via blob URL.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // User cancelled the share sheet, or something went wrong — open the
      // image in a new tab so they can long-press to save it.
      window.open(qrDataUrl, "_blank");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-gold-500/60 bg-gold-500/10 px-5 py-2 text-sm font-semibold text-gold-500 transition-colors hover:bg-gold-500/20 disabled:opacity-60"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {busy ? "Preparing…" : "Save QR code"}
    </button>
  );
}
