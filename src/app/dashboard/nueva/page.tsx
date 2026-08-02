import NewInvitationForm from "@/components/dashboard/NewInvitationForm";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewInvitationPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-6 py-10 text-neutral-900">
      <section className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              INVITEA
            </p>

            <h1 className="mt-2 text-4xl md:text-5xl">
              Crear nueva invitación
            </h1>

            <p className="mt-3 max-w-2xl text-neutral-600">
              Agrega la información inicial de tu evento. Podrás administrar
              sus confirmaciones después de crearlo.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
          >
            Volver al panel
          </Link>
        </div>

        <NewInvitationForm />

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
