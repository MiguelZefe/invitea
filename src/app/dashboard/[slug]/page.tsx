import LogoutButton from "@/components/auth/LogoutButton";
import DeleteInvitationButton from "@/components/dashboard/DeleteInvitationButton";
import EventMetrics from "@/components/dashboard/EventMetrics";
import ExportRSVPButton from "@/components/dashboard/ExportRSVPButton";
import { getCheckedInPeople } from "@/lib/guest-attendance";
import { createClient } from "@/lib/supabase-server";
import { InviteEvent } from "@/types/event";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type DashboardPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function DashboardEventPage({
  params,
}: DashboardPageProps) {
  const { slug } = await params;

  const authSupabase = await createClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: eventData, error: eventError } = await authSupabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .single();

  if (eventError || !eventData) {
    notFound();
  }

  const event = eventData as InviteEvent;

  const [guestsResult, rsvpsResult] = await Promise.all([
    authSupabase
      .from("event_guests")
      .select("id, max_guests, checked_in_at, checked_in_count")
      .eq("event_id", event.id),
    authSupabase
      .from("rsvps")
      .select("*")
      .eq("event_slug", slug)
      .order("created_at", { ascending: false }),
  ]);

  const { data: guests, error: guestsError } = guestsResult;
  const { data: rsvps, error: rsvpsError } = rsvpsResult;

  if (guestsError) {
    console.error("No se pudieron cargar los invitados para las métricas:", guestsError);
  }

  if (rsvpsError) {
    console.error(rsvpsError);
  }

  const safeRsvps = rsvps ?? [];
  const safeGuests = guests ?? [];
  const currentGuestIds = new Set(safeGuests.map((guest) => guest.id));
  const currentRsvpByGuestId = new Map<string, (typeof safeRsvps)[number]>();

  for (const rsvp of safeRsvps) {
    if (
      typeof rsvp.guest_id !== "string" ||
      !currentGuestIds.has(rsvp.guest_id)
    ) {
      continue;
    }

    if (currentRsvpByGuestId.has(rsvp.guest_id)) {
      console.warn(
        "Se encontró más de un RSVP para un invitado; se conserva el más reciente."
      );
      continue;
    }

    currentRsvpByGuestId.set(rsvp.guest_id, rsvp);
  }

  let confirmedGuests = 0;
  let declinedGuests = 0;
  let pendingGuests = 0;
  let confirmedPeople = 0;

  for (const guest of safeGuests) {
    const rsvp = currentRsvpByGuestId.get(guest.id);

    if (!rsvp) {
      pendingGuests += 1;
      continue;
    }

    if (rsvp.attendance_status === "confirmed") {
      confirmedGuests += 1;
      confirmedPeople += rsvp.guests_count;
    } else if (rsvp.attendance_status === "declined") {
      declinedGuests += 1;
    } else {
      console.warn(
        `Se encontró un RSVP con attendance_status desconocido: ${rsvp.attendance_status}.`
      );
    }
  }

  const totalGuests = safeGuests.length;
  const totalPasses = safeGuests.reduce(
    (total, guest) => total + guest.max_guests,
    0
  );
  const checkedInGuests = safeGuests.filter(
    (guest) => guest.checked_in_at !== null
  ).length;
  const checkedInPeople = safeGuests.reduce(
    (total, guest) =>
      total +
      getCheckedInPeople({
        checkedInAt: guest.checked_in_at,
        checkedInCount: guest.checked_in_count,
      }),
    0
  );
  const responseRate =
    totalGuests === 0
      ? 0
      : ((confirmedGuests + declinedGuests) / totalGuests) * 100;
  const confirmationRate =
    totalGuests === 0 ? 0 : (confirmedGuests / totalGuests) * 100;
  const attendanceRate =
    confirmedPeople === 0 ? 0 : (checkedInPeople / confirmedPeople) * 100;

  const totalResponses = safeRsvps.length;

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-6 py-10 text-neutral-900">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              Dashboard del comprador
            </p>

            <h1 className="mt-2 text-4xl md:text-5xl">
              {event.main_names}
            </h1>

            <p className="mt-3 text-neutral-600">
              {event.title} · {event.event_date}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/dashboard/${slug}/checkin`}
              className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
            >
              Accesos
            </Link>

            <Link
              href={`/dashboard/${slug}/invitados`}
              className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
            >
              Invitados
            </Link>

            <Link
              href={`/dashboard/${slug}/editar`}
              className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
            >
              Editar invitación
            </Link>

            <ExportRSVPButton
              rsvps={safeRsvps}
              eventSlug={slug}
            />

            <a
              href={`/invitacion/${slug}`}
              className="rounded-full bg-black px-6 py-3 text-center text-white transition hover:opacity-90"
            >
              Ver invitación
            </a>

            <DeleteInvitationButton slug={slug} />

            <LogoutButton />
          </div>
        </div>

        <EventMetrics
          totalGuests={totalGuests}
          confirmedGuests={confirmedGuests}
          declinedGuests={declinedGuests}
          pendingGuests={pendingGuests}
          checkedInGuests={checkedInGuests}
          responseRate={responseRate}
          confirmationRate={confirmationRate}
          totalPasses={totalPasses}
          confirmedPeople={confirmedPeople}
          checkedInPeople={checkedInPeople}
          attendanceRate={attendanceRate}
        />

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl">
                Confirmaciones recibidas
              </h2>

              <p className="mt-2 text-neutral-500">
                Lista actualizada desde Supabase.
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Las métricas consideran únicamente invitados actuales. Los
                registros no vinculados se conservan en el historial de
                respuestas.
              </p>
            </div>

            <span className="rounded-full bg-[#f8f5f2] px-5 py-3 text-sm text-neutral-600">
              {totalResponses} registros
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="border-b text-sm text-neutral-500">
                  <th className="py-3">Nombre</th>
                  <th className="py-3">Asistencia</th>
                  <th className="py-3">Personas</th>
                  <th className="py-3">Mensaje</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>

              <tbody>
                {safeRsvps.map((rsvp) => (
                  <tr
                    key={rsvp.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="py-4 font-medium">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{rsvp.full_name}</span>
                        {rsvp.guest_id === null && (
                          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-normal text-neutral-500">
                            No vinculado
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4">
                      <span
                        className={`rounded-full px-4 py-2 text-sm ${
                          rsvp.attendance_status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {rsvp.attendance_status === "confirmed"
                          ? "Sí asistirá"
                          : "No asistirá"}
                      </span>
                    </td>

                    <td className="py-4">
                      {rsvp.guests_count}
                    </td>

                    <td className="max-w-xs py-4 text-neutral-600">
                      {rsvp.message || "Sin mensaje"}
                    </td>

                    <td className="py-4 text-neutral-500">
                      {new Date(
                        rsvp.created_at
                      ).toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))}

                {safeRsvps.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-neutral-500"
                    >
                      Aún no hay confirmaciones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
