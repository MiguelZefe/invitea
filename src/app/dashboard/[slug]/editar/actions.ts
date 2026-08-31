"use server";

import { createClient } from "@/lib/supabase-server";
import { validateInvitationForm } from "@/lib/invitation-form";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type EditInvitationState = {
  message: string;
};

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

  const validation = validateInvitationForm(formData);

  if (!validation.success) {
    return { message: validation.message };
  }

  const { data, error } = await supabase
    .from("events")
    .update(validation.values)
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .select("slug")
    .maybeSingle();

  if (error) {
    console.error("No se pudo actualizar la invitación:", error);
    return {
      message: "No se pudo guardar la invitación. Intenta nuevamente.",
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
