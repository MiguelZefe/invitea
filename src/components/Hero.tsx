import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#f8f5f2] px-6">
      <div className="max-w-5xl text-center">
        <p className="uppercase tracking-[0.4em] text-sm mb-6 text-neutral-500">
          Invitaciones digitales premium
        </p>

        <h1 className="text-6xl md:text-8xl leading-tight mb-8">
          Diseña momentos
          <br />
          inolvidables.
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-neutral-600 mb-10">
          Crea invitaciones elegantes para bodas, XV años,
          bautizos y eventos especiales con RSVP, música,
          mapas y dashboard inteligente.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard/nueva"
            className="bg-black text-white px-8 py-4 rounded-full hover:opacity-90 transition"
          >
            Crear invitación
          </Link>

          <Link
            href="/demo"
            className="border border-black px-8 py-4 rounded-full hover:bg-black hover:text-white transition"
          >
            Ver demo
          </Link>

          <Link
            href="/demo/baby-shower"
            className="border border-[#746072] px-8 py-4 rounded-full text-[#675264] hover:bg-[#746072] hover:text-white transition"
          >
            Ver baby shower
          </Link>
        </div>
      </div>
    </section>
  );
}
