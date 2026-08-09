import RecoveryPasswordForm from "@/components/auth/RecoveryPasswordForm";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";

type RecoveryPasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RecoveryPasswordPage({
  searchParams,
}: RecoveryPasswordPageProps) {
  const supabase = await createClient();
  const { error } = await searchParams;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] px-6 py-10">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-neutral-500">
          INVITEA
        </p>

        <h1 className="mb-3 text-4xl">Recupera tu acceso</h1>

        <p className="mb-8 text-neutral-600">
          Escribe tu correo y te enviaremos instrucciones para crear una
          contraseña nueva.
        </p>

        {error === "enlace" && (
          <p
            className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            El enlace de recuperación es inválido, expiró o ya fue utilizado.
            Solicita uno nuevo para continuar.
          </p>
        )}

        <RecoveryPasswordForm />

        <p className="mt-6 text-center text-sm text-neutral-600">
          ¿Recordaste tu contraseña?{" "}
          <Link
            href="/login"
            className="font-medium text-black underline-offset-4 hover:underline"
          >
            Volver al login
          </Link>
        </p>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
