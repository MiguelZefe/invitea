import type { Metadata } from "next";
import WeddingStory from "@/components/wedding-story/WeddingStory";
import { elizabethAndAlonso } from "@/lib/wedding-story";

export const metadata: Metadata = {
  title: { absolute: "Elizabeth & Alonso · Nuestra boda" },
  description: "Invitación a la boda de Elizabeth y Alonso. Ceremonia el 17 de octubre de 2026 en Tlalpan.",
  robots: { index: false, follow: false },
};

export default function ElizabethAndAlonsoWedding() {
  return <WeddingStory initial={elizabethAndAlonso} />;
}
