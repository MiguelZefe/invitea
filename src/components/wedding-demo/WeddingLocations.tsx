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

export default function WeddingLocations() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
          Acompáñanos
        </p>

        <h2 className="mb-14 text-4xl md:text-6xl">Lugares del evento</h2>

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

              <p className="mb-2 text-neutral-600">{location.time}</p>

              <p className="mb-8 text-neutral-600">{location.address}</p>

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
  );
}