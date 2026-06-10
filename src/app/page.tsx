import Features from "@/components/Features";
import Hero from "@/components/Hero";
import InvitationMockup from "@/components/InvitationMockup";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <InvitationMockup />
    </main>
  );
}