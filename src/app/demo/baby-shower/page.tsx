import BabyShowerInvitation from "@/components/baby-shower/BabyShowerInvitation";
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
      <BabyShowerInvitation
        event={liamBabyShowerEvent}
        photoUrl={LIAM_BABY_SHOWER_PHOTO}
      >
        <DemoRSVP theme="baby" />
      </BabyShowerInvitation>
    </main>
  );
}
