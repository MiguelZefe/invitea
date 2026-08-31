"use client";

import { supabase } from "@/lib/supabase";
import { useState, type FormEvent } from "react";

type WeddingRSVPProps = {
  eventSlug: string;
  initialFullName?: string;
  maxGuests?: number;
  guestToken?: string;
  theme?: "wedding" | "baby";
};

export default function WeddingRSVP({
  eventSlug,
  initialFullName,
  maxGuests,
  guestToken,
  theme = "wedding",
}: WeddingRSVPProps) {
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
  const [guestsCount, setGuestsCount] = useState(1);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccess(false);
    setValidationError("");

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

    setLoading(true);

    const { error } = await supabase.rpc("submit_public_rsvp", {
      p_event_slug: eventSlug,
      p_full_name: fullName,
      p_attendance_status: attendanceStatus,
      p_guests_count: guestsCount,
      p_message: message || null,
      p_guest_token: guestToken ?? null,
    });

    setLoading(false);

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

    setSuccess(true);

    setFullName(initialFullName ?? "");
    setAttendanceStatus("");
    setGuestsCount(1);
    setMessage("");
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
            <label className="mb-2 block text-sm font-medium">
              Nombre completo
            </label>

            <input
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
            <label className="mb-2 block text-sm font-medium">
              ¿Asistirás?
            </label>

            <select
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
            <label className="mb-2 block text-sm font-medium">
              Número de asistentes
            </label>

            {guestLimit !== undefined && (
              <p className="mb-3 text-sm text-neutral-600">
                Tu invitación permite hasta {guestLimit}{" "}
                {guestLimit === 1 ? "asistente" : "asistentes"}.
              </p>
            )}

            <input
              type="number"
              min="1"
              max={guestLimit}
              required
              value={guestsCount}
              onChange={(event) => {
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
            <label className="mb-2 block text-sm font-medium">
              {isBabyShower
                ? "Mensaje para el bebé y su familia"
                : "Mensaje para los novios"}
            </label>

            <textarea
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

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-full px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${
              isBabyShower ? "bg-[#746072]" : "bg-black"
            }`}
          >
            {loading
              ? "Enviando..."
              : "Enviar confirmación"}
          </button>

          {validationError && (
            <div
              role="alert"
              className="mt-6 rounded-2xl bg-red-100 px-5 py-4 text-center text-red-800"
            >
              {validationError}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-2xl bg-green-100 px-5 py-4 text-center text-green-800">
              <p className="font-semibold">
                ¡Confirmación enviada correctamente!
              </p>

              <p className="mt-1 text-sm">
                {isBabyShower
                  ? "Gracias por ser parte de este momento tan especial."
                  : "Gracias por confirmar tu asistencia."}
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
