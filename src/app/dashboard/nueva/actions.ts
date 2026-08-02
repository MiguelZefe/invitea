"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type CreateInvitationState = {
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

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export async function createInvitation(
  _previousState: CreateInvitationState,
  formData: FormData
): Promise<CreateInvitationState> {
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

  const missingField = requiredFields.find(
    (field) => !requiredValues[field]
  );

  if (missingField) {
    return {
      message: "Completa todos los campos obligatorios antes de continuar.",
    };
  }

  const optionalValues = Object.fromEntries(
    optionalFields.map((field) => {
      const value = getString(formData, field);
      return [field, value || null];
    })
  );

  const slugSource = requiredValues.main_names || requiredValues.title;
  const baseSlug = createSlug(slugSource) || "invitacion";

  const eventData = {
    ...requiredValues,
    ...optionalValues,
    owner_id: user.id,
    music_url: "/music/demo-wedding.mp3",
  };

  let createdSlug = "";
  let lastErrorMessage = "No se pudo crear la invitación.";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug =
      attempt === 0
        ? baseSlug
        : `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;

    const { data, error } = await supabase
      .from("events")
      .insert({ ...eventData, slug })
      .select("slug")
      .single();

    if (!error && data) {
      createdSlug = data.slug;
      break;
    }

    lastErrorMessage = error?.message ?? lastErrorMessage;

    if (error?.code !== "23505") {
      return {
        message: `No se pudo crear la invitación: ${lastErrorMessage}`,
      };
    }
  }

  if (!createdSlug) {
    return {
      message: `No se pudo generar un slug único: ${lastErrorMessage}`,
    };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${createdSlug}`);
}
