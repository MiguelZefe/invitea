const gallery = [
  "https://images.unsplash.com/photo-1519741497674-611481863552",
  "https://images.unsplash.com/photo-1523438885200-e635ba2c371e",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
];

export default function WeddingGallery() {
  return (
    <section className="bg-[#f8f1ea] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Recuerdos
          </p>

          <h2 className="text-4xl md:text-6xl">Nuestra historia</h2>
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
  );
}