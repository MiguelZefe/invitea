import BabyShowerInvitation from "@/components/baby-shower/BabyShowerInvitation";
import BabyVoiceMessage from "@/components/baby-shower/BabyVoiceMessage";
import {
  LIAM_BABY_SHOWER_CALENDAR,
  LIAM_BABY_SHOWER_PHOTO,
  liamBabyShowerEvent,
} from "@/content/liam-baby-shower";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Baby shower de Liam Alejandro",
  },
  description:
    "Acompáñanos al baby shower de Liam Alejandro el sábado 19 de septiembre de 2026 a las 3:00 p. m. en Jardín Crisálida.",
  openGraph: {
    title: "Baby shower de Liam Alejandro",
    description:
      "Sábado 19 de septiembre de 2026 a las 3:00 p. m. en Jardín Crisálida.",
    type: "website",
    locale: "es_MX",
  },
};

export default function LiamAlejandroInvitationPage() {
  return (
    <main className="min-h-screen bg-[#fffaf6]">
      <BabyVoiceMessage
        audioUrl="/audio/liam-alejandro.mp3"
        storageKey="liam-alejandro"
      />
      <BabyShowerInvitation
        event={liamBabyShowerEvent}
        photoUrl={LIAM_BABY_SHOWER_PHOTO}
        calendarUrl={LIAM_BABY_SHOWER_CALENDAR}
        primaryActionHref="#detalles"
        primaryActionLabel="Ver detalles"
      />
    </main>
  );
}
