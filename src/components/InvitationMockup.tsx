export default function InvitationMockup() {
  return (
    <section className="bg-[#f8f5f2] px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Experiencia digital
          </p>

          <h2 className="mb-6 text-4xl md:text-6xl">
            Una invitación elegante, interactiva y fácil de compartir.
          </h2>

          <p className="mb-8 text-lg leading-8 text-neutral-600">
            Cada evento tendrá una página única con música, fotos,
            ubicación, cuenta regresiva, confirmación de asistencia
            y un diseño pensado para verse perfecto desde celular.
          </p>

          <button className="rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90">
            Ver ejemplo
          </button>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-sm rounded-[2.5rem] border border-neutral-200 bg-white p-4 shadow-2xl">
            <div className="rounded-[2rem] bg-[#f3ede7] px-6 py-10 text-center">
              <p className="mb-8 text-xs uppercase tracking-[0.3em] text-neutral-500">
                Nuestra boda
              </p>

              <h3 className="mb-4 text-5xl leading-tight">
                María
                <br />
                &
                <br />
                Alejandro
              </h3>

              <p className="mb-8 text-neutral-600">
                Sábado 24 de agosto de 2026
              </p>

              <div className="mb-8 grid grid-cols-4 gap-2">
                {["120", "08", "45", "12"].map((time, index) => (
                  <div
                    key={time}
                    className="rounded-2xl bg-white p-3 shadow-sm"
                  >
                    <p className="text-xl font-semibold">{time}</p>
                    <p className="text-[10px] uppercase text-neutral-500">
                      {["Días", "Hrs", "Min", "Seg"][index]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-left">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-semibold">Ceremonia</p>
                  <p className="text-sm text-neutral-500">
                    Parroquia San Miguel
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-sm font-semibold">Recepción</p>
                  <p className="text-sm text-neutral-500">
                    Jardín Las Flores
                  </p>
                </div>
              </div>

              <button className="mt-8 w-full rounded-full bg-black py-4 text-white">
                Confirmar asistencia
              </button>

              <p className="mt-6 text-xs tracking-[0.25em] text-neutral-400">
                By MiguelZefe
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}