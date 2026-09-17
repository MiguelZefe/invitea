import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PublicInvitation from "@/components/PublicInvitation";
import { liamBabyShowerEvent } from "@/content/liam-baby-shower";
import { buildInvitationMetadata, getInvitationPresentation } from "@/lib/invitation-presentation";
import { getPublicEvent, getPublicGuest, getPublicInvitationMetadata } from "@/lib/public-invitation-data";

const mocks = vi.hoisted(() => ({
  eventResult: vi.fn(),
  guestResult: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase", () => {
  const query = {
    select: () => query,
    eq: () => query,
    abortSignal: () => query,
    maybeSingle: mocks.eventResult,
  };
  const guestQuery = {
    abortSignal: () => guestQuery,
    maybeSingle: mocks.guestResult,
  };
  mocks.rpc.mockReturnValue(guestQuery);
  return { supabase: { from: () => query, rpc: mocks.rpc } };
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.eventResult.mockResolvedValue({ data: liamBabyShowerEvent, error: null });
  mocks.guestResult.mockResolvedValue({ data: null, error: null });
});

describe("public invitations", () => {
  it.each(["Boda", "Baby shower"])("passes simulated event WhatsApp configuration to the shared %s form", async (event_type) => {
    mocks.eventResult.mockResolvedValue({ data: { ...liamBabyShowerEvent, slug: "evento-ficticio", event_type, title: "Evento ficticio", whatsapp_number: "12025550100", whatsapp_primary: true }, error: null });
    const html = renderToStaticMarkup(await PublicInvitation({ slug: "evento-ficticio" }));
    expect(html.indexOf("Confirmar por WhatsApp")).toBeLessThan(html.indexOf("Enviar confirmación"));
    expect(html).toContain("no forman parte de sus métricas");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("does not bypass an invalid personal link when simulated event WhatsApp is enabled", async () => {
    mocks.eventResult.mockResolvedValue({ data: { ...liamBabyShowerEvent, whatsapp_number: "12025550100", whatsapp_primary: true }, error: null });
    const html = renderToStaticMarkup(await PublicInvitation({ slug: "liam-alejandro", guestParameter: "invalid-fictitious-token" }));
    expect(html).not.toContain("Confirmar por WhatsApp");
    expect(html).not.toContain("Enviar confirmación");
  });
  it("renders Liam's real RSVP together with exactly one voice player, photo and calendar", async () => {
    const html = renderToStaticMarkup(await PublicInvitation({ slug: "liam-alejandro" }));
    expect(html).toContain('id="asistencia"');
    expect(html).toContain("Enviar confirmación");
    expect(html).toContain("Confirmar asistencia");
    expect(html).toContain("/audio/liam-alejandro.mp3");
    expect(html).toContain("liam-alejandro-baby-shower.jpeg");
    expect(html).toContain("/liam-alejandro-baby-shower.ics");
    expect(html.match(/<audio\b/g)).toHaveLength(1);
    expect(html).not.toContain("demo-wedding.mp3");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("keeps a valid personal invitation bound to its name and pass limit", async () => {
    mocks.guestResult.mockResolvedValue({
      data: { full_name: "Invitado de prueba", max_guests: 3 }, error: null,
    });
    const html = renderToStaticMarkup(await PublicInvitation({
      slug: "liam-alejandro", guestParameter: "test-only-token",
    }));
    expect(html).toContain("Invitado de prueba");
    expect(html).toContain('readOnly=""');
    expect(html).toContain('max="3"');
    expect(html).toContain("Enviar confirmación");
    expect(mocks.rpc).toHaveBeenCalledWith("get_public_guest_invitation", {
      p_event_slug: "liam-alejandro", p_guest_token: "test-only-token",
    });
  });

  it.each(["", "   ", ["test-one", "test-two"]])("rejects malformed personal links without a lookup: %j", async (parameter) => {
    expect(await getPublicGuest("liam-alejandro", parameter)).toEqual({ status: "invalid" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("does not silently turn a revoked personal link into an unrestricted RSVP", async () => {
    const html = renderToStaticMarkup(await PublicInvitation({
      slug: "liam-alejandro", guestParameter: "test-revoked-token",
    }));
    expect(html).toContain("Este enlace personal no es válido");
    expect(html).not.toContain("Enviar confirmación");
    expect(html).toContain('href="/liam-alejandro"');
  });

  it("distinguishes a lookup failure from an invalid link and blocks RSVP", async () => {
    mocks.guestResult.mockResolvedValue({ data: null, error: { code: "test-network-failure" } });
    const html = renderToStaticMarkup(await PublicInvitation({
      slug: "liam-alejandro", guestParameter: "test-only-token",
    }));
    expect(html).toContain("No pudimos cargar la confirmación");
    expect(html).not.toContain("Enviar confirmación");
    expect(html).not.toContain("Este enlace personal no es válido");
  });

  it("rejects incomplete pass data instead of rendering an unlimited personal invitation", async () => {
    mocks.guestResult.mockResolvedValue({ data: { full_name: "Prueba", max_guests: null }, error: null });
    expect(await getPublicGuest("liam-alejandro", "test-only-token")).toEqual({ status: "unavailable" });
  });

  it("keeps Liam's event details available during an outage without offering a false confirmation", async () => {
    mocks.eventResult.mockRejectedValue(new Error("test-network-failure"));
    const html = renderToStaticMarkup(await PublicInvitation({ slug: "liam-alejandro" }));
    expect(html).toContain("Jardín Crisálida");
    expect(html).toContain("/audio/liam-alejandro.mp3");
    expect(html).toContain("No pudimos cargar la confirmación");
    expect(html).not.toContain("Enviar confirmación");
  });

  it("does not resurrect a deleted event from the static fallback", async () => {
    mocks.eventResult.mockResolvedValue({ data: null, error: null });
    expect(await getPublicEvent("liam-alejandro")).toEqual({ event: null, available: true });
    await expect(PublicInvitation({ slug: "liam-alejandro" })).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("does not apply Liam's media or personal text to other baby showers", async () => {
    const otherEvent = { ...liamBabyShowerEvent, slug: "otro-baby-shower", main_names: "Otro bebé" };
    mocks.eventResult.mockResolvedValue({ data: otherEvent, error: null });
    const html = renderToStaticMarkup(await PublicInvitation({ slug: otherEvent.slug }));
    expect(html).toContain("Otro bebé");
    expect(html).not.toContain("Liam Alejandro");
    expect(getInvitationPresentation(otherEvent).voiceUrl).toBeUndefined();
  });

  it("preserves the wedding template and its RSVP for other events", async () => {
    mocks.eventResult.mockResolvedValue({ data: {
      ...liamBabyShowerEvent, slug: "boda-prueba", event_type: "Boda", music_url: "/music/demo-wedding.mp3",
    }, error: null });
    const html = renderToStaticMarkup(await PublicInvitation({ slug: "boda-prueba" }));
    expect(html).toContain("Itinerario del día");
    expect(html).toContain("Enviar confirmación");
    expect(html).not.toContain("/audio/liam-alejandro.mp3");
  });
});

describe("invitation sharing metadata", () => {
  it("uses the short canonical URL and real event details with the photo", () => {
    const metadata = buildInvitationMetadata(liamBabyShowerEvent);
    expect(metadata.alternates?.canonical).toBe("https://www.zefeinvita.com.mx/liam-alejandro");
    expect(metadata.description).toContain("19 de septiembre de 2026");
    expect(metadata.description).toContain("Jardín Crisálida");
    expect(metadata.openGraph?.images).toEqual(expect.arrayContaining([
      expect.objectContaining({ width: 720, height: 722 }),
    ]));
  });

  it("never includes a personal token or guest identity in sharing metadata", async () => {
    const metadata = await getPublicInvitationMetadata("liam-alejandro", "test-private-token");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.referrer).toBe("no-referrer");
    expect(JSON.stringify(metadata)).not.toContain("test-private-token");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
