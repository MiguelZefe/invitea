"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
    >
      Cerrar sesión
    </button>
  );
}