import WeddingDressCode from "@/components/wedding-demo/WeddingDressCode";
import WeddingGallery from "@/components/wedding-demo/WeddingGallery";
import WeddingHero from "@/components/wedding-demo/WeddingHero";
import WeddingItinerary from "@/components/wedding-demo/WeddingItinerary";
import WeddingLocations from "@/components/wedding-demo/WeddingLocations";
import WeddingRSVP from "@/components/wedding-demo/WeddingRSVP";
import WeddingMusicPlayer from "@/components/wedding-demo/WeddingMusicPlayer";

export default function DemoBodaPage() {
  return (
    <main className="min-h-screen bg-[#f8f1ea] text-neutral-900">
      <WeddingMusicPlayer />
      <WeddingHero />
      <WeddingLocations />
      <WeddingItinerary />
      <WeddingDressCode />
      <WeddingGallery />
      <WeddingRSVP />
    </main>
  );
}