import { liamBabyShowerEvent } from "@/content/liam-baby-shower";
import { buildInvitationMetadata } from "@/lib/invitation-presentation";
import { supabase } from "@/lib/supabase";
import type { InviteEvent } from "@/types/event";
import type { Metadata } from "next";
import { cache } from "react";

export type GuestParameter = string | string[] | undefined;

type PublicEventResult = {
  event: InviteEvent | null;
  available: boolean;
};

export type PublicGuestResult =
  | { status: "general" }
  | { status: "invalid" }
  | { status: "unavailable" }
  | { status: "valid"; token: string; fullName: string; maxGuests: number };

// List the invitation fields explicitly so owner information is never loaded.
const PUBLIC_EVENT_FIELDS = [
  "id", "slug", "event_type", "title", "subtitle", "main_names", "event_date",
  "hero_label", "ceremony_place", "ceremony_time", "ceremony_address",
  "ceremony_maps_url", "reception_place", "reception_time", "reception_address",
  "reception_maps_url", "dress_code", "dress_code_description", "music_url", "created_at",
].join(",");

// React cache deduplicates metadata and page reads within a single render.
export const getPublicEvent = cache(async (slug: string): Promise<PublicEventResult> => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(PUBLIC_EVENT_FIELDS)
      .eq("slug", slug)
      .abortSignal(AbortSignal.timeout(8_000))
      .maybeSingle();

    if (!error) {
      return { event: data as InviteEvent | null, available: true };
    }
  } catch {
    // A temporary network failure must not hide Liam's date, map or media.
  }

  return {
    event: slug === liamBabyShowerEvent.slug ? liamBabyShowerEvent : null,
    available: false,
  };
});

export async function getPublicGuest(
  slug: string,
  parameter: GuestParameter,
): Promise<PublicGuestResult> {
  if (parameter === undefined) return { status: "general" };
  if (typeof parameter !== "string" || !parameter.trim()) return { status: "invalid" };

  const token = parameter.trim();
  try {
    const { data, error } = await supabase
      .rpc("get_public_guest_invitation", {
        p_event_slug: slug,
        p_guest_token: token,
      })
      .abortSignal(AbortSignal.timeout(8_000))
      .maybeSingle();

    if (error) return { status: "unavailable" };
    if (!data) return { status: "invalid" };
    const publicGuest = data as { full_name?: unknown; max_guests?: unknown };
    if (
      typeof publicGuest.full_name !== "string" || !publicGuest.full_name.trim() ||
      typeof publicGuest.max_guests !== "number" ||
      !Number.isInteger(publicGuest.max_guests) || publicGuest.max_guests < 1
    ) {
      return { status: "unavailable" };
    }

    return { status: "valid", token, fullName: publicGuest.full_name, maxGuests: publicGuest.max_guests };
  } catch {
    return { status: "unavailable" };
  }
}

export async function getPublicInvitationMetadata(
  slug: string,
  guestParameter: GuestParameter,
): Promise<Metadata> {
  const { event } = await getPublicEvent(slug);
  return event
    ? buildInvitationMetadata(event, guestParameter !== undefined)
    : { title: "Invitación no disponible", robots: { index: false, follow: false } };
}
