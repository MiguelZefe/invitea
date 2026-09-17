import {
  LIAM_BABY_SHOWER_CALENDAR,
  LIAM_BABY_SHOWER_PHOTO,
  liamBabyShowerEvent,
} from "@/content/liam-baby-shower";
import { getInvitationTemplate } from "@/lib/event-template";
import type { InviteEvent } from "@/types/event";
import type { Metadata } from "next";

const PUBLIC_ORIGIN = "https://www.zefeinvita.com.mx";

export function getInvitationPresentation(event: InviteEvent) {
  const isLiam = event.slug === liamBabyShowerEvent.slug;

  return {
    template: isLiam ? "baby-shower" : getInvitationTemplate(event.event_type),
    canonicalPath: isLiam ? "/liam-alejandro" : `/invitacion/${encodeURIComponent(event.slug)}`,
    photoUrl: isLiam ? LIAM_BABY_SHOWER_PHOTO : undefined,
    calendarUrl: isLiam ? LIAM_BABY_SHOWER_CALENDAR : undefined,
    voiceUrl: isLiam ? "/audio/liam-alejandro.mp3" : undefined,
    voiceStorageKey: isLiam ? "liam-alejandro" : undefined,
  };
}

export function buildInvitationMetadata(
  event: InviteEvent,
  isPersonalLink = false,
): Metadata {
  const presentation = getInvitationPresentation(event);
  const title = `${event.event_type} de ${event.main_names}`;
  const time = event.reception_time ?? event.ceremony_time;
  const place = event.reception_place ?? event.ceremony_place;
  const description = [event.event_date, time, place].filter(Boolean).join(" · ");
  const canonical = `${PUBLIC_ORIGIN}${presentation.canonicalPath}`;
  const images = presentation.photoUrl
    ? [{
        url: `${PUBLIC_ORIGIN}${presentation.photoUrl}`,
        width: 720,
        height: 722,
        alt: title,
      }]
    : undefined;

  return {
    title: { absolute: title },
    description,
    referrer: "no-referrer",
    alternates: { canonical },
    ...(isPersonalLink ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "es_MX",
      siteName: "ZEFEINVITA",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}
