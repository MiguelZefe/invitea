"use server";

import { createClient } from "@/lib/supabase-server";
import { CURRENT_RSVP_FIELDS, currentRsvpForGuest } from "@/lib/current-rsvp";
import {
  getAttendanceVerificationError,
  getCheckInCountError,
} from "@/lib/guest-attendance";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CheckInGuest = {
  token: string;
  fullName: string;
  maxGuests: number;
  rsvpAvailable: boolean;
  rsvpAmbiguous?: boolean;
  attendanceStatus: string | null;
  confirmedGuestsCount: number | null;
  checkedInAt: string | null;
  checkedInCount: number | null;
};

export type SearchGuestState = {
  message: string;
  guest: CheckInGuest | null;
};

export type MarkCheckInState = {
  message: string;
  success: boolean;
  checkedInAt: string | null;
  checkedInCount: number | null;
};

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function extractGuestToken(value: string) {
  if (!value.includes("?")) {
    return value.trim();
  }

  try {
    const url = new URL(value, "https://invitea.local");
    return url.searchParams.get("guest")?.trim() ?? "";
  } catch {
    return "";
  }
}

async function getOwnedEventId(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  return { supabase, eventId: data?.id ?? null, error };
}

export async function searchCheckInGuest(
  slug: string,
  previousState: SearchGuestState,
  formData: FormData
): Promise<SearchGuestState> {
  void previousState;

  const token = extractGuestToken(getString(formData, "token"));

  if (!token) {
    return {
      message: "Escribe un token o pega un enlace individual válido.",
      guest: null,
    };
  }

  const { supabase, eventId, error: eventError } = await getOwnedEventId(slug);

  if (eventError) {
    console.error("No se pudo verificar el evento:", eventError);
    return {
      message: "No se pudo verificar el evento. Intenta nuevamente.",
      guest: null,
    };
  }

  if (!eventId) {
    return {
      message: "No se encontró un evento administrable con este usuario.",
      guest: null,
    };
  }

  const { data: guest, error: guestError } = await supabase
    .from("event_guests")
    .select(
      "id, full_name, max_guests, checked_in_at, checked_in_count"
    )
    .eq("event_id", eventId)
    .eq("token", token)
    .maybeSingle();

  if (guestError) {
    console.error("No se pudo buscar el invitado:", guestError);
    return {
      message: "No se pudo buscar el invitado. Intenta nuevamente.",
      guest: null,
    };
  }

  if (!guest) {
    return {
      message: "El token no corresponde a un invitado de este evento.",
      guest: null,
    };
  }

  const { data: responses, error: rsvpError } = await supabase
    .from("rsvps")
    .select(CURRENT_RSVP_FIELDS)
    .eq("guest_id", guest.id)
    .eq("event_slug", slug);

  if (rsvpError) {
    console.error("No se pudo cargar el RSVP del invitado:", rsvpError);
  }
  const selection = currentRsvpForGuest(rsvpError ? [] : responses ?? [], slug, guest.id);
  const ambiguous = selection.kind === "ambiguous";
  const rsvp = selection.kind === "current" ? selection.response : null;

  return {
    message: rsvpError
      ? "Invitado encontrado, pero no se pudo cargar su estado RSVP."
      : ambiguous ? "El RSVP es ambiguo. Revisa el historial antes de registrar el ingreso." : "",
    guest: {
      token,
      fullName: guest.full_name,
      maxGuests: guest.max_guests,
      rsvpAvailable: !rsvpError && !ambiguous,
      rsvpAmbiguous: ambiguous,
      attendanceStatus: rsvpError ? null : rsvp?.attendance_status ?? null,
      confirmedGuestsCount: rsvpError ? null : rsvp?.guests_count ?? null,
      checkedInAt: guest.checked_in_at,
      checkedInCount: guest.checked_in_count,
    },
  };
}

