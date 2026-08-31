export default function Footer() {
  return (
    <footer className="bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-4xl">INVITEA</h2>

            <p className="max-w-md text-neutral-400">
              Plataforma web de invitaciones digitales premium para bodas,
              bautizos, XV años, aniversarios y eventos especiales.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              By MiguelZefe
            </p>

            <a
              href="mailto:contacto@invitea.mx"
              className="text-neutral-300 transition hover:text-white"
            >
              Contacto por correo
            </a>

            <span className="text-neutral-400">
              WhatsApp próximamente
            </span>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-sm text-neutral-500">
          © 2026 INVITEA. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
