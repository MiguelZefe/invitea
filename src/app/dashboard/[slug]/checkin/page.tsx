import CheckInPanel from "@/components/dashboard/CheckInPanel";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type CheckInPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("main_names")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("No se pudo cargar el evento para check-in:", error);
  }

  if (error || !event) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-6 py-10 text-neutral-900">
      <section className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              INVITEA · Check-in
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl">{event.main_names}</h1>
            <p className="mt-3 text-neutral-600">
              Valida el acceso de tus invitados en la entrada del evento.
            </p>
          </div>

          <Link
            href={`/dashboard/${slug}`}
            className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
          >
            Volver al evento
          </Link>
        </header>

        <CheckInPanel slug={slug} />

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
