import DemoRSVP from "@/components/wedding-demo/DemoRSVP";
import DemoGallery from "@/components/wedding-demo/DemoGallery";
import WeddingDressCode from "@/components/wedding-demo/WeddingDressCode";
import WeddingHero from "@/components/wedding-demo/WeddingHero";
import WeddingItinerary from "@/components/wedding-demo/WeddingItinerary";
import WeddingLocations from "@/components/wedding-demo/WeddingLocations";
import WeddingMusicPlayer from "@/components/wedding-demo/WeddingMusicPlayer";
import type { InviteEvent } from "@/types/event";
import type { Metadata } from "next";
import { googleMapsSearchLink } from "@/lib/google-maps";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    absolute: "Demo de invitación | INVITEA",
  },
  description:
    "Demostración pública de una invitación digital creada con INVITEA.",
};

const demoEvent: InviteEvent = {
  id: "demo-invitea",
  slug: "demo",
  event_type: "Boda de demostración",
  title: "El comienzo de nuestra historia",
  subtitle:
    "Nos encantará compartir contigo una celebración llena de momentos inolvidables.",
  main_names: "Mariana & Sebastián",
  event_date: "Sábado 17 de octubre de 2026",
  hero_label: "Una celebración de demostración",
  ceremony_place: "Jardín de los Olivos",
  ceremony_time: "4:00 PM",
  ceremony_address: "Salón principal",
  ceremony_maps_url: googleMapsSearchLink("Jardín de los Olivos salón de eventos, Ciudad de México (lugar ficticio)"),
  reception_place: "Terraza Aurora",
  reception_time: "7:00 PM",
  reception_address: "Terraza y salón de eventos",
  reception_maps_url: googleMapsSearchLink("Terraza Aurora salón de eventos, Ciudad de México (lugar ficticio)"),
  dress_code: "Formal elegante",
  dress_code_description:
    "Traje oscuro y vestido largo o midi en la paleta que prefieras.",
  music_url: "/music/demo-wedding.mp3",
  created_at: "2026-01-01T00:00:00.000Z",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#f8f1ea] text-neutral-900">
      <div className="fixed left-4 top-4 z-40">
        <Link href="/" className="rounded-full border border-neutral-300 bg-white/90 px-4 py-2 text-sm shadow-sm backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">Volver a ZefeInvita</Link>
      </div>
      <WeddingMusicPlayer musicUrl={demoEvent.music_url} />
      <WeddingHero event={demoEvent} />
      <WeddingLocations event={demoEvent} />
      <WeddingItinerary />
      <WeddingDressCode event={demoEvent} />
      <DemoGallery />
      <DemoRSVP />
      <p className="bg-white px-6 pb-10 text-center text-sm text-neutral-600">Demostración con datos ficticios. La asistencia solo se simula en esta página; no se envía ni guarda.</p>
    </main>
  );
}
