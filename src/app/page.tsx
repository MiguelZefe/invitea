import DashboardPreview from "@/components/DashboardPreview";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import InvitationMockup from "@/components/InvitationMockup";
import Navbar from "@/components/Navbar";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <InvitationMockup />
      <DashboardPreview />
      <Pricing />
    </main>
  );
}