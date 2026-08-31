"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type DeleteInvitationState = {
  message: string;
};

export async function deleteInvitation(
  slug: string,
  previousState: DeleteInvitationState
): Promise<DeleteInvitationState> {
  void previousState;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: ownedEvent, error: ownershipError } = await supabase
    .from("events")
    .select("slug")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (ownershipError) {
    console.error("No se pudo verificar la invitación:", ownershipError);
    return {
      message: "No se pudo verificar la invitación. Intenta nuevamente.",
    };
  }

  if (!ownedEvent) {
    return {
      message: "No se encontró una invitación eliminable con este usuario.",
    };
  }

  const { error: rsvpsError } = await supabase
    .from("rsvps")
    .delete()
    .eq("event_slug", slug);

  if (rsvpsError) {
    console.error("No se pudieron eliminar las confirmaciones:", rsvpsError);
    return {
      message: "No se pudieron eliminar las confirmaciones. Intenta nuevamente.",
    };
  }

  const { data: deletedEvent, error: eventError } = await supabase
    .from("events")
    .delete()
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .select("slug")
    .maybeSingle();

  if (eventError) {
    console.error("No se pudo eliminar la invitación:", eventError);
    return {
      message: "No se pudo eliminar la invitación. Intenta nuevamente.",
    };
  }

  if (!deletedEvent) {
    return {
      message: "La invitación no pudo eliminarse o ya no está disponible.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${slug}`);
  revalidatePath(`/invitacion/${slug}`);
  redirect("/dashboard");
}
