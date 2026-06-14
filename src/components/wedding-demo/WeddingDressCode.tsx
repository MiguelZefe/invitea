import { InviteEvent } from "@/types/event";

type WeddingDressCodeProps = {
  event: InviteEvent;
};

export default function WeddingDressCode({ event }: WeddingDressCodeProps) {
  if (!event.dress_code && !event.dress_code_description) {
    return null;
  }

  return (
    <section className="bg-white px-6 py-24 text-center">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
          Dress code
        </p>

        {event.dress_code && (
          <h2 className="mb-6 text-4xl md:text-6xl">
            {event.dress_code}
          </h2>
        )}

        {event.dress_code_description && (
          <p className="text-lg leading-8 text-neutral-600">
            {event.dress_code_description}
          </p>
        )}
      </div>
    </section>
  );
}