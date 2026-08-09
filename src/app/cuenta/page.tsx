import AccountPasswordForm from "@/components/auth/AccountPasswordForm";
import ProfileForm from "@/components/auth/ProfileForm";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "";
  const createdAt = user.created_at
    ? new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(
        new Date(user.created_at)
      )
    : "No disponible";

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-6 py-10 text-neutral-900">
      <section className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              INVITEA
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl">Mi cuenta</h1>
            <p className="mt-3 text-neutral-600">
              Administra tus datos personales y la seguridad de tu cuenta.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
          >
            Volver al dashboard
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
              Perfil
            </p>
            <h2 className="mt-3 text-3xl">Datos de la cuenta</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Actualiza el nombre que utilizamos para identificar tu cuenta.
            </p>

            <div className="mt-8">
              <ProfileForm initialName={fullName} email={user.email ?? "No disponible"} />
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-6">
              <p className="text-sm font-medium">Cuenta creada</p>
              <p className="mt-2 text-sm text-neutral-600">{createdAt}</p>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-neutral-400">
              Seguridad
            </p>
            <h2 className="mt-3 text-3xl">Cambiar contraseña</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Usa una contraseña nueva de al menos 8 caracteres.
            </p>

            <div className="mt-8">
              <AccountPasswordForm />
            </div>
          </section>
        </div>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
