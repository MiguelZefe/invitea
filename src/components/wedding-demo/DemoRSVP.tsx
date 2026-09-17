"use client";

import { useState, type FormEvent, type MouseEvent } from "react";

const MIN_DEMO_GUESTS = 1;
const MAX_DEMO_GUESTS = 6;

function normalizeDemoGuestsCount(value: string): string {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return String(MIN_DEMO_GUESTS);
  }

  return String(Math.min(MAX_DEMO_GUESTS, Math.max(MIN_DEMO_GUESTS, Math.trunc(parsedValue))));
}

type DemoRSVPProps = {
  theme?: "wedding" | "baby";
};

export default function DemoRSVP({ theme = "wedding" }: DemoRSVPProps) {
  const isBabyShower = theme === "baby";
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [guestsCount, setGuestsCount] = useState(String(MIN_DEMO_GUESTS));
  const [message, setMessage] = useState("");
  const [showDemoConfirmation, setShowDemoConfirmation] = useState(false);

  function handleWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    if (!isBabyShower) return;
    const form = event.currentTarget.form;
    if (!form?.reportValidity()) return;
    if (attendanceStatus !== "confirmed" && attendanceStatus !== "declined") {
      form.querySelector<HTMLSelectElement>("#demo-attendance")?.focus();
      return;
    }
    const count = Number(guestsCount);
    if (attendanceStatus === "confirmed" && (
      !guestsCount.trim() || !Number.isInteger(count) ||
      count < MIN_DEMO_GUESTS || count > MAX_DEMO_GUESTS
    )) {
      form.querySelector<HTMLInputElement>("#demo-guests")?.focus();
      return;
    }
    const whatsappMessage = [
      "Evento: Baby shower de Liam Alejandro",
      attendanceStatus === "confirmed" ? "Asistencia: Asistiré." : "Asistencia: No podré asistir.",
      attendanceStatus === "confirmed" ? `Cantidad de asistentes: ${count}` : "",
      message.trim() ? `Mensaje: ${message.trim()}` : "",
    ].filter(Boolean).join("\n");
    // Test recipient for this demo only. Build the destination after validation.
    window.open(`https://wa.me/525530518141?text=${encodeURIComponent(whatsappMessage)}`, "_blank", "noopener,noreferrer");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowDemoConfirmation(true);
  }

  function updateAttendanceStatus(nextAttendanceStatus: string) {
    setAttendanceStatus(nextAttendanceStatus);
    if (nextAttendanceStatus !== "confirmed") {
      setGuestsCount(String(MIN_DEMO_GUESTS));
    }
    setShowDemoConfirmation(false);
  }

  return (
    <section
      id="asistencia"
      className={`${isBabyShower ? "bg-[#fffdfb]" : "bg-white"} px-6 py-24`}
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            {isBabyShower ? "Celebremos juntos" : "RSVP de demostración"}
          </p>

          <h2 className="mb-6 text-4xl md:text-6xl">
            {isBabyShower ? "¿Nos acompañas?" : "Confirma tu asistencia"}
          </h2>

          <p className="text-lg text-neutral-600">
            {isBabyShower
              ? "Prueba cómo tus invitados confirmarían este momento tan especial."
              : "Prueba cómo tus invitados responderían desde su invitación."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className={`rounded-[2rem] p-5 sm:p-8 shadow-sm ${
            isBabyShower ? "bg-[#f5eef4]" : "bg-[#f8f1ea]"
          }`}
        >
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium" htmlFor="demo-attendance">
              ¿Asistirás?
            </label>

            <select
              id="demo-attendance"
              required
              value={attendanceStatus}
              onPointerDown={(event) => {
                if (event.currentTarget.value !== attendanceStatus) {
                  updateAttendanceStatus(event.currentTarget.value);
                }
              }}
              onFocus={(event) => {
                if (event.currentTarget.value !== attendanceStatus) {
                  updateAttendanceStatus(event.currentTarget.value);
                }
              }}
              onInput={(event) =>
                updateAttendanceStatus(event.currentTarget.value)
              }
              onChange={(event) =>
                updateAttendanceStatus(event.currentTarget.value)
              }
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            >
              <option value="">Selecciona una opción</option>
              <option value="confirmed">Sí, asistiré</option>
              <option value="declined">No podré asistir</option>
            </select>
          </div>

          {attendanceStatus === "confirmed" && (
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium" htmlFor="demo-guests">
                Número de asistentes
              </label>

              <input
                id="demo-guests"
                type="number"
                min={MIN_DEMO_GUESTS}
                max={MAX_DEMO_GUESTS}
                step={1}
                required
                value={guestsCount}
                onChange={(event) => {
                  setGuestsCount(event.target.value);
                  setShowDemoConfirmation(false);
                }}
                onBlur={isBabyShower ? undefined : (event) =>
                  setGuestsCount(normalizeDemoGuestsCount(event.target.value))
                }
                className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
              />
            </div>
          )}

          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium" htmlFor="demo-message">
              {isBabyShower
                ? "Mensaje para el bebé y su familia (opcional)"
                : "Mensaje para la pareja"}
            </label>

            <textarea
              id="demo-message"
              rows={5}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setShowDemoConfirmation(false);
              }}
              placeholder={
                isBabyShower
                  ? "Escribe un deseo lleno de cariño..."
                  : "Escribe un mensaje de demostración..."
              }
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          {isBabyShower && (
            <div className="mb-5 rounded-3xl border border-[#b9ddc2] bg-[#f0fbf2] p-5 text-center">
              <p className="text-sm font-medium text-[#245c32]">
                Confirma por WhatsApp
              </p>
              <button
                type="button"
                aria-describedby="demo-whatsapp-help"
                onClick={handleWhatsApp}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#166534] px-4 py-4 font-medium text-white transition hover:bg-[#14532d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
              >
                Confirmar por WhatsApp
              </button>
              <p id="demo-whatsapp-help" className="mt-2 text-xs text-[#245c32]">
                Se abrirá una pestaña nueva con el mensaje prellenado. Tú decides
                si lo envías. Número de prueba: +52 1 55 3051 8141, solo para esta
                demo. No se guarda tu respuesta en INVITEA.
              </p>
            </div>
          )}

          <button
            type="submit"
            className={`w-full rounded-full px-8 py-4 transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
              isBabyShower ? "border border-[#746072] text-[#574855]" : "bg-black text-white"
            }`}
          >
            {isBabyShower ? "Probar confirmación simulada" : "Probar confirmación"}
          </button>

          {showDemoConfirmation && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 rounded-2xl bg-green-100 px-5 py-4 text-center text-green-800"
            >
              <p className="font-semibold">
                ¡Así se vería una confirmación en INVITEA!
              </p>
              <p className="mt-1 text-sm">
                Esta es una simulación: ningún dato fue enviado ni guardado.
              </p>
            </div>
          )}
        </form>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          Demostración INVITEA
        </p>
      </div>
    </section>
  );
}
