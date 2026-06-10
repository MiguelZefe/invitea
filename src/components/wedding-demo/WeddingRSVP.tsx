export default function WeddingRSVP() {
  return (
    <section id="asistencia" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            RSVP
          </p>

          <h2 className="mb-6 text-4xl md:text-6xl">
            Confirma tu asistencia
          </h2>

          <p className="text-lg text-neutral-600">
            Ayúdanos a preparar todo para recibirte como mereces.
          </p>
        </div>

        <form className="rounded-[2rem] bg-[#f8f1ea] p-8 shadow-sm">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Ej. Ana Martínez"
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">¿Asistirás?</label>
            <select className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black">
              <option>Selecciona una opción</option>
              <option>Sí, asistiré</option>
              <option>No podré asistir</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              Número de asistentes
            </label>
            <input
              type="number"
              min="1"
              placeholder="Ej. 2"
              className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-sm font-medium">
              Mensaje para los novios
            </label>
            <textarea
              rows={5}
              placeholder="Escribe un mensaje especial..."
              className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-5 py-4 outline-none transition focus:border-black"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90"
          >
            Enviar confirmación
          </button>
        </form>

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </div>
    </section>
  );
}