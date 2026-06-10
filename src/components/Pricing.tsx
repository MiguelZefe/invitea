const plans = [
  {
    name: "Básica",
    price: "$299 MXN",
    description: "Ideal para eventos pequeños y una invitación sencilla.",
    features: [
      "Invitación digital",
      "Diseño prediseñado",
      "Fecha y ubicación",
      "Enlace de Google Maps",
      "Música de fondo",
      "Confirmación básica",
    ],
    highlight: false,
  },
  {
    name: "Premium",
    price: "$599 MXN",
    description: "La mejor opción para bodas, XV años y eventos completos.",
    features: [
      "Todo lo de Básica",
      "Dashboard del comprador",
      "Lista de invitados",
      "Pases por familia",
      "Código QR",
      "Galería de fotos",
      "Mensajes de invitados",
    ],
    highlight: true,
  },
  {
    name: "Personalizada",
    price: "Desde $1,500 MXN",
    description: "Para clientes que quieren una experiencia única.",
    features: [
      "Diseño exclusivo",
      "Animaciones personalizadas",
      "Secciones especiales",
      "Ajustes visuales avanzados",
      "Soporte personalizado",
      "Entrega premium",
    ],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section className="bg-[#f8f5f2] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Planes
          </p>

          <h2 className="text-4xl md:text-6xl">
            Elige cómo quieres compartir tu evento.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-[2rem] border p-8 ${
                plan.highlight
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white text-black"
              }`}
            >
              {plan.highlight && (
                <p className="mb-4 inline-block rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-black">
                  Más popular
                </p>
              )}

              <h3 className="mb-3 text-3xl">{plan.name}</h3>

              <p
                className={`mb-6 ${
                  plan.highlight ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                {plan.description}
              </p>

              <p className="mb-8 text-4xl font-semibold">
                {plan.price}
              </p>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={
                      plan.highlight ? "text-neutral-200" : "text-neutral-600"
                    }
                  >
                    ✓ {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded-full px-6 py-4 transition ${
                  plan.highlight
                    ? "bg-white text-black hover:opacity-90"
                    : "bg-black text-white hover:opacity-90"
                }`}
              >
                Solicitar plan
              </button>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-neutral-500">
          Precios iniciales sujetos a cambios conforme evolucione el producto.
        </p>
      </div>
    </section>
  );
}