import { InviteEvent } from "@/types/event";

type WeddingHeroProps = {
  event: InviteEvent;
};

export default function WeddingHero({ event }: WeddingHeroProps) {
  return (
    <section className="flex min-h-screen items-center justify-center px-6 py-20 text-center">
      <div className="max-w-3xl">
        <p className="mb-6 text-sm uppercase tracking-[0.4em] text-neutral-500">
          {event.hero_label}
        </p>

        <h1 className="mb-6 text-6xl leading-tight md:text-8xl">
          {event.main_names}
        </h1>

        <p className="mb-6 text-xl text-neutral-600">
          {event.event_date}
        </p>

        {event.subtitle && (
          <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-600">
            {event.subtitle}
          </p>
        )}

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
  );
}