"use client";

import { createClient } from "@/lib/supabase-browser";
import { FormEvent, useState } from "react";

export default function RecoveryPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestFinished, setRequestFinished] = useState(false);

  const handleRecovery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/restablecer-password`,
    });

    setLoading(false);
    setRequestFinished(true);
  };

  if (requestFinished) {
    return (
      <div
        className="rounded-[2rem] bg-[#f8f5f2] px-6 py-8 text-center"
        role="status"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-black text-xl text-white">
          ✓
        </div>
        <h2 className="mt-5 text-2xl">Revisa tu correo</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Si existe una cuenta asociada a ese correo, recibirás un enlace para
          restablecer tu contraseña.
        </p>
        <p className="mt-4 text-xs text-neutral-500">
          Revisa también tu carpeta de correo no deseado.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRecovery}>
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium" htmlFor="recovery-email">
          Correo electrónico
        </label>
        <input
          id="recovery-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="correo@ejemplo.com"
          className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Enviar instrucciones"}
      </button>
    </form>
  );
}
