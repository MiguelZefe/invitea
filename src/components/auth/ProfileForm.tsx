"use client";

import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ProfileFormProps = {
  initialName: string;
  email: string;
};

export default function ProfileForm({ initialName, email }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const normalizedName = fullName.trim();

    if (!normalizedName) {
      setErrorMessage("El nombre es obligatorio.");
      return;
    }

    if (normalizedName.length > 100) {
      setErrorMessage("El nombre no puede superar los 100 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: normalizedName },
    });

    setLoading(false);

    if (error) {
      setErrorMessage("No pudimos actualizar tu nombre. Intenta de nuevo.");
      return;
    }

    setFullName(normalizedName);
    setSuccessMessage("Tu nombre se actualizó correctamente.");
    router.refresh();
  };

  const inputClassName =
    "w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black";

  return (
    <form onSubmit={handleProfileUpdate}>
      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium" htmlFor="account-name">
          Nombre
        </label>
        <input
          id="account-name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium" htmlFor="account-email">
          Correo electrónico
        </label>
        <input
          id="account-email"
          type="email"
          readOnly
          value={email}
          className="w-full cursor-not-allowed rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-neutral-500 outline-none"
        />
        <p className="mt-2 text-xs text-neutral-500">
          El correo no se puede modificar por ahora.
        </p>
      </div>

      {errorMessage && (
        <p className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="mb-5 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar nombre"}
      </button>
    </form>
  );
}
