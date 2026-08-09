import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const { error } = await searchParams;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] px-6">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-neutral-500">
          INVITEA
        </p>

        <h1 className="mb-3 text-4xl">Acceso comprador</h1>

        <p className="mb-8 text-neutral-600">
          Inicia sesión para administrar tus invitaciones y confirmaciones.
        </p>

        <LoginForm />

        <p className="mt-5 text-center text-sm">
          <Link
            href="/recuperar-password"
            className="text-neutral-600 underline-offset-4 hover:text-black hover:underline"
          >
            Olvidé mi contraseña
          </Link>
        </p>

        {error === "confirmacion" && (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            No pudimos confirmar tu correo. El enlace puede haber expirado o ya
            fue utilizado. Intenta iniciar sesión o vuelve a registrarte.
          </p>
        )}

        <p className="mt-6 text-center text-sm text-neutral-600">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-black underline-offset-4 hover:underline">
            Crear cuenta
          </Link>
        </p>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
