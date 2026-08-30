"use client";

import { useState, type FormEvent } from "react";

const MIN_DEMO_GUESTS = 1;
const MAX_DEMO_GUESTS = 6;

function normalizeDemoGuestsCount(value: string): string {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return String(MIN_DEMO_GUESTS);
  }

  return String(Math.min(MAX_DEMO_GUESTS, Math.max(MIN_DEMO_GUESTS, Math.trunc(parsedValue))));
}

export default function DemoRSVP() {
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [guestsCount, setGuestsCount] = useState(String(MIN_DEMO_GUESTS));
  const [message, setMessage] = useState("");
  const [showDemoConfirmation, setShowDemoConfirmation] = useState(false);

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
    <section id="asistencia" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            RSVP de demostración
          </p>

          <h2 className="mb-6 text-4xl md:text-6xl">
            Confirma tu asistencia
          </h2>

          <p className="text-lg text-neutral-600">
            Prueba cómo tus invitados responderían desde su invitación.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="rounded-[2rem] bg-[#f8f1ea] p-8 shadow-sm"
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
                required
                value={guestsCount}
                onChange={(event) => {
                  setGuestsCount(event.target.value);
                  setShowDemoConfirmation(false);
                }}
                onBlur={(event) =>
                  setGuestsCount(normalizeDemoGuestsCount(event.target.value))
                }
                className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
              />
            </div>
          )}

          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium" htmlFor="demo-message">
              Mensaje para la pareja
            </label>

            <textarea
              id="demo-message"
              rows={5}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setShowDemoConfirmation(false);
              }}
              placeholder="Escribe un mensaje de demostración..."
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90"
          >
            Probar confirmación
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
