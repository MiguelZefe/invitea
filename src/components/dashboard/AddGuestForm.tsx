"use client";

import {
  AddGuestState,
  addGuest,
} from "@/app/dashboard/[slug]/invitados/actions";
import { useActionState, useEffect, useRef } from "react";

type AddGuestFormProps = {
  slug: string;
};

const initialState: AddGuestState = {
  message: "",
  success: false,
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black";

export default function AddGuestForm({ slug }: AddGuestFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = addGuest.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
          Nuevo registro
        </p>
        <h2 className="mt-2 text-3xl">Agregar invitado</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium md:col-span-2">
          Nombre completo <span aria-hidden="true">*</span>
          <input
            name="full_name"
            type="text"
            required
            className={inputClassName}
          />
        </label>

        <label className="block text-sm font-medium">
          Teléfono
          <input name="phone" type="tel" className={inputClassName} />
        </label>

        <label className="block text-sm font-medium">
          Correo electrónico
          <input name="email" type="email" className={inputClassName} />
        </label>

        <label className="block text-sm font-medium">
          Pases máximos <span aria-hidden="true">*</span>
          <input
            name="max_guests"
            type="number"
            min={1}
            max={100}
            step={1}
            defaultValue={1}
            required
            className={inputClassName}
          />
        </label>

        <label className="block text-sm font-medium md:col-span-2">
          Notas
          <textarea
            name="notes"
            rows={3}
            className={`${inputClassName} resize-y`}
          />
        </label>
      </div>

      {state.message && (
        <p
          role={state.success ? "status" : "alert"}
          aria-live="polite"
          className={`mt-6 rounded-2xl px-5 py-4 text-sm ${
            state.success
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Agregando invitado..." : "Agregar invitado"}
        </button>
      </div>
    </form>
  );
}
