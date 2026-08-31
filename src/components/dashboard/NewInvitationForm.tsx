"use client";

import { createInvitation } from "@/app/dashboard/nueva/actions";
import { INVITATION_FIELD_MAX_LENGTHS } from "@/lib/invitation-form";
import { useActionState } from "react";

const initialState = {
  message: "",
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black";

export default function NewInvitationForm() {
  const [state, formAction, pending] = useActionState(
    createInvitation,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Información principal
          </p>
          <h2 className="mt-2 text-3xl">Tu evento</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium">
            Tipo de evento <span aria-hidden="true">*</span>
            <input
              name="event_type"
              type="text"
              required
              maxLength={INVITATION_FIELD_MAX_LENGTHS.event_type}
              placeholder="Boda"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Nombres principales <span aria-hidden="true">*</span>
            <input
              name="main_names"
              type="text"
              required
              maxLength={INVITATION_FIELD_MAX_LENGTHS.main_names}
              placeholder="María & Alejandro"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Título <span aria-hidden="true">*</span>
            <input
              name="title"
              type="text"
              required
              maxLength={INVITATION_FIELD_MAX_LENGTHS.title}
              placeholder="Nuestra boda"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Subtítulo
            <input
              name="subtitle"
              type="text"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.subtitle}
              placeholder="Nos encantará celebrar contigo"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Fecha del evento <span aria-hidden="true">*</span>
            <input
              name="event_date"
              type="text"
              required
              maxLength={INVITATION_FIELD_MAX_LENGTHS.event_date}
              placeholder="Sábado 24 de agosto de 2026"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Etiqueta principal <span aria-hidden="true">*</span>
            <input
              name="hero_label"
              type="text"
              required
              maxLength={INVITATION_FIELD_MAX_LENGTHS.hero_label}
              placeholder="¡Nos casamos!"
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Ceremonia
          </p>
          <h2 className="mt-2 text-3xl">Primer encuentro</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium">
            Lugar
            <input
              name="ceremony_place"
              type="text"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.ceremony_place}
              placeholder="Parroquia San José"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Hora
            <input
              name="ceremony_time"
              type="text"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.ceremony_time}
              placeholder="17:00 h"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium md:col-span-2">
            Dirección
            <input
              name="ceremony_address"
              type="text"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.ceremony_address}
              placeholder="Calle, número, colonia y ciudad"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium md:col-span-2">
            Enlace de Google Maps
            <input
              name="ceremony_maps_url"
              type="url"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.ceremony_maps_url}
              pattern="https://.*"
              placeholder="https://maps.google.com/..."
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Recepción
          </p>
          <h2 className="mt-2 text-3xl">La celebración</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium">
            Lugar
            <input
              name="reception_place"
              type="text"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.reception_place}
              placeholder="Hacienda Los Olivos"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Hora
            <input
              name="reception_time"
              type="text"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.reception_time}
              placeholder="19:00 h"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium md:col-span-2">
            Dirección
            <input
              name="reception_address"
              type="text"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.reception_address}
              placeholder="Calle, número, colonia y ciudad"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium md:col-span-2">
            Enlace de Google Maps
            <input
              name="reception_maps_url"
              type="url"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.reception_maps_url}
              pattern="https://.*"
              placeholder="https://maps.google.com/..."
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Vestimenta
          </p>
          <h2 className="mt-2 text-3xl">Código de vestimenta</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium">
            Código
            <input
              name="dress_code"
              type="text"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.dress_code}
              placeholder="Formal"
              className={inputClassName}
            />
          </label>

          <label className="block text-sm font-medium">
            Descripción
            <input
              name="dress_code_description"
              type="text"
              maxLength={INVITATION_FIELD_MAX_LENGTHS.dress_code_description}
              placeholder="Traje oscuro y vestido largo"
              className={inputClassName}
            />
          </label>
        </div>
      </section>

      {state.message && (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Creando invitación..." : "Crear invitación"}
        </button>
      </div>
    </form>
  );
}
