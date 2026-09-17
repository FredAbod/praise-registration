"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-parchment-100/20 px-4 py-2 text-sm text-parchment-100/60 transition-colors hover:border-parchment-100/40 hover:text-parchment-50"
    >
      Sign out
    </button>
  );
}
