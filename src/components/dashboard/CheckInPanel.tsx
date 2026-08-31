"use client";

import {
  CheckInGuest,
  MarkCheckInState,
  SearchGuestState,
  markGuestCheckIn,
  searchCheckInGuest,
} from "@/app/dashboard/[slug]/checkin/actions";
import ManualGuestSearch from "@/components/dashboard/ManualGuestSearch";
import type { ManualCheckInGuest } from "@/components/dashboard/ManualGuestSearch";
import QrCheckInScanner from "@/components/dashboard/QrCheckInScanner";
import {
  getCheckedInPeople,
  isGuestCheckedIn,
} from "@/lib/guest-attendance";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CheckInPanelProps = {
  slug: string;
  guests: ManualCheckInGuest[];
};

const initialSearchState: SearchGuestState = {
  message: "",
  guest: null,
};

export default function CheckInPanel({ slug, guests }: CheckInPanelProps) {
  const [manualGuest, setManualGuest] = useState<ManualCheckInGuest | null>(null);
  const [selectionMode, setSelectionMode] = useState<"qr" | "manual" | null>(
    null
  );
  const resultRef = useRef<HTMLDivElement>(null);
  const searchAction = searchCheckInGuest.bind(null, slug);
  const [state, formAction, pending] = useActionState(
    searchAction,
    initialSearchState
  );

  function searchScannedToken(token: string) {
    setManualGuest(null);
    setSelectionMode("qr");
    const formData = new FormData();
    formData.set("token", token);

    startTransition(() => {
      formAction(formData);
    });
  }

  function selectManualGuest(guest: ManualCheckInGuest) {
    setManualGuest(guest);
    setSelectionMode("manual");
  }

  const selectedGuest =
    selectionMode === "manual"
      ? manualGuest
      : selectionMode === "qr" && !pending
        ? state.guest
        : null;
  const attendanceTotals = useMemo(
    () =>
      guests.reduce(
        (totals, guest) => {
          if (isGuestCheckedIn(guest)) {
            totals.checkedInGroups += 1;
            totals.checkedInPeople += getCheckedInPeople(guest);
          } else {
            totals.pendingGroups += 1;
          }

          if (guest.attendanceStatus === "confirmed") {
            totals.confirmedGroups += 1;
          }

          return totals;
        },
        {
          checkedInGroups: 0,
          checkedInPeople: 0,
          pendingGroups: 0,
          confirmedGroups: 0,
        }
      ),
    [guests]
  );

  useEffect(() => {
    if (!selectedGuest) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [selectedGuest]);

  return (
    <div className="space-y-6">
      <section
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        aria-label="Resumen de check-in"
      >
        <SummaryCard
          label="Personas ingresadas"
          value={attendanceTotals.checkedInPeople}
          tone="dark"
        />
        <SummaryCard
          label="Con check-in"
          value={attendanceTotals.checkedInGroups}
          tone="green"
        />
        <SummaryCard
          label="Pendientes de ingreso"
          value={attendanceTotals.pendingGroups}
          tone="amber"
        />
        <SummaryCard
          label="Asistencia confirmada"
          value={attendanceTotals.confirmedGroups}
          tone="blue"
        />
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
            Método principal
          </p>
          <h2 className="mt-2 text-3xl">Escanear QR</h2>
          <p className="mt-3 text-neutral-500">
            Lee el código individual, verifica la asistencia y registra el
            ingreso.
          </p>
        </div>

        <QrCheckInScanner
          onTokenDetected={searchScannedToken}
          disabled={pending}
        />

        {selectionMode === "qr" && state.message && (
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
      </section>

      <div className="flex items-center gap-4 px-2" aria-hidden="true">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-400">
          o buscar manualmente
        </span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {selectedGuest && (
        <div ref={resultRef} className="scroll-mt-4">
          <GuestResult
            key={selectedGuest.token}
            slug={slug}
            guest={selectedGuest}
          />
        </div>
      )}

      <ManualGuestSearch guests={guests} onSelect={selectManualGuest} />
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
  const router = useRouter();
  const markAction = markGuestCheckIn.bind(null, slug, guest.token);
  const initialMarkState: MarkCheckInState = {
    message: "",
    success: false,
    checkedInAt: guest.checkedInAt,
    checkedInCount: guest.checkedInCount,
  };
  const [state, formAction, pending] = useActionState(
    markAction,
    initialMarkState
  );

  const checkedInAt = state.checkedInAt ?? guest.checkedInAt;
  const checkedInCount = state.checkedInAt
    ? state.checkedInCount
    : guest.checkedInCount;
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

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.checkedInAt, state.checkedInCount, state.success]);

  function confirmExceptionalCheckIn(event: React.FormEvent<HTMLFormElement>) {
    const warnings: string[] = [];
    const formData = new FormData(event.currentTarget);
    const requestedCount = Number(formData.get("checked_in_count"));

    if (
      guest.attendanceStatus === "confirmed" &&
      guest.confirmedGuestsCount !== null &&
      requestedCount > guest.confirmedGuestsCount
    ) {
      warnings.push(
        `Confirmó ${guest.confirmedGuestsCount} ${guest.confirmedGuestsCount === 1 ? "persona" : "personas"}, pero intentas registrar ${requestedCount}.`
      );
    }

    if (
      warnings.length > 0 &&
      !window.confirm(
        `${warnings.join("\n")}\n\n¿Verificaste los datos y deseas continuar?`
      )
    ) {
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
          {alreadyCheckedIn ? "Check-in registrado" : "Pendiente de ingreso"}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
          Verificación de asistencia
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <VerificationCard
            label="Invitación"
            value="Válida para este evento"
            tone="green"
          />
          <VerificationCard
            label="Estado RSVP"
            value={rsvpLabel}
            tone={
              guest.attendanceStatus === "confirmed"
                ? "green"
                : guest.attendanceStatus === "declined"
                  ? "red"
                  : "amber"
            }
          />
          <VerificationCard
            label="Pases autorizados"
            value={String(guest.maxGuests)}
            tone="neutral"
          />
          <VerificationCard
            label="Personas confirmadas"
            value={
              guest.confirmedGuestsCount === null
                ? "Sin respuesta"
                : String(guest.confirmedGuestsCount)
            }
            tone="neutral"
          />
        </div>
      </div>

      {!alreadyCheckedIn && guest.attendanceStatus === null && (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-800">
          <p className="font-medium">Este invitado todavía no tiene RSVP.</p>
          <p className="mt-2 text-sm">
            Puedes registrar su ingreso después de verificar personalmente sus
            datos.
          </p>
        </div>
      )}

      {!alreadyCheckedIn && guest.attendanceStatus === "declined" && (
        <div className="mt-6 rounded-3xl border border-red-300 bg-red-50 px-6 py-5 text-red-800">
          <p className="font-semibold">El invitado respondió que no asistiría.</p>
          <p className="mt-2 text-sm">
            Solo registra el ingreso si la persona llegó y confirmas
            explícitamente la excepción.
          </p>
        </div>
      )}

      {alreadyCheckedIn ? (
        <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 px-6 py-5 text-green-900">
          <p className="font-medium">Asistencia verificada.</p>
          <p className="mt-2 text-sm">
            {checkedInAt
              ? new Date(checkedInAt).toLocaleString("es-MX")
              : "Fecha no disponible"}
            {checkedInCount !== null
              ? ` · ${checkedInCount} ${checkedInCount === 1 ? "persona" : "personas"}`
              : " · Cantidad no disponible"}
          </p>
          <p className="mt-2 text-sm">
            El acceso ya fue utilizado y no puede registrarse nuevamente.
          </p>
          {state.message && (
            <p
              role={state.success ? "status" : "alert"}
              aria-live="polite"
              className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                state.success
                  ? "bg-white/70 text-green-800"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {state.message}
            </p>
          )}
        </div>
      ) : (
        <form
          action={formAction}
          onSubmit={confirmExceptionalCheckIn}
          className="mt-6 border-t border-neutral-100 pt-6"
        >
          {guest.attendanceStatus === "declined" && (
            <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-3xl border border-red-300 bg-red-50 px-5 py-4 text-sm leading-6 text-red-900">
              <input
                type="checkbox"
                name="override_declined"
                value="true"
                required
                className="mt-1 h-5 w-5 shrink-0 accent-red-700"
              />
              <span>
                <strong className="block">Confirmar excepción</strong>
                Verifiqué que la persona llegó aunque había indicado que no
                asistiría.
              </span>
            </label>
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

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-3xl border border-neutral-200 bg-[#f8f5f2] px-5 py-4 text-sm leading-6">
            <input
              type="checkbox"
              name="attendance_verified"
              value="yes"
              required
              className="mt-1 h-5 w-5 shrink-0 accent-black"
            />
            <span>
              <strong className="block text-neutral-900">
                Verificación manual
              </strong>
              Confirmé el nombre del invitado y la cantidad de personas que
              ingresan.
            </span>
          </label>

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? "Verificando y registrando..."
              : guest.attendanceStatus === "declined"
                ? "Verificar excepción y registrar check-in"
                : "Verificar y registrar check-in"}
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

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "dark" | "green" | "amber" | "blue";
}) {
  const toneClassName = {
    dark: "bg-neutral-900 text-white",
    green: "bg-green-100 text-green-900",
    amber: "bg-amber-100 text-amber-900",
    blue: "bg-blue-100 text-blue-900",
  }[tone];

  return (
    <article className={`rounded-3xl p-5 shadow-sm ${toneClassName}`}>
      <p className="text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-sm opacity-75">{label}</p>
    </article>
  );
}

function VerificationCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "amber" | "red" | "neutral";
}) {
  const toneClassName = {
    green: "border-green-200 bg-green-50 text-green-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    red: "border-red-200 bg-red-50 text-red-900",
    neutral: "border-neutral-200 bg-[#f8f5f2] text-neutral-900",
  }[tone];

  return (
    <article className={`rounded-3xl border p-5 ${toneClassName}`}>
      <p className="text-sm opacity-70">{label}</p>
      <p className="mt-2 font-medium">{value}</p>
    </article>
  );
}
