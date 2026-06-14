import { supabase } from "@/lib/supabase";

export default async function DashboardPage() {
  const { data: rsvps, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("event_slug", "demo-boda")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const total = rsvps?.length ?? 0;
  const confirmed =
    rsvps?.filter((item) => item.attendance_status === "confirmed").length ?? 0;
  const declined =
    rsvps?.filter((item) => item.attendance_status === "declined").length ?? 0;

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-5xl">Boda María & Alejandro</h1>
          </div>

          <a
            href="/invitacion/demo-boda"
            className="rounded-full bg-black px-6 py-3 text-white"
          >
            Ver invitación
          </a>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold">{total}</p>
            <p className="text-neutral-500">Total respuestas</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold">{confirmed}</p>
            <p className="text-neutral-500">Confirmados</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-4xl font-semibold">{declined}</p>
            <p className="text-neutral-500">No asistirán</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-3xl">Confirmaciones recibidas</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
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
                {rsvps?.map((rsvp) => (
                  <tr key={rsvp.id} className="border-b">
                    <td className="py-4">{rsvp.full_name}</td>
                    <td className="py-4">
                      {rsvp.attendance_status === "confirmed"
                        ? "Sí asistirá"
                        : "No asistirá"}
                    </td>
                    <td className="py-4">{rsvp.guests_count}</td>
                    <td className="py-4 text-neutral-600">
                      {rsvp.message || "Sin mensaje"}
                    </td>
                    <td className="py-4 text-neutral-500">
                      {new Date(rsvp.created_at).toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                ))}
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