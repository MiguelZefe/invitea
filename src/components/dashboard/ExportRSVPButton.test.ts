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
    id: "reply-one", event_slug: "evento-prueba", guest_id: null, full_name: "Persona ficticia",
    attendance_status: "declined", guests_count: 3, message: null,
    created_at: "2030-01-01T00:00:00Z",
  };
  const button = ExportRSVPButton({
    eventSlug: "evento-prueba",
    rsvps: [rsvp, { ...rsvp, id: "reply-two", guest_id: "guest-one", attendance_status: "confirmed", guests_count: 2 }],
  });
  button.props.onClick();

  expect(link.click).toHaveBeenCalledOnce();
  expect(link.download).toBe("confirmaciones-evento-prueba.csv");
  const csv = await exported!.text();
  expect(csv).toContain('"Personas que asistirán"');
  expect(csv).toContain('"Vínculo con la lista"');
  expect(csv).toContain('"Sin invitado vinculado","No asistirá","0"');
  expect(csv).toContain('"Invitado vinculado","Sí asistirá","2"');
});

it("exports visitor text without letting spreadsheet formulas run", async () => {
  let exported: Blob | undefined;
  vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
    exported = blob as Blob;
    return "blob:local-rsvp-test";
  });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.stubGlobal("document", { createElement: () => ({ href: "", download: "", click: vi.fn() }) });

  const button = ExportRSVPButton({
    eventSlug: "evento-prueba",
    rsvps: [
      { id: "a", event_slug: "evento-prueba", guest_id: null, full_name: '=HYPERLINK("https://example.invalid")',
        attendance_status: "confirmed", guests_count: 1, message: "\t+SUM(1,1)", created_at: "2030-01-01T00:00:00Z" },
      { id: "b", event_slug: "evento-prueba", guest_id: "guest-b", full_name: "-1+2",
        attendance_status: "declined", guests_count: 1, message: "@SUM(1,1)", created_at: "2030-01-01T00:00:00Z" },
    ],
  });
  button.props.onClick();

  const csv = await exported!.text();
  expect(csv).toContain('"\'=HYPERLINK(""https://example.invalid"")"');
  expect(csv).toContain('"\'\t+SUM(1,1)"');
  expect(csv).toContain('"\'-1+2"');
  expect(csv).toContain('"\'@SUM(1,1)"');
  expect(csv).toContain('"Sin invitado vinculado"');
  expect(csv).toContain('"Invitado vinculado"');
});
