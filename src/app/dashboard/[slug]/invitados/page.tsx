import AddGuestForm from "@/components/dashboard/AddGuestForm";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type GuestsPageProps = {
  params: Promise<{ slug: string }>;
};

type EventGuest = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  max_guests: number;
  notes: string | null;
  token: string;
};

export default async function GuestsPage({ params }: GuestsPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, slug, main_names")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (eventError) {
    console.error("No se pudo cargar el evento:", eventError);
  }

  if (eventError || !event) {
    notFound();
  }

  const { data, error: guestsError } = await supabase
    .from("event_guests")
    .select("id, full_name, phone, email, max_guests, notes, token")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  if (guestsError) {
    console.error("No se pudieron cargar los invitados:", guestsError);
  }

  const guests = (data ?? []) as EventGuest[];

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-6 py-10 text-neutral-900">
      <section className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              INVITEA · Invitados
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl">{event.main_names}</h1>
            <p className="mt-3 text-neutral-600">
              Administra la lista y los enlaces individuales de tu invitación.
            </p>
          </div>

          <Link
            href={`/dashboard/${slug}`}
            className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
          >
            Volver al evento
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:items-start">
          <AddGuestForm slug={slug} />

          <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
                  Lista del evento
                </p>
                <h2 className="mt-2 text-3xl">Invitados</h2>
              </div>
              <span className="rounded-full bg-[#f8f5f2] px-5 py-3 text-sm text-neutral-600">
                {guests.length} registros
              </span>
            </div>

            {guestsError ? (
              <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
                No pudimos cargar los invitados. Intenta nuevamente.
              </div>
            ) : guests.length === 0 ? (
              <div className="rounded-3xl bg-[#f8f5f2] px-6 py-12 text-center">
                <h3 className="text-2xl">Aún no hay invitados</h3>
                <p className="mt-3 text-neutral-500">
                  Agrega el primer invitado desde el formulario.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {guests.map((guest) => {
                  const invitationPath = `/invitacion/${slug}?guest=${guest.token}`;

                  return (
                    <article
                      key={guest.id}
                      className="rounded-3xl border border-neutral-100 p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <h3 className="text-xl font-medium">{guest.full_name}</h3>
                          <p className="mt-2 text-sm text-neutral-500">
                            {guest.phone || "Sin teléfono"} · {guest.email || "Sin correo"}
                          </p>
                        </div>
                        <span className="w-fit rounded-full bg-[#f8f5f2] px-4 py-2 text-sm text-neutral-600">
                          Máximo {guest.max_guests} {guest.max_guests === 1 ? "pase" : "pases"}
                        </span>
                      </div>

                      {guest.notes && (
                        <p className="mt-4 text-sm text-neutral-600">{guest.notes}</p>
                      )}

                      <div className="mt-5 border-t border-neutral-100 pt-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                          Enlace individual
                        </p>
                        <Link
                          href={invitationPath}
                          className="mt-2 block break-all text-sm underline decoration-neutral-300 underline-offset-4 transition hover:decoration-black"
                        >
                          {invitationPath}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