export async function markGuestCheckIn(
  slug: string,
  token: string,
  previousState: MarkCheckInState,
  formData: FormData
): Promise<MarkCheckInState> {
  void previousState;

  const checkedInCount = Number(getString(formData, "checked_in_count"));
  const attendanceVerified =
    getString(formData, "attendance_verified") === "yes";
  const { supabase, eventId, error: eventError } = await getOwnedEventId(slug);

  if (eventError || !eventId) {
    return {
      message: "No se pudo verificar que administras este evento.",
      success: false,
      checkedInAt: null,
      checkedInCount: null,
    };
  }

  const { data: guest, error: guestError } = await supabase
    .from("event_guests")
    .select("id, max_guests, checked_in_at, checked_in_count")
    .eq("event_id", eventId)
    .eq("token", token)
    .maybeSingle();

  if (guestError || !guest) {
    if (guestError) {
      console.error("No se pudo verificar el invitado:", guestError);
    }

    return {
      message: "El invitado ya no está disponible para este evento.",
      success: false,
      checkedInAt: null,
      checkedInCount: null,
    };
  }

  if (guest.checked_in_at) {
    return {
      message: "Este invitado ya tenía un check-in registrado.",
      success: false,
      checkedInAt: guest.checked_in_at,
      checkedInCount: guest.checked_in_count,
    };
  }

  const { data: responses, error: rsvpError } = await supabase
    .from("rsvps")
    .select(CURRENT_RSVP_FIELDS)
    .eq("guest_id", guest.id)
    .eq("event_slug", slug);

  if (rsvpError) {
    console.error("No se pudo verificar el RSVP del invitado:", rsvpError);
    return {
      message: "No se pudo verificar el estado RSVP. Intenta nuevamente.",
      success: false,
      checkedInAt: null,
      checkedInCount: null,
    };
  }

  const selection = currentRsvpForGuest(responses ?? [], slug, guest.id);
  if (selection.kind === "ambiguous") {
    return {
      message: "El RSVP es ambiguo. Revisa el historial antes de registrar el ingreso.",
      success: false,
      checkedInAt: null,
      checkedInCount: null,
    };
  }
  const rsvp = selection.kind === "current" ? selection.response : null;
  const declinedOverride =
    getString(formData, "override_declined") === "true";

  if (rsvp?.attendance_status === "declined" && !declinedOverride) {
    return {
      message:
        "El invitado respondió que no asistiría. Confirma explícitamente la excepción para registrar su ingreso.",
      success: false,
      checkedInAt: null,
      checkedInCount: null,
    };
  }

  const countError = getCheckInCountError(checkedInCount, guest.max_guests);

  if (countError) {
    return {
      message: countError,
      success: false,
      checkedInAt: null,
      checkedInCount: null,
    };
  }

  const verificationError =
    getAttendanceVerificationError(attendanceVerified);

  if (verificationError) {
    return {
      message: verificationError,
      success: false,
      checkedInAt: null,
      checkedInCount: null,
    };
  }

  const checkedInAt = new Date().toISOString();
  const { data: updatedGuest, error: updateError } = await supabase
    .from("event_guests")
    .update({
      checked_in_at: checkedInAt,
      checked_in_count: checkedInCount,
    })
    .eq("id", guest.id)
    .eq("event_id", eventId)
    .is("checked_in_at", null)
    .select("checked_in_at, checked_in_count")
    .maybeSingle();

  if (updateError) {
    console.error("No se pudo registrar el check-in:", updateError);
    return {
      message: "No se pudo registrar el ingreso. Intenta nuevamente.",
      success: false,
      checkedInAt: null,
      checkedInCount: null,
    };
  }

  if (!updatedGuest) {
    const { data: currentGuest } = await supabase
      .from("event_guests")
      .select("checked_in_at, checked_in_count")
      .eq("id", guest.id)
      .eq("event_id", eventId)
      .maybeSingle();

    return {
      message: "Este invitado fue registrado previamente desde otro dispositivo.",
      success: false,
      checkedInAt: currentGuest?.checked_in_at ?? null,
      checkedInCount: currentGuest?.checked_in_count ?? null,
    };
  }

  revalidatePath(`/dashboard/${slug}`);
  revalidatePath(`/dashboard/${slug}/checkin`);
  revalidatePath(`/dashboard/${slug}/invitados`);

  return {
    message: "Asistencia verificada y check-in registrado correctamente.",
    success: true,
    checkedInAt: updatedGuest.checked_in_at,
    checkedInCount: updatedGuest.checked_in_count,
  };
}
