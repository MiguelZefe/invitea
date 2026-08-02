"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AddGuestState = {
  message: string;
  success: boolean;
};

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
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
