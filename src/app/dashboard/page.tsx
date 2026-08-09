import LogoutButton from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";

type BuyerEvent = {
  id: string;
  slug: string;
  event_type: string;
  title: string;
  main_names: string;
  event_date: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("events")
    .select("id, slug, event_type, title, main_names, event_date")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("No se pudieron cargar los eventos del comprador:", error);
  }

  const events = (data ?? []) as BuyerEvent[];

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-6 py-10 text-neutral-900">
      <section className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              INVITEA
            </p>

            <h1 className="mt-2 text-4xl md:text-5xl">
              Mis invitaciones
            </h1>

            <p className="mt-3 text-neutral-600">
              Administra tus eventos y consulta sus confirmaciones.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/nueva"
              className="rounded-full bg-black px-6 py-3 text-center text-white transition hover:opacity-90"
            >
              Crear nueva invitación
            </Link>

            <Link
              href="/cuenta"
              className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
            >
              Mi cuenta
            </Link>

            <LogoutButton />
          </div>
        </header>

        {error ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl">No pudimos cargar tus invitaciones</h2>
            <p className="mt-3 text-neutral-500">
              Intenta recargar la página en unos momentos.
            </p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="flex min-h-80 flex-col rounded-[2rem] bg-white p-7 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-[#f8f5f2] px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    {event.event_type}
                  </span>

                  <span className="text-sm text-neutral-500">
                    {event.event_date}
                  </span>
                </div>

                <div className="mt-8 flex-1">
                  <h2 className="text-3xl leading-tight">
                    {event.main_names}
                  </h2>

                  <p className="mt-3 text-neutral-500">{event.title}</p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/dashboard/${event.slug}`}
                    className="rounded-full bg-black px-5 py-3 text-center text-sm text-white transition hover:opacity-90"
                  >
                    Administrar
                  </Link>

                  <Link
                    href={`/invitacion/${event.slug}`}
                    className="rounded-full border border-black px-5 py-3 text-center text-sm transition hover:bg-black hover:text-white"
                  >
                    Ver invitación
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
              Tu primer evento
            </p>

            <h2 className="mt-4 text-3xl md:text-4xl">
              Aún no tienes invitaciones
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-neutral-500">
              Cuando crees una invitación, aparecerá aquí para que puedas
              administrarla y revisar sus confirmaciones.
            </p>

            <Link
              href="/dashboard/nueva"
              className="mt-8 inline-block rounded-full bg-black px-7 py-3 text-white transition hover:opacity-90"
            >
              Crear nueva invitación
            </Link>
          </div>
        )}

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
