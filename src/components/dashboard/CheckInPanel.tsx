"use client";

import {
  CheckInGuest,
  MarkCheckInState,
  SearchGuestState,
  markGuestCheckIn,
  searchCheckInGuest,
} from "@/app/dashboard/[slug]/checkin/actions";
import QrCheckInScanner from "@/components/dashboard/QrCheckInScanner";
import { startTransition, useActionState, useRef } from "react";

type CheckInPanelProps = {
  slug: string;
};

const initialSearchState: SearchGuestState = {
  message: "",
  guest: null,
};

export default function CheckInPanel({ slug }: CheckInPanelProps) {
  const tokenInputRef = useRef<HTMLInputElement>(null);
  const searchAction = searchCheckInGuest.bind(null, slug);
  const [state, formAction, pending] = useActionState(
    searchAction,
    initialSearchState
  );

  function searchScannedToken(token: string) {
    if (tokenInputRef.current) {
      tokenInputRef.current.value = token;
    }

    const formData = new FormData();
    formData.set("token", token);

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Validar acceso
          </p>
          <h2 className="mt-2 text-3xl">Buscar invitado</h2>
          <p className="mt-3 text-neutral-500">
            Escribe el token o pega el enlace completo incluido en su QR.
          </p>
        </div>

        <QrCheckInScanner
          onTokenDetected={searchScannedToken}
          disabled={pending}
        />

        <label className="mt-6 block text-sm font-medium">
          Token o enlace individual
          <input
            ref={tokenInputRef}
            name="token"
            type="text"
            required
            autoComplete="off"
            placeholder="TOKEN o https://.../?guest=TOKEN"
            className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Buscando..." : "Buscar invitado"}
        </button>

        {state.message && (
          <p
            role={state.guest ? "status" : "alert"}
            aria-live="polite"
            className={`mt-5 rounded-2xl px-5 py-4 text-sm ${
              state.guest
                ? "bg-amber-50 text-amber-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        )}
      </form>

      {state.guest && (
        <GuestResult key={state.guest.token} slug={slug} guest={state.guest} />
      )}
    </div>
  );
}

function GuestResult({
  slug,
  guest,
}: {
  slug: string;
  guest: CheckInGuest;
}) {
  const markAction = markGuestCheckIn.bind(null, slug, guest.token);
  const initialMarkState: MarkCheckInState = {
    message: guest.checkedInAt ? "Este invitado ya había sido registrado." : "",
    success: false,
    checkedInAt: guest.checkedInAt,
    checkedInCount: guest.checkedInCount,
  };
  const [state, formAction, pending] = useActionState(
    markAction,
    initialMarkState
  );

  const checkedInAt = state.checkedInAt ?? guest.checkedInAt;
  const checkedInCount = state.checkedInCount ?? guest.checkedInCount;
  const alreadyCheckedIn = Boolean(checkedInAt);
  const defaultCount =
    guest.attendanceStatus === "confirmed" && guest.confirmedGuestsCount
      ? Math.min(guest.confirmedGuestsCount, guest.maxGuests)
      : 1;

  const rsvpLabel =
    guest.attendanceStatus === "confirmed"
      ? "Confirmado"
      : guest.attendanceStatus === "declined"
        ? "No asistirá"
        : "Pendiente";

  function confirmDeclinedCheckIn(event: React.FormEvent<HTMLFormElement>) {
    if (guest.attendanceStatus !== "declined") {
      return;
    }

    const confirmed = window.confirm(
      "Este invitado respondió que no asistirá. ¿Confirmas que deseas registrar su ingreso de todas formas?"
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Invitado encontrado
          </p>
          <h2 className="mt-2 text-3xl">{guest.fullName}</h2>
        </div>

        <span
          className={`w-fit rounded-full px-5 py-3 text-sm ${
            alreadyCheckedIn
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {alreadyCheckedIn ? "Ingresó" : "Sin ingreso"}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <InfoCard label="Pases máximos" value={String(guest.maxGuests)} />
        <InfoCard label="Estado RSVP" value={rsvpLabel} />
        <InfoCard
          label="Asistentes confirmados"
          value={
            guest.confirmedGuestsCount === null
              ? "Sin respuesta"
              : String(guest.confirmedGuestsCount)
          }
        />
      </div>

      {!alreadyCheckedIn && guest.attendanceStatus === null && (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-800">
          <p className="font-medium">Este invitado todavía no tiene RSVP.</p>
          <p className="mt-2 text-sm">
            Puedes registrar su ingreso, pero confirma sus datos antes de
            continuar.
          </p>
        </div>
      )}

      {!alreadyCheckedIn && guest.attendanceStatus === "declined" && (
        <div className="mt-6 rounded-3xl border border-red-300 bg-red-50 px-6 py-5 text-red-800">
          <p className="font-semibold">El invitado respondió que no asistirá.</p>
          <p className="mt-2 text-sm">
            Solo registra el ingreso si la persona llegó al evento y confirmas
            explícitamente esta excepción.
          </p>
        </div>
      )}

      {alreadyCheckedIn ? (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-900">
          <p className="font-medium">Este invitado ya ingresó.</p>
          <p className="mt-2 text-sm">
            {checkedInAt
              ? new Date(checkedInAt).toLocaleString("es-MX")
              : "Fecha no disponible"}
            {checkedInCount !== null
              ? ` · ${checkedInCount} ${checkedInCount === 1 ? "persona" : "personas"}`
              : ""}
          </p>
          {state.message && <p className="mt-2 text-sm">{state.message}</p>}
        </div>
      ) : (
        <form
          action={formAction}
          onSubmit={confirmDeclinedCheckIn}
          className="mt-6 border-t border-neutral-100 pt-6"
        >
          {guest.attendanceStatus === "declined" && (
            <input type="hidden" name="override_declined" value="true" />
          )}

          <label className="block text-sm font-medium">
            Personas que ingresan
            <input
              name="checked_in_count"
              type="number"
              min={1}
              max={guest.maxGuests}
              step={1}
              required
              defaultValue={defaultCount}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "Registrando ingreso..."
              : guest.attendanceStatus === "declined"
                ? "Registrar ingreso de todas formas"
                : "Marcar como Ingresó"}
          </button>

          {state.message && (
            <p
              role={state.success ? "status" : "alert"}
              aria-live="polite"
              className={`mt-5 rounded-2xl px-5 py-4 text-sm ${
                state.success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {state.message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-[#f8f5f2] p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-xl font-medium">{value}</p>
    </div>
  );
}
