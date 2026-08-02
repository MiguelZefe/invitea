import LogoutButton from "@/components/auth/LogoutButton";
import ExportRSVPButton from "@/components/dashboard/ExportRSVPButton";
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

  const { data: rsvps, error: rsvpsError } = await authSupabase
    .from("rsvps")
    .select("*")
    .eq("event_slug", slug)
    .order("created_at", { ascending: false });

  if (rsvpsError) {
    console.error(rsvpsError);
  }

  const safeRsvps = rsvps ?? [];

  const totalResponses = safeRsvps.length;

  const confirmedResponses = safeRsvps.filter(
    (item) => item.attendance_status === "confirmed"
  );

  const declinedResponses = safeRsvps.filter(
    (item) => item.attendance_status === "declined"
  );

  const confirmedGuests = confirmedResponses.reduce(
    (total, item) => total + item.guests_count,
    0
  );

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

            <LogoutButton />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold">
              {totalResponses}
            </p>

            <p className="mt-2 text-neutral-500">
              Respuestas
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold">
              {confirmedResponses.length}
            </p>

            <p className="mt-2 text-neutral-500">
              Confirmados
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold">
              {confirmedGuests}
            </p>

            <p className="mt-2 text-neutral-500">
              Asistentes totales
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold">
              {declinedResponses.length}
            </p>

            <p className="mt-2 text-neutral-500">
              No asistirán
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl">
                Confirmaciones recibidas
              </h2>

              <p className="mt-2 text-neutral-500">
                Lista actualizada desde Supabase.
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
                      {rsvp.full_name}
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
