import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] px-6 py-10">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-neutral-500">
          INVITEA
        </p>

        {user ? (
          <>
            <h1 className="mb-3 text-4xl">Nueva contraseña</h1>
            <p className="mb-8 text-neutral-600">
              Elige una contraseña nueva para recuperar el acceso a tu cuenta.
            </p>
            <ResetPasswordForm />
          </>
        ) : (
          <div>
            <h1 className="mb-3 text-4xl">Enlace inválido</h1>
            <p className="text-neutral-600">
              Este enlace de recuperación expiró, ya fue utilizado o no es
              válido. Solicita uno nuevo para continuar.
            </p>
            <Link
              href="/recuperar-password"
              className="mt-8 block rounded-full bg-black px-8 py-4 text-center text-white transition hover:opacity-90"
            >
              Solicitar otro enlace
            </Link>
          </div>
        )}

        <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
