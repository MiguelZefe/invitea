import BabyShowerInvitation from "@/components/baby-shower/BabyShowerInvitation";
import BabyVoiceMessage from "@/components/baby-shower/BabyVoiceMessage";
import WeddingDressCode from "@/components/wedding-demo/WeddingDressCode";
import WeddingGallery from "@/components/wedding-demo/WeddingGallery";
import WeddingHero from "@/components/wedding-demo/WeddingHero";
import WeddingItinerary from "@/components/wedding-demo/WeddingItinerary";
import WeddingLocations from "@/components/wedding-demo/WeddingLocations";
import WeddingMusicPlayer from "@/components/wedding-demo/WeddingMusicPlayer";
import WeddingRSVP from "@/components/wedding-demo/WeddingRSVP";
import { getInvitationPresentation } from "@/lib/invitation-presentation";
import { getPublicEvent, getPublicGuest, type GuestParameter } from "@/lib/public-invitation-data";
import { notFound } from "next/navigation";

type PublicInvitationProps = {
  slug: string;
  guestParameter?: GuestParameter;
};

export default async function PublicInvitation({ slug, guestParameter }: PublicInvitationProps) {
  const { event, available } = await getPublicEvent(slug);

  if (!event) {
    if (available) notFound();
    throw new Error("No se pudo cargar la invitación. Intenta nuevamente.");
  }

  const presentation = getInvitationPresentation(event);
  const isBabyShower = presentation.template === "baby-shower";
  const guest = available
    ? await getPublicGuest(slug, guestParameter)
    : { status: "unavailable" as const };
  const canConfirm = available && (guest.status === "general" || guest.status === "valid");
  const confirmation = canConfirm ? (
    <WeddingRSVP
      key={guest.status === "valid" ? guest.token : "public-invitation"}
      eventSlug={event.slug}
      eventTitle={event.title}
      whatsappNumber={event.whatsapp_number}
      whatsappPrimary={event.whatsapp_primary}
      initialFullName={guest.status === "valid" ? guest.fullName : undefined}
      maxGuests={guest.status === "valid" ? guest.maxGuests : undefined}
      guestToken={guest.status === "valid" ? guest.token : undefined}
      theme={isBabyShower ? "baby" : "wedding"}
    />
  ) : (
    <section id="asistencia" className="bg-white px-6 py-24 text-center">
      <div className="mx-auto max-w-xl rounded-3xl bg-amber-50 p-6" role="status">
        <h2 className="text-3xl">Confirmación de asistencia</h2>
        <p className="mt-4 leading-relaxed">
          {guest.status === "invalid"
            ? "Este enlace personal no es válido. Solicita a la familia tu enlace actualizado para confirmar con tus pases."
            : "No pudimos cargar la confirmación en este momento. Recarga la página en unos minutos; los detalles de la celebración siguen disponibles."}
        </p>
        {guest.status === "invalid" && (
          <a className="mt-5 inline-block rounded-full border px-6 py-3 underline underline-offset-4" href={presentation.canonicalPath}>
            Ver invitación general
          </a>
        )}
      </div>
    </section>
  );

  return (
    <main className={`min-h-screen pb-24 text-neutral-900 ${isBabyShower ? "bg-[#fffaf6]" : "bg-[#f8f1ea]"}`}>
      {presentation.voiceUrl && presentation.voiceStorageKey ? (
        <BabyVoiceMessage audioUrl={presentation.voiceUrl} storageKey={presentation.voiceStorageKey} />
      ) : (
        <WeddingMusicPlayer musicUrl={event.music_url} theme={isBabyShower ? "baby" : "wedding"} />
      )}

      {guest.status === "valid" && (
        <div className="px-6 pt-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white/80 px-6 py-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Invitación para</p>
            <p className="mt-2 text-2xl">{guest.fullName}</p>
            <p className="mt-2 text-sm text-neutral-600">
              Hasta {guest.maxGuests} {guest.maxGuests === 1 ? "asistente" : "asistentes"}, incluyéndote.
            </p>
          </div>
        </div>
      )}

      {isBabyShower ? (
        <BabyShowerInvitation
          event={event}
          photoUrl={presentation.photoUrl}
          calendarUrl={presentation.calendarUrl}
          primaryActionLabel={canConfirm ? "Confirmar asistencia" : "Ver estado de confirmación"}
        >
          {confirmation}
        </BabyShowerInvitation>
      ) : (
        <>
          <WeddingHero event={event} />
          <WeddingLocations event={event} />
          <WeddingItinerary />
          <WeddingDressCode event={event} />
          <WeddingGallery />
          {confirmation}
        </>
      )}
    </main>
  );
}
