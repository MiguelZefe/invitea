import PublicInvitation from "@/components/PublicInvitation";
import { getPublicInvitationMetadata, type GuestParameter } from "@/lib/public-invitation-data";

type InvitationPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guest?: GuestParameter }>;
};

export async function generateMetadata({ params, searchParams }: InvitationPageProps) {
  const { slug } = await params;
  const { guest } = await searchParams;
  return getPublicInvitationMetadata(slug, guest);
}

export default async function InvitationPage({ params, searchParams }: InvitationPageProps) {
  const { slug } = await params;
  const { guest } = await searchParams;
  return <PublicInvitation slug={slug} guestParameter={guest} />;
}
