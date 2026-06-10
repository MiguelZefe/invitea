const eventLocations = [
  {
    title: "Ceremonia religiosa",
    place: "Parroquia San Miguel Arcángel",
    time: "4:00 PM",
    address: "Centro Histórico, Ciudad de México",
    mapsUrl: "https://maps.google.com",
  },
  {
    title: "Recepción",
    place: "Jardín Las Flores",
    time: "7:00 PM",
    address: "Coyoacán, Ciudad de México",
    mapsUrl: "https://maps.google.com",
  },
];

const itinerary = [
  {
    time: "4:00 PM",
    title: "Ceremonia religiosa",
  },
  {
    time: "6:00 PM",
    title: "Sesión de fotos",
  },
  {
    time: "7:00 PM",
    title: "Recepción",
  },
  {
    time: "8:00 PM",
    title: "Cena",
  },
  {
    time: "9:00 PM",
    title: "Primer baile",
  },
  {
    time: "10:00 PM",
    title: "Fiesta",
  },
];

const gallery = [
  "https://images.unsplash.com/photo-1519741497674-611481863552",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
];

export default function DemoBodaPage() {
  return (
    <main className="min-h-screen bg-[#f8f1ea] text-neutral-900">
      <section className="flex min-h-screen items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl">
          <p className="mb-6 text-sm uppercase tracking-[0.4em] text-neutral-500">
            Nuestra boda
          </p>

          <h1 className="mb-6 text-6xl leading-tight md:text-8xl">
            María
            <br />
            &
            <br />
            Alejandro
          </h1>

          <p className="mb-10 text-xl text-neutral-600">
            Sábado 24 de agosto de 2026
          </p>

          <div className="mx-auto mb-10 grid max-w-xl grid-cols-4 gap-3">
            {[
              { value: "120", label: "Días" },
              { value: "08", label: "Horas" },
              { value: "45", label: "Min" },
              { value: "12", label: "Seg" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl bg-white/80 p-4 shadow-sm"
              >
                <p className="text-2xl font-semibold">{item.value}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <a
            href="#asistencia"
            className="inline-block rounded-full bg-black px-8 py-4 text-white transition hover:opacity-90"
          >
            Confirmar asistencia
          </a>

          <p className="mt-12 text-xs uppercase tracking-[0.3em] text-neutral-400">
            By MiguelZefe
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Acompáñanos
          </p>

          <h2 className="mb-14 text-4xl md:text-6xl">
            Lugares del evento
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {eventLocations.map((location) => (
              <article
                key={location.title}
                className="rounded-[2rem] border border-neutral-200 bg-[#f8f1ea] p-8 shadow-sm"
              >
                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-neutral-500">
                  {location.title}
                </p>

                <h3 className="mb-4 text-3xl">{location.place}</h3>

                <p className="mb-2 text-neutral-600">
                  {location.time}
                </p>

                <p className="mb-8 text-neutral-600">
                  {location.address}
                </p>

                <a
                  href={location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full bg-black px-6 py-3 text-white transition hover:opacity-90"
                >
                  Ver ubicación
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f1ea] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
              Programa
            </p>

            <h2 className="text-4xl md:text-6xl">
              Itinerario del día
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {itinerary.map((item) => (
              <div
                key={`${item.time}-${item.title}`}
                className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm"
              >
                <p className="font-semibold">{item.time}</p>
                <p className="text-neutral-600">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Dress code
          </p>

          <h2 className="mb-6 text-4xl md:text-6xl">
            Elegante formal
          </h2>

          <p className="text-lg leading-8 text-neutral-600">
            Queremos que disfrutes este día tan especial con nosotros.
            Te sugerimos vestir en tonos neutros, elegantes y evitar el color blanco.
          </p>
        </div>
      </section>

      <section className="bg-[#f8f1ea] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
              Recuerdos
            </p>

            <h2 className="text-4xl md:text-6xl">
              Nuestra historia
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {gallery.map((image) => (
              <div
                key={image}
                className="h-96 overflow-hidden rounded-[2rem] bg-neutral-200 shadow-sm"
              >
                <img
                  src={`${image}?auto=format&fit=crop&w=900&q=80`}
                  alt="Foto de la pareja"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
            By MiguelZefe
          </p>
        </div>
      </section>
    </main>
  );
}