import CheckInPanel from "@/components/dashboard/CheckInPanel";
import LoadError from "@/components/dashboard/LoadError";
import type { ManualCheckInGuest } from "@/components/dashboard/ManualGuestSearch";
import { createClient } from "@/lib/supabase-server";
import { CURRENT_RSVP_FIELDS, currentRsvpsByGuest } from "@/lib/current-rsvp";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type CheckInPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError && authError.name !== "AuthSessionMissingError") {
    return <main><LoadError message="No pudimos verificar tu sesión." /></main>;
  }
  if (!user) {
    redirect("/login");
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id, main_names")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("No se pudo cargar el evento para check-in:", error);
  }

  if (error) return <main><LoadError message="No pudimos cargar el evento." /></main>;
  if (!event) {
    notFound();
  }

  const [guestsResult, rsvpsResult] = await Promise.all([
    supabase
      .from("event_guests")
      .select(
        "id, token, full_name, phone, email, max_guests, checked_in_at, checked_in_count"
      )
      .eq("event_id", event.id)
      .order("full_name", { ascending: true }),
    supabase
      .from("rsvps")
      .select(CURRENT_RSVP_FIELDS)
      .eq("event_slug", slug)
      .not("guest_id", "is", null)
      .order("created_at", { ascending: false }),
  ]);

  if (guestsResult.error) {
    console.error("No se pudieron cargar los invitados para check-in:", guestsResult.error);
  }

  if (rsvpsResult.error) {
    console.error("No se pudieron cargar los RSVP para check-in:", rsvpsResult.error);
  }

  const guests = guestsResult.error ? [] : guestsResult.data ?? [];
  const rsvpByGuestId = currentRsvpsByGuest(rsvpsResult.error ? [] : rsvpsResult.data ?? [], slug);

  const directoryGuests: ManualCheckInGuest[] = guests.map(
    (guest) => {
      const selection = rsvpByGuestId.get(guest.id);
      const ambiguous = selection?.kind === "ambiguous";
      const rsvp = selection?.kind === "current" ? selection.response : null;

      return {
        token: guest.token,
        fullName: guest.full_name,
        phone: guest.phone,
        email: guest.email,
        maxGuests: guest.max_guests,
        rsvpAvailable: !rsvpsResult.error && !ambiguous,
        rsvpAmbiguous: ambiguous,
        attendanceStatus: rsvp?.attendance_status ?? null,
        confirmedGuestsCount: rsvp?.guests_count ?? null,
        checkedInAt: guest.checked_in_at,
        checkedInCount: guest.checked_in_count,
      };
    }
  );

  return (
    <main className="min-h-screen bg-[#f8f5f2] px-6 py-10 text-neutral-900">
      <section className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
              INVITEA · Check-in
            </p>
            <h1 className="mt-2 text-4xl md:text-5xl">{event.main_names}</h1>
            <p className="mt-3 text-neutral-600">
              Verifica la asistencia y registra el ingreso de cada invitado.
            </p>
          </div>

          <Link
            href={`/dashboard/${slug}`}
            className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
          >
            Volver al evento
          </Link>
        </header>

        <CheckInPanel
          slug={slug}
          guests={directoryGuests}
          guestsAvailable={!guestsResult.error}
          rsvpsAvailable={!rsvpsResult.error}
        />

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
