"use client";

import { supabase } from "@/lib/supabase";
import { canWhatsAppBePrimary, encodeWhatsAppMessage, isWhatsAppNumber } from "@/lib/event-whatsapp";
import { useId, useRef, useState, type FormEvent, type MouseEvent } from "react";

type WeddingRSVPProps = {
  eventSlug: string;
  eventTitle?: string;
  whatsappNumber?: string | null;
  whatsappPrimary?: boolean;
  initialFullName?: string;
  maxGuests?: number;
  guestToken?: string;
  theme?: "wedding" | "baby";
};

export default function WeddingRSVP({
  eventSlug,
  eventTitle,
  whatsappNumber,
  whatsappPrimary = false,
  initialFullName,
  maxGuests,
  guestToken,
  theme = "wedding",
}: WeddingRSVPProps) {
  const formId = useId();
  const isBabyShower = theme === "baby";
  const isPersonalizedInvitation = Boolean(guestToken && initialFullName);
  const guestLimit =
    typeof maxGuests === "number" &&
    Number.isInteger(maxGuests) &&
    maxGuests >= 1
      ? maxGuests
      : undefined;

  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [guestCountValue, setGuestsCount] = useState<number | string>(1);
  const guestsCount = Number(guestCountValue);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [success, setSuccess] = useState<{ status: string; count: number } | null>(null);
  const [validationError, setValidationError] = useState("");
  const [whatsappNotice, setWhatsappNotice] = useState("");
  const lastWhatsAppAttempt = useRef<number | null>(null);
  const hasWhatsApp = isWhatsAppNumber(whatsappNumber) && Boolean(eventTitle?.trim());
  const primaryWhatsApp = hasWhatsApp && canWhatsAppBePrimary({
    whatsapp_number: whatsappNumber, whatsapp_primary: whatsappPrimary,
  });

  function openWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    if (!hasWhatsApp || submittingRef.current) return;
    const now = Date.now();
    if (lastWhatsAppAttempt.current !== null && now - lastWhatsAppAttempt.current < 1000) return;
    const form = event.currentTarget.form;
    if (!form) return;
    // A declined WhatsApp response does not require an attendee count. Restore
    // the native field immediately so the separate RSVP flow stays unchanged.
    const countField = form.elements.namedItem(`${formId}-count`) as HTMLInputElement | null;
    const wasDisabled = countField?.disabled ?? false;
    let valid: boolean;
    try {
      if (countField && attendanceStatus === "declined") countField.disabled = true;
      valid = form.reportValidity();
    } finally {
      if (countField) countField.disabled = wasDisabled;
    }
    if (!valid) return;
    if (!fullName.trim() || (attendanceStatus !== "confirmed" && attendanceStatus !== "declined")) {
      setValidationError("Escribe tu nombre y selecciona si asistirás.");
      return;
    }
    if (attendanceStatus === "confirmed" && (!Number.isInteger(guestsCount) || guestsCount < 1 || (guestLimit !== undefined && guestsCount > guestLimit))) {
      setValidationError("Indica una cantidad entera válida dentro de tus pases disponibles.");
      return;
    }
    const text = encodeWhatsAppMessage({
      eventTitle: eventTitle!, fullName, attendanceStatus, guestsCount, message,
    });
    lastWhatsAppAttempt.current = now;
    setValidationError("");
    try {
      const opened = window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank", "noopener,noreferrer");
      setWhatsappNotice(opened
        ? "Abrir WhatsApp no registra tu confirmación en INVITEA. Tú decides si envías el mensaje."
        : "Si WhatsApp no se abrió, tu navegador puede haber bloqueado la pestaña. Puedes usar Enviar confirmación para registrar tu RSVP aquí.");
    } catch {
      setWhatsappNotice("No se pudo abrir WhatsApp. Puedes usar Enviar confirmación para registrar tu RSVP aquí.");
    }
  }

  const whatsappAction = hasWhatsApp ? (
    <div className="my-4">
      <button type="button" onClick={openWhatsApp} disabled={loading}
        aria-describedby={`${formId}-whatsapp-help`}
        className={`w-full rounded-full px-6 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${primaryWhatsApp ? "bg-green-800 text-white" : "border border-green-800 text-green-900"}`}>
        Confirmar por WhatsApp
      </button>
      <p id={`${formId}-whatsapp-help`} className="mt-2 text-sm text-neutral-600">Se abre una pestaña nueva. Las respuestas solo por WhatsApp se gestionan fuera del panel y no forman parte de sus métricas.</p>
    </div>
  ) : null;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submittingRef.current) return;

    setSuccess(null);
    setValidationError("");

    if (!fullName.trim() || !["confirmed", "declined"].includes(attendanceStatus)) {
      setValidationError("Escribe tu nombre y selecciona si asistirás.");
      return;
    }

    if (
      !Number.isInteger(guestsCount) ||
      guestsCount < 1 ||
      (guestLimit !== undefined && guestsCount > guestLimit)
    ) {
      setValidationError(
        guestLimit
          ? `Puedes confirmar un máximo de ${guestLimit} asistentes.`
          : "Indica un número válido de asistentes."
      );
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const { error } = await supabase.rpc("submit_public_rsvp", {
        p_event_slug: eventSlug,
        p_full_name: fullName.trim(),
        p_attendance_status: attendanceStatus,
        p_guests_count: guestsCount,
        p_message: message.trim() || null,
        p_guest_token: guestToken ?? null,
      });

      if (error) {
        console.error("RSVP submission failed", { code: error.code });
        const knownMessage = error.message.includes("guest_limit_exceeded")
          ? `Tu invitación permite un máximo de ${guestLimit ?? 1} asistentes.`
          : error.message.includes("invalid_guest_token")
            ? "Este enlace personalizado ya no es válido."
            : error.message.includes("invalid_attendance_status")
              ? "Selecciona una opción de asistencia válida."
              : error.message.includes("invalid_guests_count")
                ? "Indica un número válido de asistentes."
                : "Ocurrió un error al enviar la confirmación. Intenta nuevamente.";

        setValidationError(knownMessage);
        return;
      }

      setSuccess({ status: attendanceStatus, count: guestsCount });

      setFullName(initialFullName ?? "");
      setAttendanceStatus("");
      setGuestsCount(1);
      setMessage("");
    } catch {
      setValidationError("No pudimos enviar tu respuesta. Revisa tu conexión e intenta nuevamente.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <section
      id="asistencia"
      className={`${isBabyShower ? "bg-[#fffdfb]" : "bg-white"} px-6 py-24`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            {isBabyShower ? "Celebremos juntos" : "RSVP"}
          </p>

          <h2 className="mb-6 text-4xl md:text-6xl">
            {isBabyShower ? "¿Nos acompañas?" : "Confirma tu asistencia"}
          </h2>

          <p className="text-lg text-neutral-600">
            {isBabyShower
              ? "Tu confirmación nos ayudará a preparar una bienvenida llena de cariño."
              : "Ayúdanos a preparar todo para recibirte como mereces."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`rounded-[2rem] p-8 shadow-sm ${
            isBabyShower ? "bg-[#f5eef4]" : "bg-[#f8f1ea]"
          }`}
        >
          <div className="mb-6">
            <label htmlFor={`${formId}-name`} className="mb-2 block text-sm font-medium">
              Nombre completo
            </label>

            <input
              id={`${formId}-name`}
              autoComplete="name"
              maxLength={120}
              type="text"
              required
              value={fullName}
              readOnly={isPersonalizedInvitation}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Ej. Ana Martínez"
              className={`w-full rounded-2xl border border-neutral-200 px-5 py-4 outline-none transition focus:border-black ${
                isPersonalizedInvitation
                  ? "cursor-not-allowed bg-neutral-100 text-neutral-600"
                  : "bg-white"
              }`}
            />

            {isPersonalizedInvitation && (
              <p className="mt-2 text-sm text-neutral-500">
                El nombre está vinculado a este enlace personal.
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor={`${formId}-attendance`} className="mb-2 block text-sm font-medium">
              ¿Asistirás?
            </label>

            <select
              id={`${formId}-attendance`}
              required
              value={attendanceStatus}
              onChange={(event) =>
                setAttendanceStatus(event.target.value)
              }
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            >
              <option value="">
                Selecciona una opción
              </option>

              <option value="confirmed">
                Sí, asistiré
              </option>

              <option value="declined">
                No podré asistir
              </option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor={`${formId}-count`} className="mb-2 block text-sm font-medium">
              Número de asistentes
            </label>

            {guestLimit !== undefined && (
              <p className="mb-3 text-sm text-neutral-600">
                Tu invitación permite hasta {guestLimit}{" "}
                {guestLimit === 1 ? "asistente" : "asistentes"}.
              </p>
            )}

            <input
              id={`${formId}-count`}
              type="number"
              min="1"
              max={guestLimit}
              required
              value={guestCountValue}
              onChange={(event) => {
                if (hasWhatsApp) {
                  setGuestsCount(event.target.value);
                  return;
                }
                const nextValue = Number(event.target.value);
                setGuestsCount(
                  guestLimit === undefined
                    ? nextValue
                    : Math.min(nextValue, guestLimit)
                );
              }}
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          <div className="mb-8">
            <label htmlFor={`${formId}-message`} className="mb-2 block text-sm font-medium">
              {isBabyShower
                ? "Mensaje para el bebé y su familia"
                : "Mensaje para los novios"}
            </label>

            <textarea
              id={`${formId}-message`}
              maxLength={2000}
              rows={5}
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder={
                isBabyShower
                  ? "Escribe un deseo lleno de cariño..."
                  : "Escribe un mensaje especial..."
              }
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          {primaryWhatsApp && whatsappAction}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-full px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
              primaryWhatsApp ? "bg-neutral-600" : isBabyShower ? "bg-[#746072]" : "bg-black"
            }`}
          >
            {loading
              ? "Enviando..."
              : "Enviar confirmación"}
          </button>

          {!primaryWhatsApp && whatsappAction}
          {whatsappNotice && <p role="status" className="mt-4 text-sm text-neutral-700">{whatsappNotice}</p>}

          {validationError && (
            <div
              role="alert"
              className="mt-6 rounded-2xl bg-red-100 px-5 py-4 text-center text-red-800"
            >
              {validationError}
            </div>
          )}

          {success && (
            <div role="status" aria-live="polite" className="mt-6 rounded-2xl bg-green-100 px-5 py-4 text-center text-green-800">
              <p className="font-semibold">
                {success.status === "confirmed" ? "¡Tu asistencia está confirmada!" : "Gracias por avisarnos"}
              </p>

              <p className="mt-1 text-sm">
                {success.status === "confirmed"
                  ? `Te esperamos. Confirmaste ${success.count} ${success.count === 1 ? "asistente" : "asistentes"}, incluyéndote.`
                  : "Registramos que no podrás asistir. Gracias por compartir tu respuesta."}
              </p>
            </div>
          )}
        </form>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </div>
    </section>
  );
}
