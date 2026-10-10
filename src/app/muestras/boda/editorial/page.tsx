import type { Metadata } from "next";
import WeddingStory from "@/components/wedding-story/WeddingStory";
import { editorialWeddingSample } from "@/lib/wedding-story";

export const metadata: Metadata = {
  title: { absolute: "Plantilla editorial de boda · ZefeInvita" },
  description: "Explora y personaliza una plantilla editorial de boda con datos ficticios.",
};

export default function EditorialWeddingSample() {
  return <WeddingStory initial={editorialWeddingSample} isSample />;
}
