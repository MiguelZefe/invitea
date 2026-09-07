import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex min-h-[100svh] items-center justify-center bg-[#f8f5f2] px-5 pt-32 pb-16 sm:px-6 sm:py-32">
      <div className="w-full max-w-5xl text-center">
        <p className="mb-6 text-xs leading-loose uppercase tracking-[0.28em] text-neutral-500 sm:text-sm sm:tracking-[0.4em]">
          Invitaciones digitales premium
        </p>

        <h1 className="mb-8 text-5xl leading-[1.08] sm:text-6xl md:text-8xl">
          Diseña momentos
          <br />
          inolvidables.
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          Crea invitaciones elegantes para bodas, XV años,
          bautizos y eventos especiales con RSVP, música,
          mapas y dashboard inteligente.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          <Link
            href="/dashboard/nueva"
            className="w-full max-w-xs rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90 sm:w-auto"
          >
            Crear invitación
          </Link>

          <Link
            href="/demo"
            className="w-full max-w-xs rounded-full border border-black px-8 py-4 transition hover:bg-black hover:text-white sm:w-auto"
          >
            Ver demo
          </Link>

          <Link
            href="/demo/baby-shower"
            className="w-full max-w-xs rounded-full border border-[#746072] px-8 py-4 text-[#675264] transition hover:bg-[#746072] hover:text-white sm:w-auto"
          >
            Ver baby shower
          </Link>
        </div>
      </div>
    </section>
  );
}
