"use server";

import { createClient } from "@/lib/supabase-server";
import { validateInvitationForm } from "@/lib/invitation-form";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type CreateInvitationState = {
  message: string;
};

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

  const validation = validateInvitationForm(formData);

  if (!validation.success) {
    return { message: validation.message };
  }

  const slugSource = validation.values.main_names || validation.values.title;
  const baseSlug = createSlug(slugSource) || "invitacion";

  const eventData = {
    ...validation.values,
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
      console.error("No se pudo crear la invitación:", error);
      return {
        message: "No se pudo crear la invitación. Intenta nuevamente.",
      };
    }
  }

  if (!createdSlug) {
    console.error("No se pudo generar un slug único:", lastErrorMessage);
    return {
      message: "No se pudo generar una dirección única para la invitación.",
    };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${createdSlug}`);
}
