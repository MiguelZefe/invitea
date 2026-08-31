import CheckInPanel from "@/components/dashboard/CheckInPanel";
import type { ManualCheckInGuest } from "@/components/dashboard/ManualGuestSearch";
import { createClient } from "@/lib/supabase-server";
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
  } = await supabase.auth.getUser();

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

  if (error || !event) {
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
      .select("id, guest_id, attendance_status, guests_count, created_at")
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

  const currentGuestIds = new Set(
    (guestsResult.data ?? []).map((guest) => guest.id)
  );
  const rsvpByGuestId = new Map<
    string,
    NonNullable<typeof rsvpsResult.data>[number]
  >();

  for (const rsvp of rsvpsResult.data ?? []) {
    if (
      typeof rsvp.guest_id !== "string" ||
      !currentGuestIds.has(rsvp.guest_id)
    ) {
      continue;
    }

    if (rsvpByGuestId.has(rsvp.guest_id)) {
      console.warn(
        "Se encontró más de un RSVP para un invitado; se usa el más reciente para check-in."
      );
      continue;
    }

    rsvpByGuestId.set(rsvp.guest_id, rsvp);
  }

  const directoryGuests: ManualCheckInGuest[] = (guestsResult.data ?? []).map(
    (guest) => {
      const rsvp = rsvpByGuestId.get(guest.id);

      return {
        token: guest.token,
        fullName: guest.full_name,
        phone: guest.phone,
        email: guest.email,
        maxGuests: guest.max_guests,
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
              Valida el acceso de tus invitados en la entrada del evento.
            </p>
          </div>

          <Link
            href={`/dashboard/${slug}`}
            className="rounded-full border border-black px-6 py-3 text-center transition hover:bg-black hover:text-white"
          >
            Volver al evento
          </Link>
        </header>

        <CheckInPanel slug={slug} guests={directoryGuests} />

        <p className="mt-10 text-center text-xs uppercase tracking-[0.3em] text-neutral-400">
          By MiguelZefe
        </p>
      </section>
    </main>
  );
}
