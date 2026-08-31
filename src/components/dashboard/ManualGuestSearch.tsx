"use client";

import type { CheckInGuest } from "@/app/dashboard/[slug]/checkin/actions";
import { getGuestPresenceStatus } from "@/lib/guest-attendance";
import { useMemo, useState } from "react";

export type ManualCheckInGuest = CheckInGuest & {
  phone: string | null;
  email: string | null;
};

type ManualGuestSearchProps = {
  guests: ManualCheckInGuest[];
  onSelect: (guest: ManualCheckInGuest) => void;
};

type CheckInFilter = "outside" | "inside" | "checked-out" | "all";

const filters: Array<{ value: CheckInFilter; label: string }> = [
  { value: "outside", label: "Fuera / por ingresar" },
  { value: "inside", label: "Dentro" },
  { value: "checked-out", label: "Con salida" },
  { value: "all", label: "Todos" },
];

function normalizeSearchValue(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getRsvpLabel(status: string | null) {
  if (status === "confirmed") {
    return "Confirmado";
  }

  if (status === "declined") {
    return "No asistirá";
  }

  return "Pendiente";
}

export default function ManualGuestSearch({
  guests,
  onSelect,
}: ManualGuestSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<CheckInFilter>("outside");

  const filteredGuests = useMemo(() => {
    const normalizedTerm = normalizeSearchValue(searchTerm);

    return guests.filter((guest) => {
      const presenceStatus = getGuestPresenceStatus(guest);
      const matchesFilter =
        filter === "all" ||
        (filter === "outside" && presenceStatus !== "inside") ||
        (filter === "inside" && presenceStatus === "inside") ||
        (filter === "checked-out" && presenceStatus === "checked-out");

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedTerm) {
        return true;
      }

      return [guest.fullName, guest.phone ?? "", guest.email ?? ""].some(
        (value) => normalizeSearchValue(value).includes(normalizedTerm)
      );
    });
  }, [filter, guests, searchTerm]);

  const visibleGuests = filteredGuests.slice(0, 50);

  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
          Búsqueda manual
        </p>
        <h2 className="mt-2 text-3xl">Buscar invitado</h2>
        <p className="mt-3 text-neutral-500">
          Encuentra a una persona por nombre, teléfono o correo.
        </p>
      </div>

      <label className="mt-6 block text-sm font-medium" htmlFor="manual-guest-search">
        Nombre, teléfono o correo
        <input
          id="manual-guest-search"
          type="search"
          autoComplete="off"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Ej. Ana, 5512 o gmail"
          className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Filtrar invitados por ingreso">
        {filters.map((option) => {
          const selected = filter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={selected}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selected
                  ? "bg-black text-white"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-black hover:text-black"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        {visibleGuests.map((guest) => {
          const presenceStatus = getGuestPresenceStatus(guest);
          const isInside = presenceStatus === "inside";
          const hasCheckedOut = presenceStatus === "checked-out";

          return (
            <article
              key={guest.token}
              className="rounded-3xl border border-neutral-100 p-5 transition hover:border-neutral-300"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <h3 className="text-xl font-medium">{guest.fullName}</h3>

                  {(guest.phone || guest.email) && (
                    <div className="mt-2 space-y-1 text-sm text-neutral-500">
                      {guest.phone && <p>{guest.phone}</p>}
                      {guest.email && <p className="break-all">{guest.email}</p>}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[#f8f5f2] px-3 py-2 text-neutral-600">
                      {getRsvpLabel(guest.attendanceStatus)}
                    </span>
                    <span className="rounded-full bg-[#f8f5f2] px-3 py-2 text-neutral-600">
                      Máximo {guest.maxGuests} {guest.maxGuests === 1 ? "pase" : "pases"}
                    </span>
                    {guest.attendanceStatus === "confirmed" &&
                      guest.confirmedGuestsCount !== null && (
                        <span className="rounded-full bg-green-50 px-3 py-2 text-green-700">
                          {guest.confirmedGuestsCount} {guest.confirmedGuestsCount === 1 ? "persona confirmada" : "personas confirmadas"}
                        </span>
                      )}
                  </div>

                  {presenceStatus !== "not-arrived" && (
                    <p
                      className={`mt-3 text-sm font-medium ${
                        isInside ? "text-green-700" : "text-blue-700"
                      }`}
                    >
                      {isInside ? "Dentro" : "Salida registrada"}
                      {guest.checkedInCount !== null
                        ? isInside
                          ? ` · ${guest.checkedInCount} ${guest.checkedInCount === 1 ? "persona" : "personas"}`
                          : ""
                        : ""}
                      {guest.checkedInAt && !hasCheckedOut
                        ? ` · ${new Date(guest.checkedInAt).toLocaleString("es-MX")}`
                        : ""}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(guest)}
                  className="shrink-0 rounded-full bg-black px-5 py-3 text-sm text-white transition hover:opacity-90"
                >
                  Seleccionar
                </button>
              </div>
            </article>
          );
        })}

        {visibleGuests.length === 0 && (
          <div className="rounded-3xl bg-[#f8f5f2] px-6 py-10 text-center">
            <p className="text-lg font-medium">No encontramos invitados</p>
            <p className="mt-2 text-sm text-neutral-500">
              Prueba otra búsqueda o cambia el filtro seleccionado.
            </p>
          </div>
        )}
      </div>

      {filteredGuests.length > 50 && (
        <p className="mt-5 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Mostrando 50 de {filteredGuests.length} resultados. Refina tu búsqueda
          para encontrar al invitado.
        </p>
      )}
    </section>
  );
}
