"use client";

import { buildSignupConfirmationRedirect } from "@/lib/auth-origin";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function getRegistrationError(message: string, code?: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    code === "user_already_exists" ||
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already exists")
  ) {
    return "Este correo ya está registrado. Intenta iniciar sesión.";
  }

  if (
    normalizedMessage.includes("password") &&
    (normalizedMessage.includes("short") ||
      normalizedMessage.includes("least") ||
      normalizedMessage.includes("characters"))
  ) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }

  if (
    code === "over_email_send_rate_limit" ||
    normalizedMessage.includes("rate limit")
  ) {
    return "Se hicieron demasiados intentos. Espera unos minutos y vuelve a intentar.";
  }

  return "No pudimos crear tu cuenta. Intenta de nuevo en unos momentos.";
}

type RegisterFormProps = {
  nextPath?: "/dashboard/nueva";
};

export default function RegisterForm({ nextPath }: RegisterFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationPending, setConfirmationPending] = useState(false);

  const handleRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    const normalizedName = fullName.trim();

    if (!normalizedName) {
      setErrorMessage("Escribe tu nombre para continuar.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: normalizedName },
        emailRedirectTo: buildSignupConfirmationRedirect(
          window.location.origin,
          nextPath
        ),
      },
    });

    setLoading(false);

    if (error) {
      console.error("Supabase signUp failed", {
        code: error.code,
        status: error.status,
        message: error.message,
      });
      setErrorMessage(getRegistrationError(error.message, error.code));
      return;
    }

    if (data.session) {
      router.push(nextPath ?? "/dashboard");
      router.refresh();
      return;
    }

    setConfirmationPending(true);
  };

  if (confirmationPending) {
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
          Enviamos un enlace de confirmación a <strong>{email.trim()}</strong>.
          Ábrelo para activar tu cuenta y entrar a tu dashboard.
        </p>
        <p className="mt-4 text-xs text-neutral-500">
          Si no lo encuentras, revisa tu carpeta de correo no deseado.
        </p>
      </div>
    );
  }

  const inputClassName =
    "w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black";

  return (
    <form onSubmit={handleRegistration}>
      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium" htmlFor="full-name">
          Nombre
        </label>
        <input
          id="full-name"
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Tu nombre"
          className={inputClassName}
        />
      </div>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium" htmlFor="email">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="correo@ejemplo.com"
          className={inputClassName}
        />
      </div>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          className={inputClassName}
        />
      </div>

      <div className="mb-6">
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="password-confirmation"
        >
          Confirmar contraseña
        </label>
        <input
          id="password-confirmation"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          placeholder="Repite tu contraseña"
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
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
