"use client";

import { supabase } from "@/lib/supabase";
import { useState, type FormEvent } from "react";

type WeddingRSVPProps = {
  eventSlug: string;
};

export default function WeddingRSVP({
  eventSlug,
}: WeddingRSVPProps) {
  const [fullName, setFullName] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [guestsCount, setGuestsCount] = useState(1);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccess(false);
    setLoading(true);

    const { error } = await supabase
      .from("rsvps")
      .insert({
        event_slug: eventSlug,
        full_name: fullName,
        attendance_status: attendanceStatus,
        guests_count: guestsCount,
        message,
      });

    setLoading(false);

    if (error) {
      alert("Ocurrió un error al enviar la confirmación.");
      console.error(error);
      return;
    }

    setSuccess(true);

    setFullName("");
    setAttendanceStatus("");
    setGuestsCount(1);
    setMessage("");
  };

  return (
    <section
      id="asistencia"
      className="bg-white px-6 py-24"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            RSVP
          </p>

          <h2 className="mb-6 text-4xl md:text-6xl">
            Confirma tu asistencia
          </h2>

          <p className="text-lg text-neutral-600">
            Ayúdanos a preparar todo para recibirte como mereces.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] bg-[#f8f1ea] p-8 shadow-sm"
        >
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              Nombre completo
            </label>

            <input
              type="text"
              required
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Ej. Ana Martínez"
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
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

            <input
              type="number"
              min="1"
              required
              value={guestsCount}
              onChange={(event) =>
                setGuestsCount(Number(event.target.value))
              }
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium">
              Mensaje para los novios
            </label>

            <textarea
              rows={5}
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Escribe un mensaje especial..."
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Enviando..."
              : "Enviar confirmación"}
          </button>

          {success && (
            <div className="mt-6 rounded-2xl bg-green-100 px-5 py-4 text-center text-green-800">
              <p className="font-semibold">
                ¡Confirmación enviada correctamente!
              </p>

              <p className="mt-1 text-sm">
                Gracias por confirmar tu asistencia.
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