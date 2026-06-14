import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
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

        <p className="mt-8 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}