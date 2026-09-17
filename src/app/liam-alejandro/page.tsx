import PublicInvitation from "@/components/PublicInvitation";
import { liamBabyShowerEvent } from "@/content/liam-baby-shower";
import { getPublicInvitationMetadata, type GuestParameter } from "@/lib/public-invitation-data";

type LiamPageProps = {
  searchParams: Promise<{ guest?: GuestParameter }>;
};

export async function generateMetadata({ searchParams }: LiamPageProps) {
  const { guest } = await searchParams;
  return getPublicInvitationMetadata(liamBabyShowerEvent.slug, guest);
}

export default async function LiamAlejandroInvitationPage({ searchParams }: LiamPageProps) {
  const { guest } = await searchParams;
  return <PublicInvitation slug={liamBabyShowerEvent.slug} guestParameter={guest} />;
}
