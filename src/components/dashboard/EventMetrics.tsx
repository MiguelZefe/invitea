type EventMetricsProps = {
  totalGuests: number;
  confirmedGuests: number;
  declinedGuests: number;
  pendingGuests: number;
  checkedInGuests: number;
  checkedOutGuests: number;
  responseRate: number;
  confirmationRate: number;
  totalPasses: number;
  confirmedPeople: number;
  checkedInPeople: number;
  attendanceRate: number;
};

type MetricCardProps = {
  label: string;
  value: number;
  percentage?: boolean;
};

function MetricCard({ label, value, percentage = false }: MetricCardProps) {
  const formattedValue = percentage
    ? `${value.toFixed(1)}%`
    : new Intl.NumberFormat("es-MX").format(value);

  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm">
      <p className="text-4xl font-semibold tracking-tight">{formattedValue}</p>
      <p className="mt-2 text-sm text-neutral-500">{label}</p>
    </article>
  );
}

export default function EventMetrics({
  totalGuests,
  confirmedGuests,
  declinedGuests,
  pendingGuests,
  checkedInGuests,
  checkedOutGuests,
  responseRate,
  confirmationRate,
  totalPasses,
  confirmedPeople,
  checkedInPeople,
  attendanceRate,
}: EventMetricsProps) {
  return (
    <section className="mb-8 space-y-6" aria-labelledby="event-metrics-title">
      <div className="sr-only" id="event-metrics-title">
        Métricas del evento
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              Invitados
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Registros principales de la lista del evento.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Registrados" value={totalGuests} />
          <MetricCard label="Confirmados" value={confirmedGuests} />
          <MetricCard label="Rechazados" value={declinedGuests} />
          <MetricCard label="Pendientes" value={pendingGuests} />
          <MetricCard label="Con entrada registrada" value={checkedInGuests} />
          <MetricCard label="Con salida" value={checkedOutGuests} />
          <MetricCard label="Respuesta" value={responseRate} percentage />
          <MetricCard
            label="Confirmación"
            value={confirmationRate}
            percentage
          />
        </div>
      </div>

      <div className="rounded-[2rem] bg-neutral-900 p-5 text-white md:p-6">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">
            Personas
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            Asistentes totales, incluyendo acompañantes y pases.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white/10 p-6">
            <p className="text-4xl font-semibold tracking-tight">{totalPasses}</p>
            <p className="mt-2 text-sm text-neutral-300">Pases disponibles</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <p className="text-4xl font-semibold tracking-tight">
              {confirmedPeople}
            </p>
            <p className="mt-2 text-sm text-neutral-300">
              Personas confirmadas
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <p className="text-4xl font-semibold tracking-tight">
              {checkedInPeople}
            </p>
            <p className="mt-2 text-sm text-neutral-300">Personas dentro</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <p className="text-4xl font-semibold tracking-tight">
              {attendanceRate.toFixed(1)}%
            </p>
            <p className="mt-2 text-sm text-neutral-300">
              Ocupación confirmada
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
