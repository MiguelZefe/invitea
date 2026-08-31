"use client";

import {
  EditInvitationState,
  updateInvitation,
} from "@/app/dashboard/[slug]/editar/actions";
import {
  INVITATION_FIELD_MAX_LENGTHS,
  type InvitationField,
} from "@/lib/invitation-form";
import { useActionState } from "react";

type EditableEvent = {
  event_type: string;
  main_names: string;
  title: string;
  subtitle: string | null;
  event_date: string;
  hero_label: string;
  ceremony_place: string | null;
  ceremony_time: string | null;
  ceremony_address: string | null;
  ceremony_maps_url: string | null;
  reception_place: string | null;
  reception_time: string | null;
  reception_address: string | null;
  reception_maps_url: string | null;
  dress_code: string | null;
  dress_code_description: string | null;
};

type EditInvitationFormProps = {
  slug: string;
  event: EditableEvent;
};

const initialState: EditInvitationState = { message: "" };
const inputClassName =
  "mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black";

export default function EditInvitationForm({
  slug,
  event,
}: EditInvitationFormProps) {
  const action = updateInvitation.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <FormSection eyebrow="Información principal" title="Tu evento">
        <Field label="Tipo de evento" name="event_type" value={event.event_type} required />
        <Field label="Nombres principales" name="main_names" value={event.main_names} required />
        <Field label="Título" name="title" value={event.title} required />
        <Field label="Subtítulo" name="subtitle" value={event.subtitle} />
        <Field label="Fecha del evento" name="event_date" value={event.event_date} required />
        <Field label="Etiqueta principal" name="hero_label" value={event.hero_label} required />
      </FormSection>

      <FormSection eyebrow="Ceremonia" title="Primer encuentro">
        <Field label="Lugar" name="ceremony_place" value={event.ceremony_place} />
        <Field label="Hora" name="ceremony_time" value={event.ceremony_time} />
        <Field label="Dirección" name="ceremony_address" value={event.ceremony_address} wide />
        <Field label="Enlace de Google Maps" name="ceremony_maps_url" value={event.ceremony_maps_url} type="url" wide />
      </FormSection>

      <FormSection eyebrow="Recepción" title="La celebración">
        <Field label="Lugar" name="reception_place" value={event.reception_place} />
        <Field label="Hora" name="reception_time" value={event.reception_time} />
        <Field label="Dirección" name="reception_address" value={event.reception_address} wide />
        <Field label="Enlace de Google Maps" name="reception_maps_url" value={event.reception_maps_url} type="url" wide />
      </FormSection>

      <FormSection eyebrow="Vestimenta" title="Código de vestimenta">
        <Field label="Código" name="dress_code" value={event.dress_code} />
        <Field label="Descripción" name="dress_code_description" value={event.dress_code_description} />
      </FormSection>

      {state.message && (
        <p role="alert" aria-live="polite" className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Guardando cambios..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">{eyebrow}</p>
        <h2 className="mt-2 text-3xl">{title}</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  type = "text",
  required = false,
  wide = false,
}: {
  label: string;
  name: InvitationField;
  value: string | null;
  type?: "text" | "url";
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={`block text-sm font-medium ${wide ? "md:col-span-2" : ""}`}>
      {label} {required && <span aria-hidden="true">*</span>}
      <input
        name={name}
        type={type}
        required={required}
        maxLength={INVITATION_FIELD_MAX_LENGTHS[name]}
        pattern={type === "url" ? "https://.*" : undefined}
        defaultValue={value ?? ""}
        className={inputClassName}
      />
    </label>
  );
}
