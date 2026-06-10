const stats = [
  {
    label: "Invitados",
    value: "180",
  },
  {
    label: "Confirmados",
    value: "126",
  },
  {
    label: "Pendientes",
    value: "42",
  },
  {
    label: "No asistirán",
    value: "12",
  },
];

const guests = [
  {
    name: "Familia López",
    passes: "4 pases",
    status: "Confirmado",
  },
  {
    name: "Ana Martínez",
    passes: "2 pases",
    status: "Pendiente",
  },
  {
    name: "Carlos Ruiz",
    passes: "1 pase",
    status: "No asistirá",
  },
];

export default function DashboardPreview() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
            Dashboard del comprador
          </p>

          <h2 className="mb-6 text-4xl md:text-6xl">
            Control total de tus invitados.
          </h2>

          <p className="text-lg leading-8 text-neutral-600">
            Cada cliente podrá administrar confirmaciones, pases,
            invitados pendientes y mensajes desde un panel privado,
            simple y elegante.
          </p>
        </div>

        <div className="rounded-[2rem] border border-neutral-200 bg-[#f8f5f2] p-6 shadow-xl md:p-10">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                Evento activo
              </p>
              <h3 className="mt-2 text-3xl">Boda María & Alejandro</h3>
            </div>

            <button className="rounded-full bg-black px-6 py-3 text-sm text-white">
              Compartir invitación
            </button>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl bg-white p-6">
                <p className="text-3xl font-semibold">{stat.value}</p>
                <p className="mt-2 text-sm text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-2xl">Lista de invitados</h4>
              <span className="text-sm text-neutral-500">
                Actualizado hoy
              </span>
            </div>

            <div className="space-y-4">
              {guests.map((guest) => (
                <div
                  key={guest.name}
                  className="grid gap-2 rounded-2xl border border-neutral-100 p-4 md:grid-cols-3"
                >
                  <p className="font-medium">{guest.name}</p>
                  <p className="text-neutral-500">{guest.passes}</p>
                  <p className="text-neutral-700">{guest.status}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs tracking-[0.25em] text-neutral-400">
            By MiguelZefe
          </p>
        </div>
      </div>
    </section>
  );
}