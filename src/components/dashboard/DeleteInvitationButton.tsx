"use client";

import {
  DeleteInvitationState,
  deleteInvitation,
} from "@/app/dashboard/[slug]/actions";
import { useActionState } from "react";

type DeleteInvitationButtonProps = {
  slug: string;
};

const initialState: DeleteInvitationState = {
  message: "",
};

export default function DeleteInvitationButton({
  slug,
}: DeleteInvitationButtonProps) {
  const action = deleteInvitation.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, initialState);

  function confirmDeletion(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar esta invitación? Esta acción también borrará todas las confirmaciones RSVP asociadas y no se puede deshacer."
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <div>
      <form action={formAction} onSubmit={confirmDeletion}>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full border border-red-600 px-6 py-3 text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Eliminando..." : "Eliminar invitación"}
        </button>
      </form>

      {state.message && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-3 max-w-xs rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
