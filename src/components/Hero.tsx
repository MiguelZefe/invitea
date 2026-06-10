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

        <div className="flex items-center justify-center gap-4">
          <button className="bg-black text-white px-8 py-4 rounded-full hover:opacity-90 transition">
            Crear invitación
          </button>

          <button className="border border-black px-8 py-4 rounded-full hover:bg-black hover:text-white transition">
            Ver demo
          </button>
        </div>
      </div>
    </section>
  );
}