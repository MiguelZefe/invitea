"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AddGuestState = {
  message: string;
  success: boolean;
};

export type GuestMutationState = {
  message: string;
  success: boolean;
};

type OwnedGuest = {
  id: string;
  event_id: string;
  checked_in_at: string | null;
  checked_in_count: number | null;
};

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

async function getOwnedGuest(slug: string, guestId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (eventError) {
    console.error("No se pudo verificar la propiedad del evento:", eventError);
    return { supabase, eventId: null, guest: null, failed: true };
  }

  if (!event) {
    return { supabase, eventId: null, guest: null, failed: true };
  }

  const { data: guest, error: guestError } = await supabase
    .from("event_guests")
    .select("id, event_id, checked_in_at, checked_in_count")
    .eq("id", guestId)
    .eq("event_id", event.id)
    .maybeSingle();

  if (guestError) {
    console.error("No se pudo verificar el invitado del evento:", guestError);
    return { supabase, eventId: event.id, guest: null, failed: true };
  }

  return {
    supabase,
    eventId: event.id,
    guest: (guest as OwnedGuest | null) ?? null,
    failed: !guest,
  };
}

export async function addGuest(
  slug: string,
  previousState: AddGuestState,
  formData: FormData
): Promise<AddGuestState> {
  void previousState;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (eventError) {
    console.error("No se pudo verificar el evento:", eventError);
    return {
      message: `No se pudo verificar el evento: ${eventError.message}`,
      success: false,
    };
  }

  if (!event) {
    return {
      message: "No se encontró un evento administrable con este usuario.",
      success: false,
    };
  }

  const fullName = getString(formData, "full_name");
  const phone = getString(formData, "phone");
  const email = getString(formData, "email");
  const notes = getString(formData, "notes");
  const maxGuestsValue = getString(formData, "max_guests");
  const maxGuests = Number(maxGuestsValue);

  if (!fullName) {
    return {
      message: "Escribe el nombre del invitado.",
      success: false,
    };
  }

  if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 100) {
    return {
      message: "Los pases máximos deben ser un número entero entre 1 y 100.",
      success: false,
    };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      message: "Escribe un correo electrónico válido.",
      success: false,
    };
  }

  const { error } = await supabase.from("event_guests").insert({
    event_id: event.id,
    full_name: fullName,
    phone: phone || null,
    email: email || null,
    max_guests: maxGuests,
    notes: notes || null,
  });

  if (error) {
    console.error("No se pudo agregar el invitado:", error);
    return {
      message: `No se pudo agregar el invitado: ${error.message}`,
      success: false,
    };
  }

  revalidatePath(`/dashboard/${slug}/invitados`);

  return {
    message: "Invitado agregado correctamente.",
    success: true,
  };
}

export async function updateGuest(
  slug: string,
  guestId: string,
  previousState: GuestMutationState,
  formData: FormData
): Promise<GuestMutationState> {
  void previousState;

  const { supabase, eventId, guest, failed } = await getOwnedGuest(
    slug,
    guestId
  );

  if (failed || !eventId || !guest) {
    return {
      message: "No se encontró un invitado administrable en este evento.",
      success: false,
    };
  }

  const fullName = getString(formData, "full_name");
  const phone = getString(formData, "phone");
  const email = getString(formData, "email");
  const notes = getString(formData, "notes");
  const maxGuests = Number(getString(formData, "max_guests"));

  if (!fullName) {
    return { message: "Escribe el nombre del invitado.", success: false };
  }

  if (!Number.isInteger(maxGuests) || maxGuests < 1 || maxGuests > 100) {
    return {
      message: "Los pases máximos deben ser un número entero entre 1 y 100.",
      success: false,
    };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      message: "Escribe un correo electrónico válido.",
      success: false,
    };
  }

  const { data: rsvp, error: rsvpError } = await supabase
    .from("rsvps")
    .select("attendance_status, guests_count")
    .eq("guest_id", guest.id)
    .eq("event_slug", slug)
    .maybeSingle();

  if (rsvpError) {
    console.error("No se pudo validar el RSVP antes de editar:", rsvpError);
    return {
      message: "No pudimos verificar la confirmación del invitado. Intenta nuevamente.",
      success: false,
    };
  }

  if (
    rsvp?.attendance_status === "confirmed" &&
    rsvp.guests_count > maxGuests
  ) {
    return {
      message: `No puedes reducir los pases a ${maxGuests} porque este invitado ya confirmó ${rsvp.guests_count} asistentes.`,
      success: false,
    };
  }

  // Deuda técnica: la lectura del RSVP y este update no son atómicos. Una
  // futura operación transaccional debe cerrar esa pequeña condición de carrera.
  const { data: updatedGuest, error: updateError } = await supabase
    .from("event_guests")
    .update({
      full_name: fullName,
      phone: phone || null,
      email: email || null,
      max_guests: maxGuests,
      notes: notes || null,
    })
    .eq("id", guest.id)
    .eq("event_id", eventId)
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("No se pudo actualizar el invitado:", updateError);
    return {
      message: "No pudimos actualizar el invitado. Intenta nuevamente.",
      success: false,
    };
  }

  if (!updatedGuest) {
    return {
      message: "El invitado cambió o dejó de estar disponible. Recarga la página.",
      success: false,
    };
  }

  revalidatePath(`/dashboard/${slug}/invitados`);

  return { message: "Invitado actualizado correctamente.", success: true };
}

export async function deleteGuest(
  slug: string,
  guestId: string,
  previousState: GuestMutationState,
  formData: FormData
): Promise<GuestMutationState> {
  void previousState;

  const { supabase, eventId, guest, failed } = await getOwnedGuest(
    slug,
    guestId
  );

  if (failed || !eventId || !guest) {
    return {
      message: "No se encontró un invitado administrable en este evento.",
      success: false,
    };
  }

  const acknowledgedCheckedInDeletion =
    getString(formData, "acknowledge_checked_in") === "yes";

  if (guest.checked_in_at && !acknowledgedCheckedInDeletion) {
    return {
      message:
        "Este invitado tiene check-in. Confirma explícitamente que deseas eliminar también su información operativa de ingreso.",
      success: false,
    };
  }

  const { data: deletedGuest, error: deleteError } = await supabase
    .from("event_guests")
    .delete()
    .eq("id", guest.id)
    .eq("event_id", eventId)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error("No se pudo eliminar el invitado:", deleteError);
    return {
      message: "No pudimos eliminar el invitado. Intenta nuevamente.",
      success: false,
    };
  }

  if (!deletedGuest) {
    return {
      message: "El invitado ya no está disponible. Recarga la página.",
      success: false,
    };
  }

  revalidatePath(`/dashboard/${slug}/invitados`);

  return {
    message:
      "Invitado eliminado. Su RSVP permanece en el evento sin vínculo al invitado.",
    success: true,
  };
}
