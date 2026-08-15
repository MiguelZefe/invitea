import RegisterForm from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase-server";
import Link from "next/link";
import { redirect } from "next/navigation";

type RegisterPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const supabase = await createClient();
  const { next } = await searchParams;
  const nextPath = next === "/dashboard/nueva" ? next : undefined;
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath ?? "/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f5f2] px-6 py-10">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-neutral-500">INVITEA</p>
        <h1 className="mb-3 text-4xl">Crea tu cuenta</h1>
        <p className="mb-8 text-neutral-600">Regístrate para crear y administrar tus invitaciones digitales.</p>
        <RegisterForm nextPath={nextPath} />
        <p className="mt-6 text-center text-sm text-neutral-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            href={
              nextPath
                ? `/login?next=${encodeURIComponent(nextPath)}`
                : "/login"
            }
            className="font-medium text-black underline-offset-4 hover:underline"
          >
            Ya tengo cuenta
          </Link>
        </p>
        <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">By MiguelZefe</p>
      </section>
    </main>
  );
}
