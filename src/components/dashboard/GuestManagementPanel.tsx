"use client";

import {
  deleteGuest,
  GuestMutationState,
  updateGuest,
} from "@/app/dashboard/[slug]/invitados/actions";
import { useActionState, useState } from "react";

type GuestManagementPanelProps = {
  slug: string;
  guest: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    maxGuests: number;
    notes: string | null;
    checkedInAt: string | null;
    checkedInCount: number | null;
  };
  confirmedGuestsCount: number;
};

const initialState: GuestMutationState = { message: "", success: false };
const inputClassName =
  "mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black";

export default function GuestManagementPanel({
  slug,
  guest,
  confirmedGuestsCount,
}: GuestManagementPanelProps) {
  const [editing, setEditing] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const updateAction = updateGuest.bind(null, slug, guest.id);
  const deleteAction = deleteGuest.bind(null, slug, guest.id);
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateAction,
    initialState
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction,
    initialState
  );
  const hasCheckedIn = Boolean(guest.checkedInAt);

  return (
    <div className="mt-5 border-t border-neutral-100 pt-5">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setEditing((current) => !current)}
          className="rounded-full border border-black px-5 py-3 text-sm transition hover:bg-black hover:text-white"
        >
          {editing ? "Cancelar edición" : "Editar"}
        </button>
        <button
          type="button"
          onClick={() => setDeleteStep(1)}
          className="rounded-full border border-red-600 px-5 py-3 text-sm text-red-700 transition hover:bg-red-600 hover:text-white"
        >
          Eliminar invitado
        </button>
      </div>

      {editing && (
        <form action={updateFormAction} className="mt-5 rounded-3xl bg-[#f8f5f2] p-5">
          <h4 className="text-xl">Editar invitado</h4>
          {confirmedGuestsCount > 0 && (
            <p className="mt-2 text-sm text-neutral-600">
              Este invitado confirmó {confirmedGuestsCount} {confirmedGuestsCount === 1 ? "asistente" : "asistentes"}.
            </p>
          )}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium md:col-span-2">
              Nombre completo
              <input name="full_name" required defaultValue={guest.fullName} className={inputClassName} />
            </label>
            <label className="block text-sm font-medium">
              Teléfono
              <input name="phone" type="tel" defaultValue={guest.phone ?? ""} className={inputClassName} />
            </label>
            <label className="block text-sm font-medium">
              Correo electrónico
              <input name="email" type="email" defaultValue={guest.email ?? ""} className={inputClassName} />
            </label>
            <label className="block text-sm font-medium">
              Pases máximos
              <input
                name="max_guests"
                type="number"
                min={1}
                max={100}
                step={1}
                required
                defaultValue={guest.maxGuests}
                className={inputClassName}
              />
            </label>
            <label className="block text-sm font-medium md:col-span-2">
              Notas
              <textarea name="notes" rows={3} defaultValue={guest.notes ?? ""} className={`${inputClassName} resize-y`} />
            </label>
          </div>

          {updateState.message && (
            <p
              role={updateState.success ? "status" : "alert"}
              className={`mt-5 rounded-2xl px-5 py-4 text-sm ${
                updateState.success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {updateState.message}
            </p>
          )}

          <button
            type="submit"
            disabled={updatePending}
            className="mt-5 rounded-full bg-black px-6 py-3 text-sm text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {updatePending ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      )}

      {deleteStep > 0 && (
        <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-900">
          <h4 className="text-xl font-medium">
            {hasCheckedIn ? "Advertencia: este invitado ya hizo check-in" : "¿Eliminar este invitado?"}
          </h4>
          <p className="mt-3 text-sm leading-6">
            El RSVP permanecerá como registro histórico del evento, pero dejará
            de estar vinculado al invitado. Su enlace personalizado y código QR
            dejarán de funcionar.
          </p>

          {hasCheckedIn && (
            <p className="mt-3 rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium leading-6">
              Se perderá del listado de invitados su información operativa de
              check-in{guest.checkedInCount ? ` para ${guest.checkedInCount} personas` : ""}.
            </p>
          )}

          {hasCheckedIn && deleteStep === 1 ? (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setDeleteStep(2)}
                className="rounded-full bg-red-700 px-5 py-3 text-sm text-white transition hover:bg-red-800"
              >
                Entiendo, continuar
              </button>
              <button
                type="button"
                onClick={() => setDeleteStep(0)}
                className="rounded-full border border-red-700 px-5 py-3 text-sm"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <form action={deleteFormAction} className="mt-5">
              {hasCheckedIn && (
                <input type="hidden" name="acknowledge_checked_in" value="yes" />
              )}
              <p className="mb-4 text-sm font-medium">
                {hasCheckedIn
                  ? "Segunda confirmación: esta acción elimina definitivamente al invitado y sus datos de check-in."
                  : "Esta acción no se puede deshacer."}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={deletePending}
                  className="rounded-full bg-red-700 px-5 py-3 text-sm text-white transition hover:bg-red-800 disabled:opacity-50"
                >
                  {deletePending ? "Eliminando..." : "Confirmar eliminación"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteStep(0)}
                  className="rounded-full border border-red-700 px-5 py-3 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {deleteState.message && !deleteState.success && (
            <p role="alert" className="mt-4 text-sm font-medium">
              {deleteState.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
