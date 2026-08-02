import WeddingDressCode from "@/components/wedding-demo/WeddingDressCode";
import WeddingGallery from "@/components/wedding-demo/WeddingGallery";
import WeddingHero from "@/components/wedding-demo/WeddingHero";
import WeddingItinerary from "@/components/wedding-demo/WeddingItinerary";
import WeddingLocations from "@/components/wedding-demo/WeddingLocations";
import WeddingMusicPlayer from "@/components/wedding-demo/WeddingMusicPlayer";
import WeddingRSVP from "@/components/wedding-demo/WeddingRSVP";
import { supabase } from "@/lib/supabase";
import { InviteEvent } from "@/types/event";
import { notFound } from "next/navigation";

type InvitationPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    guest?: string | string[];
  }>;
};

type PublicGuestInvitation = {
  full_name: string;
  max_guests: number;
};

export default async function InvitationPage({
  params,
  searchParams,
}: InvitationPageProps) {
  const { slug } = await params;
  const { guest: guestParameter } = await searchParams;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const event = data as InviteEvent;
  const guestToken =
    typeof guestParameter === "string" && guestParameter.trim()
      ? guestParameter.trim()
      : null;

  let guestInvitation: PublicGuestInvitation | null = null;
  let invalidGuestLink = guestParameter !== undefined && !guestToken;

  if (guestToken) {
    const { data: guestData, error: guestError } = await supabase
      .rpc("get_public_guest_invitation", {
        p_event_slug: slug,
        p_guest_token: guestToken,
      })
      .maybeSingle();

    if (guestError) {
      console.error("No se pudo validar el enlace del invitado:", guestError);
      invalidGuestLink = true;
    } else if (guestData) {
      guestInvitation = guestData as PublicGuestInvitation;
    } else {
      invalidGuestLink = true;
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f1ea] text-neutral-900">
      <WeddingMusicPlayer musicUrl={event.music_url} />

      {guestInvitation && (
        <div className="px-6 pt-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white/80 px-6 py-5 text-center shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Invitación para
            </p>
            <p className="mt-2 text-2xl">{guestInvitation.full_name}</p>
          </div>
        </div>
      )}

      {invalidGuestLink && (
        <div className="px-6 pt-8">
          <p className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-800">
            Este enlace personalizado no es válido. Puedes consultar la
            invitación general y confirmar tu asistencia normalmente.
          </p>
        </div>
      )}

      <WeddingHero event={event} />
      <WeddingLocations event={event} />
      <WeddingItinerary />
      <WeddingDressCode event={event} />
      <WeddingGallery />
      <WeddingRSVP
        key={guestToken ?? "public-invitation"}
        eventSlug={event.slug}
        initialFullName={guestInvitation?.full_name}
        maxGuests={guestInvitation?.max_guests}
      />
    </main>
  );
}
