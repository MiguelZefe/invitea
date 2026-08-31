"use server";

import { createClient } from "@/lib/supabase-server";
import {
  getCheckInCountError,
  getGuestPresenceStatus,
} from "@/lib/guest-attendance";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CheckInGuest = {
  token: string;
  fullName: string;
  maxGuests: number;
  attendanceStatus: string | null;
  confirmedGuestsCount: number | null;
  checkedInAt: string | null;
  checkedInCount: number | null;
};

export type SearchGuestState = {
  message: string;
  guest: CheckInGuest | null;
};

export type MarkAttendanceState = {
  message: string;
  success: boolean;
  checkedInAt: string | null;
  checkedInCount: number | null;
  movement: "check-in" | "check-out" | null;
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

  const { data: rsvp, error: rsvpError } = await supabase
    .from("rsvps")
    .select("attendance_status, guests_count")
    .eq("guest_id", guest.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (rsvpError) {
    console.error("No se pudo cargar el RSVP del invitado:", rsvpError);
  }

  return {
    message: rsvpError
      ? "Invitado encontrado, pero no se pudo cargar su estado RSVP."
      : "",
    guest: {
      token,
      fullName: guest.full_name,
      maxGuests: guest.max_guests,
      attendanceStatus: rsvp?.attendance_status ?? null,
      confirmedGuestsCount: rsvp?.guests_count ?? null,
      checkedInAt: guest.checked_in_at,
      checkedInCount: guest.checked_in_count,
    },
  };
}

export async function markGuestAttendance(
  slug: string,
  token: string,
  previousState: MarkAttendanceState,
  formData: FormData
): Promise<MarkAttendanceState> {
  void previousState;

  const movement = getString(formData, "movement");
  const checkedInCount = Number(getString(formData, "checked_in_count"));
  const { supabase, eventId, error: eventError } = await getOwnedEventId(slug);

  if (eventError || !eventId) {
    return {
      message: "No se pudo verificar que administras este evento.",
      success: false,
      checkedInAt: null,
      checkedInCount: null,
      movement: null,
    };
  }

  if (movement !== "check-in" && movement !== "check-out") {
    return {
      message: "La operación solicitada no es válida.",
      success: false,
      checkedInAt: null,
      checkedInCount: null,
      movement: null,
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
      movement,
    };
  }

  const presenceStatus = getGuestPresenceStatus({
    checkedInAt: guest.checked_in_at,
    checkedInCount: guest.checked_in_count,
  });

  if (movement === "check-out") {
    if (presenceStatus === "not-arrived") {
      return {
        message: "No se puede registrar la salida antes del ingreso.",
        success: false,
        checkedInAt: null,
        checkedInCount: null,
        movement,
      };
    }

    if (presenceStatus === "checked-out") {
      return {
        message: "La salida de este invitado ya había sido registrada.",
        success: false,
        checkedInAt: guest.checked_in_at,
        checkedInCount: guest.checked_in_count,
        movement,
      };
    }

    let updateQuery = supabase
      .from("event_guests")
      .update({ checked_in_count: null })
      .eq("id", guest.id)
      .eq("event_id", eventId)
      .eq("checked_in_at", guest.checked_in_at as string);

    updateQuery =
      guest.checked_in_count === null
        ? updateQuery.is("checked_in_count", null)
        : updateQuery.eq("checked_in_count", guest.checked_in_count);

    const { data: updatedGuest, error: updateError } = await updateQuery
      .select("checked_in_at, checked_in_count")
      .maybeSingle();

    if (updateError) {
      console.error("No se pudo registrar el check-out:", updateError);
      return {
        message: "No se pudo registrar la salida. Intenta nuevamente.",
        success: false,
        checkedInAt: guest.checked_in_at,
        checkedInCount: guest.checked_in_count,
        movement,
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
        message:
          "El estado del invitado cambió desde otro dispositivo. Revisa el registro actualizado.",
        success: false,
        checkedInAt: currentGuest?.checked_in_at ?? null,
        checkedInCount: currentGuest?.checked_in_count ?? null,
        movement,
      };
    }

    revalidatePath(`/dashboard/${slug}`);
    revalidatePath(`/dashboard/${slug}/checkin`);
    revalidatePath(`/dashboard/${slug}/invitados`);

    return {
      message: "Salida registrada correctamente.",
      success: true,
      checkedInAt: updatedGuest.checked_in_at,
      checkedInCount: updatedGuest.checked_in_count,
      movement,
    };
  }

  if (presenceStatus === "inside") {
    return {
      message: "Este invitado ya había sido registrado.",
      success: false,
      checkedInAt: guest.checked_in_at,
      checkedInCount: guest.checked_in_count,
      movement,
    };
  }

  const { data: rsvp, error: rsvpError } = await supabase
    .from("rsvps")
    .select("attendance_status")
    .eq("guest_id", guest.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (rsvpError) {
    console.error("No se pudo verificar el RSVP del invitado:", rsvpError);
    return {
      message: "No se pudo verificar el estado RSVP. Intenta nuevamente.",
      success: false,
      checkedInAt: guest.checked_in_at,
      checkedInCount: guest.checked_in_count,
      movement,
    };
  }

  const declinedOverride =
    getString(formData, "override_declined") === "true";

  if (rsvp?.attendance_status === "declined" && !declinedOverride) {
    return {
      message:
        "El invitado respondió que no asistiría. Confirma explícitamente la excepción para registrar su ingreso.",
      success: false,
      checkedInAt: guest.checked_in_at,
      checkedInCount: guest.checked_in_count,
      movement,
    };
  }

  const countError = getCheckInCountError(checkedInCount, guest.max_guests);

  if (countError) {
    return {
      message: countError,
      success: false,
      checkedInAt: guest.checked_in_at,
      checkedInCount: guest.checked_in_count,
      movement,
    };
  }

  const checkedInAt = new Date().toISOString();
  let updateQuery = supabase
    .from("event_guests")
    .update({
      checked_in_at: checkedInAt,
      checked_in_count: checkedInCount,
    })
    .eq("id", guest.id)
    .eq("event_id", eventId);

  updateQuery =
    presenceStatus === "checked-out"
      ? guest.checked_in_count === null
        ? updateQuery
            .eq("checked_in_at", guest.checked_in_at as string)
            .is("checked_in_count", null)
        : updateQuery
            .eq("checked_in_at", guest.checked_in_at as string)
            .eq("checked_in_count", guest.checked_in_count)
      : updateQuery.is("checked_in_at", null);

  const { data: updatedGuest, error: updateError } = await updateQuery
    .select("checked_in_at, checked_in_count")
    .maybeSingle();

  if (updateError) {
    console.error("No se pudo registrar el check-in:", updateError);
    return {
      message: "No se pudo registrar el ingreso. Intenta nuevamente.",
      success: false,
      checkedInAt: guest.checked_in_at,
      checkedInCount: guest.checked_in_count,
      movement,
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
      movement,
    };
  }

  revalidatePath(`/dashboard/${slug}`);
  revalidatePath(`/dashboard/${slug}/checkin`);
  revalidatePath(`/dashboard/${slug}/invitados`);

  return {
    message: "Ingreso registrado correctamente.",
    success: true,
    checkedInAt: updatedGuest.checked_in_at,
    checkedInCount: updatedGuest.checked_in_count,
    movement,
  };
}
