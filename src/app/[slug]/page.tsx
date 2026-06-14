import WeddingDressCode from "@/components/wedding-demo/WeddingDressCode";
import WeddingGallery from "@/components/wedding-demo/WeddingGallery";
import WeddingHero from "@/components/wedding-demo/WeddingHero";
import WeddingItinerary from "@/components/wedding-demo/WeddingItinerary";
import WeddingLocations from "@/components/wedding-demo/WeddingLocations";
import WeddingMusicPlayer from "@/components/wedding-demo/WeddingMusicPlayer";
import WeddingRSVP from "@/components/wedding-demo/WeddingRSVP";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

type InvitationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function InvitationPage({
  params,
}: InvitationPageProps) {
  const { slug } = await params;

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !event) {
    notFound();
  }

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