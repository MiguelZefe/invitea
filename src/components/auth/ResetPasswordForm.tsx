"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== passwordConfirmation) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(
        "No pudimos actualizar tu contraseña. El enlace puede haber expirado; solicita uno nuevo."
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const inputClassName =
    "w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black";

  return (
    <form onSubmit={handlePasswordUpdate}>
      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium" htmlFor="new-password">
          Contraseña nueva
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          className={inputClassName}
        />
      </div>

      <div className="mb-6">
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="new-password-confirmation"
        >
          Confirmar contraseña
        </label>
        <input
          id="new-password-confirmation"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder="Repite tu contraseña nueva"
          className={inputClassName}
        />
      </div>

      {errorMessage && (
        <p
          className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Actualizando..." : "Guardar contraseña"}
      </button>
    </form>
  );
}
