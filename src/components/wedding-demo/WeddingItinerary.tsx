const itinerary = [
  { time: "4:00 PM", title: "Ceremonia religiosa" },
  { time: "6:00 PM", title: "Sesión de fotos" },
  { time: "7:00 PM", title: "Recepción" },
  { time: "8:00 PM", title: "Cena" },
  { time: "9:00 PM", title: "Primer baile" },
  { time: "10:00 PM", title: "Fiesta" },
];

export default function WeddingItinerary() {
  return (
    <section className="bg-[#f8f1ea] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Programa
          </p>

          <h2 className="text-4xl md:text-6xl">Itinerario del día</h2>
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
  );
}