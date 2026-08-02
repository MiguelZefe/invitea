"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type EditInvitationState = {
  message: string;
};

const requiredFields = [
  "event_type",
  "main_names",
  "title",
  "event_date",
  "hero_label",
] as const;

const optionalFields = [
  "subtitle",
  "ceremony_place",
  "ceremony_time",
  "ceremony_address",
  "ceremony_maps_url",
  "reception_place",
  "reception_time",
  "reception_address",
  "reception_maps_url",
  "dress_code",
  "dress_code_description",
] as const;

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateInvitation(
  slug: string,
  _previousState: EditInvitationState,
  formData: FormData
): Promise<EditInvitationState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const requiredValues = Object.fromEntries(
    requiredFields.map((field) => [field, getString(formData, field)])
  ) as Record<(typeof requiredFields)[number], string>;

  if (requiredFields.some((field) => !requiredValues[field])) {
    return {
      message: "Completa todos los campos obligatorios antes de guardar.",
    };
  }

  const optionalValues = Object.fromEntries(
    optionalFields.map((field) => {
      const value = getString(formData, field);
      return [field, value || null];
    })
  );

  const { data, error } = await supabase
    .from("events")
    .update({ ...requiredValues, ...optionalValues })
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .select("slug")
    .maybeSingle();

  if (error) {
    console.error("No se pudo actualizar la invitación:", error);
    return {
      message: `No se pudo guardar la invitación: ${error.message}`,
    };
  }

  if (!data) {
    return {
      message: "No se encontró una invitación editable con este usuario.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${slug}`);
  revalidatePath(`/invitacion/${slug}`);
  redirect(`/dashboard/${slug}`);
}
