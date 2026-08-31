"use client";

import {
  CheckInGuest,
  MarkAttendanceState,
  SearchGuestState,
  markGuestAttendance,
  searchCheckInGuest,
} from "@/app/dashboard/[slug]/checkin/actions";
import ManualGuestSearch from "@/components/dashboard/ManualGuestSearch";
import type { ManualCheckInGuest } from "@/components/dashboard/ManualGuestSearch";
import QrCheckInScanner from "@/components/dashboard/QrCheckInScanner";
import {
  getGuestPresenceStatus,
  getPeopleInside,
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
  const resultRef = useRef<HTMLDivElement>(null);
  const [selectionMode, setSelectionMode] = useState<"qr" | "manual" | null>(
    null
  );
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
          const status = getGuestPresenceStatus(guest);

          if (status === "inside") {
            totals.insideGroups += 1;
            totals.peopleInside += getPeopleInside(guest);
          } else if (status === "checked-out") {
            totals.checkedOutGroups += 1;
          } else {
            totals.notArrivedGroups += 1;
          }

          return totals;
        },
        {
          insideGroups: 0,
          peopleInside: 0,
          checkedOutGroups: 0,
          notArrivedGroups: 0,
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
        aria-label="Resumen de acceso"
      >
        <SummaryCard
          label="Personas dentro"
          value={attendanceTotals.peopleInside}
          tone="dark"
        />
        <SummaryCard
          label="Grupos dentro"
          value={attendanceTotals.insideGroups}
          tone="green"
        />
        <SummaryCard
          label="Sin ingresar"
          value={attendanceTotals.notArrivedGroups}
          tone="amber"
        />
        <SummaryCard
          label="Con salida"
          value={attendanceTotals.checkedOutGroups}
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
            Lee el código individual, revisa los datos y confirma el ingreso.
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
  const markAction = markGuestAttendance.bind(null, slug, guest.token);
  const initialMarkState: MarkAttendanceState = {
    message: "",
    success: false,
    checkedInAt: guest.checkedInAt,
    checkedInCount: guest.checkedInCount,
    movement: null,
  };
  const [state, formAction, pending] = useActionState(
    markAction,
    initialMarkState
  );

  const hasActionResult = state.movement !== null;
  const checkedInAt = hasActionResult ? state.checkedInAt : guest.checkedInAt;
  const checkedInCount = hasActionResult
    ? state.checkedInCount
    : guest.checkedInCount;
  const presenceStatus = getGuestPresenceStatus({
    checkedInAt,
    checkedInCount,
  });
  const isInside = presenceStatus === "inside";
  const hasCheckedOut = presenceStatus === "checked-out";
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

  function confirmCheckOut(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `¿Registrar la salida de ${guest.fullName} y sus acompañantes?`
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
            isInside
              ? "bg-green-100 text-green-700"
              : hasCheckedOut
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
          }`}
        >
          {isInside ? "Dentro" : hasCheckedOut ? "Salió" : "Sin ingreso"}
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

      {!isInside && guest.attendanceStatus === null && (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-800">
          <p className="font-medium">Este invitado todavía no tiene RSVP.</p>
          <p className="mt-2 text-sm">
            Puedes registrar su ingreso, pero confirma sus datos antes de
            continuar.
          </p>
        </div>
      )}

      {!isInside && guest.attendanceStatus === "declined" && (
        <div className="mt-6 rounded-3xl border border-red-300 bg-red-50 px-6 py-5 text-red-800">
          <p className="font-semibold">El invitado respondió que no asistirá.</p>
          <p className="mt-2 text-sm">
            Solo registra el ingreso si la persona llegó al evento y confirmas
            explícitamente esta excepción.
          </p>
        </div>
      )}

      {isInside ? (
        <div className="mt-6 rounded-3xl border border-green-200 bg-green-50 px-6 py-5 text-green-900">
          <p className="font-medium">Este grupo se encuentra dentro.</p>
          <p className="mt-2 text-sm">
            {checkedInAt
              ? new Date(checkedInAt).toLocaleString("es-MX")
              : "Fecha no disponible"}
            {checkedInCount !== null
              ? ` · ${checkedInCount} ${checkedInCount === 1 ? "persona" : "personas"}`
              : ""}
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

          <form action={formAction} onSubmit={confirmCheckOut} className="mt-5">
            <input type="hidden" name="movement" value="check-out" />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full border border-blue-700 bg-white px-8 py-4 text-blue-800 transition hover:bg-blue-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Registrando salida..." : "Registrar salida"}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-6 border-t border-neutral-100 pt-6">
          {hasCheckedOut && (
            <div className="mb-5 rounded-3xl border border-blue-200 bg-blue-50 px-6 py-5 text-blue-900">
              <p className="font-medium">La salida de este grupo está registrada.</p>
              <p className="mt-2 text-sm">
                Puede volver a ingresar; la nueva entrada reemplazará la hora
                anterior.
              </p>
            </div>
          )}

          <form action={formAction} onSubmit={confirmDeclinedCheckIn}>
            <input type="hidden" name="movement" value="check-in" />
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
                : hasCheckedOut
                  ? "Registrar nuevo ingreso"
                  : guest.attendanceStatus === "declined"
                    ? "Registrar ingreso de todas formas"
                    : "Marcar como ingresó"}
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
        </div>
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-[#f8f5f2] p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-2 text-xl font-medium">{value}</p>
    </div>
  );
}
