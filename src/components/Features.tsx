const features = [
  {
    title: "Invitaciones personalizadas",
    description:
      "Diseños elegantes para bodas, bautizos, XV años, aniversarios y eventos especiales.",
  },
  {
    title: "Confirmación de asistencia",
    description:
      "Tus invitados podrán confirmar si asistirán, cuántos pases usarán y dejar un mensaje.",
  },
  {
    title: "Dashboard para clientes",
    description:
      "Cada comprador podrá controlar invitados, confirmaciones, pendientes y estadísticas.",
  },
  {
    title: "Ubicaciones inteligentes",
    description:
      "Agrega enlaces directos a Google Maps para misa, recepción o cualquier punto del evento.",
  },
  {
    title: "Música y galería",
    description:
      "Incluye música de fondo, fotos especiales y una experiencia visual memorable.",
  },
  {
    title: "Link y QR compartible",
    description:
      "Comparte la invitación fácilmente por WhatsApp, redes sociales o código QR.",
  },
];

export default function Features() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Todo en un solo lugar
          </p>

          <h2 className="text-4xl md:text-6xl">
            Más que una invitación.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-neutral-200 bg-[#faf7f3] p-8"
            >
              <h3 className="mb-4 text-2xl">{feature.title}</h3>

              <p className="text-neutral-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}