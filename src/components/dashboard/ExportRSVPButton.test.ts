import { afterEach, expect, it, vi } from "vitest";
import ExportRSVPButton from "./ExportRSVPButton";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("exports zero attending people for a declined reply without changing confirmed counts", async () => {
  let exported: Blob | undefined;
  vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
    exported = blob as Blob;
    return "blob:local-rsvp-test";
  });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  const link = { href: "", download: "", click: vi.fn() };
  vi.stubGlobal("document", { createElement: () => link });

  const rsvp = {
    id: "reply-one", event_slug: "evento-prueba", full_name: "Persona ficticia",
    attendance_status: "declined", guests_count: 3, message: null,
    created_at: "2030-01-01T00:00:00Z",
  };
  const button = ExportRSVPButton({
    eventSlug: "evento-prueba",
    rsvps: [rsvp, { ...rsvp, id: "reply-two", attendance_status: "confirmed", guests_count: 2 }],
  });
  button.props.onClick();

  expect(link.click).toHaveBeenCalledOnce();
  expect(link.download).toBe("confirmaciones-evento-prueba.csv");
  const csv = await exported!.text();
  expect(csv).toContain('"Personas que asistirán"');
  expect(csv).toContain('"No asistirá","0"');
  expect(csv).toContain('"Sí asistirá","2"');
});
