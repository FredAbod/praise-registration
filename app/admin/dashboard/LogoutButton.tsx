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
      className="text-sm text-cream-100/60 hover:text-cream-50 border border-cream-100/20 hover:border-cream-100/40 rounded-full px-4 py-2 transition-colors"
    >
      Sign out
    </button>
  );
}
