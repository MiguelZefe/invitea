import BabyShowerInvitation from "@/components/baby-shower/BabyShowerInvitation";
import BabyVoiceMessage from "@/components/baby-shower/BabyVoiceMessage";
import DemoRSVP from "@/components/wedding-demo/DemoRSVP";
import {
  LIAM_BABY_SHOWER_PHOTO,
  liamBabyShowerEvent,
} from "@/content/liam-baby-shower";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Baby shower de Liam Alejandro | INVITEA",
  },
  description:
    "Invitación al baby shower de Liam Alejandro en Jardín Crisálida.",
};

export default function BabyShowerDemoPage() {
  return (
    <main className="min-h-screen bg-[#fffaf6]">
      <BabyVoiceMessage
        audioUrl="/audio/liam-alejandro.mp3"
        storageKey="liam-alejandro-demo"
      />
      <BabyShowerInvitation
        event={liamBabyShowerEvent}
        photoUrl={LIAM_BABY_SHOWER_PHOTO}
      >
        <DemoRSVP theme="baby" />
      </BabyShowerInvitation>
    </main>
  );
}
