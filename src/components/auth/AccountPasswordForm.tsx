"use client";

import { createClient } from "@/lib/supabase-browser";
import { FormEvent, useState } from "react";

function getPasswordError(code?: string) {
  switch (code) {
    case "reauthentication_not_valid":
      return "El código de verificación no es válido. Revisa el correo e inténtalo de nuevo.";
    case "otp_expired":
      return "El código de verificación expiró. Solicita uno nuevo.";
    case "weak_password":
      return "La contraseña no cumple los requisitos de seguridad de la cuenta.";
    case "same_password":
      return "La contraseña nueva debe ser diferente de la contraseña actual.";
    default:
      return "No pudimos actualizar tu contraseña. Intenta de nuevo.";
  }
}

export default function AccountPasswordForm() {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [nonce, setNonce] = useState("");
  const [reauthenticationRequired, setReauthenticationRequired] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const clearSensitiveFields = () => {
    setNewPassword("");
    setPasswordConfirmation("");
    setNonce("");
  };

  const requestReauthentication = async () => {
    const { error } = await supabase.auth.reauthenticate();

    if (error) {
      setErrorMessage(
        "No pudimos enviar el código de verificación. Espera un momento e intenta de nuevo."
      );
      return false;
    }

    setReauthenticationRequired(true);
    setSuccessMessage(
      "Enviamos un código de verificación a tu correo. Escríbelo para confirmar el cambio."
    );
    return true;
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== passwordConfirmation) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    if (reauthenticationRequired && !nonce.trim()) {
      setErrorMessage("Escribe el código de verificación recibido por correo.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      ...(reauthenticationRequired ? { nonce: nonce.trim() } : {}),
    });

    if (error?.code === "reauthentication_needed") {
      await requestReauthentication();
      setLoading(false);
      return;
    }

    setLoading(false);

    if (error) {
      setErrorMessage(getPasswordError(error.code));
      return;
    }

    clearSensitiveFields();
    setReauthenticationRequired(false);
    setSuccessMessage("Tu contraseña se actualizó correctamente.");
  };

  const handleResendCode = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    await requestReauthentication();
    setLoading(false);
  };

  const inputClassName =
    "w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black";

  return (
    <form onSubmit={handlePasswordUpdate}>
      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium" htmlFor="account-new-password">
          Contraseña nueva
        </label>
        <input
          id="account-new-password"
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

      <div className="mb-5">
        <label
          className="mb-2 block text-sm font-medium"
          htmlFor="account-password-confirmation"
        >
          Confirmar contraseña
        </label>
        <input
          id="account-password-confirmation"
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

      {reauthenticationRequired && (
        <div className="mb-6 rounded-2xl bg-[#f8f5f2] p-5">
          <label className="mb-2 block text-sm font-medium" htmlFor="account-nonce">
            Código de verificación
          </label>
          <input
            id="account-nonce"
            type="text"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            value={nonce}
            onChange={(event) => setNonce(event.target.value)}
            placeholder="Código recibido por correo"
            className={inputClassName}
          />
          <button
            type="button"
            disabled={loading}
            onClick={handleResendCode}
            className="mt-3 text-sm font-medium underline-offset-4 hover:underline disabled:opacity-50"
          >
            Enviar otro código
          </button>
        </div>
      )}

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
        {loading ? "Actualizando..." : "Actualizar contraseña"}
      </button>
    </form>
  );
}
