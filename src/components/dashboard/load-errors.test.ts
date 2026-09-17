import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DashboardPage from "@/app/dashboard/[slug]/page";
import GuestsPage from "@/app/dashboard/[slug]/invitados/page";
import CheckInPage from "@/app/dashboard/[slug]/checkin/page";
import { markGuestCheckIn, searchCheckInGuest } from "@/app/dashboard/[slug]/checkin/actions";
import { updateGuest } from "@/app/dashboard/[slug]/invitados/actions";
import { isValidElement, type ReactNode } from "react";
import GuestManagementPanel from "./GuestManagementPanel";
import ExportRSVPButton from "./ExportRSVPButton";
import CheckInPanel from "./CheckInPanel";
import LoadError from "./LoadError";

const mocks = vi.hoisted(() => ({
  results: {} as Record<string, { data: unknown; error: unknown }>,
  authError: null as unknown,
  userAvailable: true,
  update: vi.fn(),
  conditionalUpdate: vi.fn(),
  filter: vi.fn(),
  selectGuest: false,
  stateIndex: 0,
}));

// Render real page/component markup. Only the data source, navigation and the
// initial manual selection are simulated; this is not a browser integration test.
vi.mock("@/lib/supabase-server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: mocks.userAvailable ? { id: "test-owner" } : null }, error: mocks.authError }) },
    from: (table: string) => {
      let updating = false;
      const query = {
        select: () => query,
        eq: (column: string, value: unknown) => { mocks.filter(table, column, value); return query; },
        not: () => query,
        order: () => query,
        limit: () => query,
        is: (column: string, value: unknown) => { mocks.conditionalUpdate(column, value); return query; },
        update: (value: unknown) => { updating = true; mocks.update(value); return query; },
        maybeSingle: () => Promise.resolve(mocks.results[updating ? "update" : table]),
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(mocks.results[table]).then(resolve),
      };
      return query;
    },
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
  notFound: () => { throw new Error("test-not-found"); },
  redirect: () => { throw new Error("test-redirect"); },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (initial: unknown) => {
      const slot = mocks.stateIndex++;
      return actual.useState(mocks.selectGuest && slot < 2
        ? (slot === 0 ? { token: "test-token" } : "manual")
        : initial);
    },
  };
});

const event = { id: "test-event", slug: "evento-prueba", main_names: "Evento ficticio", title: "Prueba", event_date: "2030-01-01" };
const guest = {
  id: "test-guest", token: "test-token", full_name: "Persona ficticia", max_guests: 3,
  phone: null, email: null, notes: null, checked_in_at: null, checked_in_count: null,
};
const rsvp = {
  id: "test-rsvp", guest_id: guest.id, event_slug: event.slug, full_name: "Respuesta ficticia",
  attendance_status: "confirmed", guests_count: 2, message: "Mensaje ficticio", created_at: "2030-01-01T00:00:00Z",
};
const failure = { data: null, error: { code: "TEST", message: "INTERNAL_TEST_DETAILS" } };
const pages = [DashboardPage, GuestsPage, CheckInPage];
const params = () => ({ params: Promise.resolve({ slug: event.slug }) });
const htmlFor = async (page: typeof DashboardPage) => renderToStaticMarkup(await page(params()));

function findProps<P>(node: ReactNode, component: unknown): P | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findProps<P>(child, component);
      if (found) return found;
    }
  }
  if (!isValidElement<{ children?: ReactNode }>(node)) return undefined;
  if (node.type === component) return node.props as P;
  return findProps<P>(node.props.children, component);
}

function metric(html: string, label: string) {
  const match = html.match(new RegExp(`<p[^>]*>([^<]*)</p><p[^>]*>${label}</p>`));
  expect(match, `Metric missing: ${label}`).not.toBeNull();
  return match![1];
}

beforeEach(() => {
  mocks.results = {
    events: { data: event, error: null },
    event_guests: { data: [guest], error: null },
    rsvps: { data: [rsvp], error: null },
    update: { data: { checked_in_at: "2030-01-01T12:00:00Z", checked_in_count: 2 }, error: null },
  };
  mocks.authError = null;
  mocks.userAvailable = true;
  mocks.selectGuest = false;
  mocks.stateIndex = 0;
  mocks.update.mockClear();
  mocks.conditionalUpdate.mockClear();
  mocks.filter.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("dashboard source availability", () => {
  it("renders valid counts and the complete RSVP export", async () => {
    const html = await htmlFor(DashboardPage);
    expect(metric(html, "Registrados")).toBe("1");
    expect(metric(html, "Personas confirmadas")).toBe("2");
    expect(html).toContain("Exportar CSV");
    expect(html).toContain("Respuesta ficticia");
    expect(html).not.toContain("No disponible");
  });

  it("keeps genuine empty results distinct from failed queries", async () => {
    mocks.results.event_guests = { data: [], error: null };
    mocks.results.rsvps = { data: [], error: null };
    const html = await htmlFor(DashboardPage);
    expect(metric(html, "Registrados")).toBe("0");
    expect(metric(html, "Personas confirmadas")).toBe("0");
    expect(html).toContain("Aún no hay confirmaciones registradas");
    expect(html).not.toContain("Reintentar carga");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Exportar CSV/);
  });

  it("preserves guest metrics but hides RSVP metrics, history and export after an RSVP failure", async () => {
    mocks.results.rsvps = failure;
    const html = await htmlFor(DashboardPage);
    expect(metric(html, "Registrados")).toBe("1");
    expect(metric(html, "Pases disponibles")).toBe("3");
    expect(metric(html, "Confirmados")).toBe("No disponible");
    expect(metric(html, "Pendientes")).toBe("No disponible");
    expect(metric(html, "Asistencia real")).toBe("No disponible");
    expect(html).not.toContain("Exportar CSV");
    expect(html).not.toContain("Aún no hay confirmaciones");
    expect(html).not.toContain("0 registros");
    expect(html).toContain("Reintentar carga");
    expect(html).not.toContain("INTERNAL_TEST_DETAILS");
  });

  it("preserves RSVP history and its independent export when guests fail", async () => {
    mocks.results.event_guests = failure;
    const html = await htmlFor(DashboardPage);
    expect(metric(html, "Registrados")).toBe("No disponible");
    expect(metric(html, "Personas confirmadas")).toBe("No disponible");
    expect(html).toContain("Respuesta ficticia");
    expect(html).toContain("Exportar CSV");
  });
});

describe("guest list availability", () => {
  it("shows genuine absence of RSVP as pending and keeps valid guest tools", async () => {
    mocks.results.rsvps = { data: [], error: null };
    const html = await htmlFor(GuestsPage);
    expect(html).toContain("Persona ficticia");
    expect(html).toContain("Pendiente");
    expect(html).not.toContain("RSVP no disponible");
  });

  it("preserves the guest list but blocks management based on unknown RSVP", async () => {
    mocks.results.rsvps = failure;
    const html = await htmlFor(GuestsPage);
    expect(html).toContain("Persona ficticia");
    expect(html).toContain("1 registros");
    expect(html).toContain("RSVP no disponible");
    expect(html).not.toContain("Pendiente");
    expect(html).not.toContain("Editar invitado");
    expect(html).toContain("Reintentar carga");
  });

  it("does not report zero guests on failure", async () => {
    mocks.results.event_guests = failure;
    const html = await htmlFor(GuestsPage);
    expect(html).toContain("No pudimos cargar los invitados");
    expect(html).not.toContain("0 registros");
    expect(html).not.toContain("Aún no hay invitados");
  });

  it("shows the existing empty-list guidance after a successful empty query", async () => {
    mocks.results.event_guests = { data: [], error: null };
    const html = await htmlFor(GuestsPage);
    expect(html).toContain("Aún no hay invitados");
    expect(html).toContain("0 registros");
    expect(html).not.toContain("Reintentar carga");
  });
});

describe("check-in availability", () => {
  it("preserves access totals and guest identity but marks RSVP as unavailable", async () => {
    mocks.results.rsvps = failure;
    const html = await htmlFor(CheckInPage);
    expect(metric(html, "Pendientes de ingreso")).toBe("1");
    expect(metric(html, "Asistencia confirmada")).toBe("No disponible");
    expect(html).toContain("Persona ficticia");
    expect(html).toContain("RSVP no disponible");
  });

  it("does not present a failed directory as an empty search or zero totals", async () => {
    mocks.results.event_guests = failure;
    const html = await htmlFor(CheckInPage);
    expect(metric(html, "Personas ingresadas")).toBe("No disponible");
    expect(html).not.toContain("No encontramos invitados");
    expect(html).not.toContain("Buscar invitado");
  });

  it("preserves valid zero totals and empty search guidance", async () => {
    mocks.results.event_guests = { data: [], error: null };
    mocks.results.rsvps = { data: [], error: null };
    const html = await htmlFor(CheckInPage);
    expect(metric(html, "Personas ingresadas")).toBe("0");
    expect(html).toContain("No encontramos invitados");
    expect(html).not.toContain("Reintentar carga");
  });

  it.each([false, true])("only renders a selected guest's check-in form when RSVP loaded: %s", (available) => {
    mocks.selectGuest = true;
    const html = renderToStaticMarkup(createElement(CheckInPanel, {
      slug: event.slug, guestsAvailable: true, rsvpsAvailable: available,
      guests: [{ token: guest.token, fullName: guest.full_name, maxGuests: 3,
        rsvpAvailable: available, attendanceStatus: null, confirmedGuestsCount: null,
        checkedInAt: null, checkedInCount: null, phone: null, email: null }],
    }));
    expect(html.includes("Verificar y registrar check-in")).toBe(available);
    expect(html.includes("Este invitado todavía no tiene RSVP")).toBe(available);
    expect(html.includes('name="attendance_verified"')).toBe(available);
    expect(html.includes("Sin respuesta")).toBe(available);
  });

  it("returns an explicit unavailable RSVP for a successful individual lookup", async () => {
    mocks.results.event_guests = { data: guest, error: null };
    mocks.results.rsvps = failure;
    const form = new FormData();
    form.set("token", "test-token");
    const result = await searchCheckInGuest(event.slug, { message: "", guest: null }, form);
    expect(result.guest?.fullName).toBe("Persona ficticia");
    expect(result.guest?.rsvpAvailable).toBe(false);
    expect(result.message).not.toContain("INTERNAL_TEST_DETAILS");
  });

  it("blocks writes on RSVP failure and retains verification and atomic duplicate protection on retry", async () => {
    mocks.results.event_guests = { data: guest, error: null };
    mocks.results.rsvps = failure;
    const form = new FormData();
    form.set("checked_in_count", "2");
    form.set("attendance_verified", "yes");
    const initial = { message: "", success: false, checkedInAt: null, checkedInCount: null };
    expect((await markGuestCheckIn(event.slug, "test-token", initial, form)).success).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
    mocks.results.rsvps = { data: [rsvp], error: null };
    form.delete("attendance_verified");
    expect((await markGuestCheckIn(event.slug, "test-token", initial, form)).success).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
    form.set("attendance_verified", "yes");
    expect((await markGuestCheckIn(event.slug, "test-token", initial, form)).success).toBe(true);
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.conditionalUpdate).toHaveBeenCalledWith("checked_in_at", null);
  });
});

describe("manual reload and primary source errors", () => {
  it.each(pages)("does not confuse an unavailable session with a missing session", async (page) => {
    mocks.userAvailable = false;
    mocks.authError = { name: "AuthRetryableFetchError" };
    expect(await htmlFor(page)).toContain("No pudimos verificar tu sesión");
    mocks.authError = { name: "AuthSessionMissingError" };
    await expect(page(params())).rejects.toThrow("test-redirect");
  });

  it.each(pages)("recovers after an explicit reload when RSVP becomes available", async (page) => {
    mocks.results.rsvps = failure;
    expect(await htmlFor(page)).toContain("Reintentar carga");
    const reload = vi.fn();
    vi.stubGlobal("window", { location: { reload } });
    const control = LoadError({ message: "Error simulado" });
    expect(reload).not.toHaveBeenCalled();
    control.props.children[1].props.onClick();
    expect(reload).toHaveBeenCalledTimes(1);
    mocks.results.rsvps = { data: [rsvp], error: null };
    expect(await htmlFor(page)).not.toContain("Reintentar carga");
  });

  it.each(pages)("distinguishes a failed event lookup from a missing event", async (page) => {
    mocks.results.events = failure;
    const html = await htmlFor(page);
    expect(html).toContain("No pudimos cargar el evento");
    expect(html).not.toContain("INTERNAL_TEST_DETAILS");
    mocks.results.events = { data: null, error: null };
    await expect(page(params())).rejects.toThrow("test-not-found");
  });
});

describe("consistent current RSVP across readers", () => {
  it.each([
    ["confirmed", "declined", 2, 1],
    ["declined", "confirmed", 1, 3],
    ["confirmed", "confirmed", 2, 3],
  ])("uses the same latest state/count in dashboard, directory, editor and server: %s → %s", async (before, after, oldCount, newCount) => {
    const older = { ...rsvp, attendance_status: before, guests_count: oldCount, full_name: "Historial anterior" };
    const newer = { ...rsvp, id: "test-new", created_at: "2030-01-02T00:00:00Z", attendance_status: after, guests_count: newCount, full_name: "Historial reciente" };
    for (const rows of [[older, newer], [newer, older]]) {
      mocks.results.rsvps = { data: rows, error: null };
      mocks.results.event_guests = { data: [guest], error: null };
      const html = await htmlFor(DashboardPage);
      expect(metric(html, "Confirmados")).toBe(after === "confirmed" ? "1" : "0");
      expect(metric(html, "Personas confirmadas")).toBe(after === "confirmed" ? String(newCount) : "0");
      expect(html).toContain("Historial anterior");
      expect(html).toContain("Historial reciente");
      const page = await GuestsPage(params());
      expect(renderToStaticMarkup(page)).toContain(after === "confirmed" ? `Confirmado · ${newCount} asistentes` : "No asistirá");
      expect(findProps<{ confirmedGuestsCount: number }>(page, GuestManagementPanel)?.confirmedGuestsCount).toBe(after === "confirmed" ? newCount : 0);
      const checkin = await CheckInPage(params());
      const props = findProps<{ guests: Array<{ attendanceStatus: string; confirmedGuestsCount: number }> }>(checkin, CheckInPanel)!;
      expect(props.guests[0]).toMatchObject({ attendanceStatus: after, confirmedGuestsCount: newCount });

      mocks.results.event_guests = { data: guest, error: null };
      const lookup = new FormData();
      lookup.set("token", "test-token");
      const found = await searchCheckInGuest(event.slug, { message: "", guest: null }, lookup);
      expect(found.guest).toMatchObject({ attendanceStatus: after, confirmedGuestsCount: newCount, rsvpAvailable: true });
      const entry = new FormData();
      entry.set("checked_in_count", "1");
      entry.set("attendance_verified", "yes");
      const marked = await markGuestCheckIn(event.slug, "test-token", { message: "", success: false, checkedInAt: null, checkedInCount: null }, entry);
      expect(marked.success).toBe(after === "confirmed");
      const edit = new FormData();
      edit.set("full_name", "Persona ficticia");
      edit.set("max_guests", "1");
      const edited = await updateGuest(event.slug, guest.id, { message: "", success: false }, edit);
      expect(edited.success).toBe(after === "declined");
      expect(mocks.filter).toHaveBeenCalledWith("events", "owner_id", "test-owner");
      expect(mocks.filter).toHaveBeenCalledWith("event_guests", "event_id", event.id);
      expect(mocks.filter).toHaveBeenCalledWith("rsvps", "event_slug", event.slug);
      expect(mocks.filter).toHaveBeenCalledWith("rsvps", "guest_id", guest.id);
    }
  });

  it.each([{ attendance_status: "declined" }, { guests_count: 3 }])("blocks incompatible latest ties everywhere, without hiding history: %j", async (difference) => {
    mocks.results.rsvps = { data: [rsvp, { ...rsvp, id: "test-conflict", ...difference }], error: null };
    const dashboard = await DashboardPage(params());
    const html = renderToStaticMarkup(dashboard);
    expect(metric(html, "Confirmados")).toBe("No disponible");
    expect(metric(html, "Pendientes")).toBe("No disponible");
    expect(html).toContain("respuestas ambiguas");
    expect(html).toContain("2 registros");
    const exportProps = findProps<{ rsvps: unknown[] }>(dashboard, ExportRSVPButton);
    expect(exportProps?.rsvps).toHaveLength(2);
    const directory = await GuestsPage(params());
    expect(renderToStaticMarkup(directory)).toContain("RSVP ambiguo");
    expect(findProps(directory, GuestManagementPanel)).toBeUndefined();
    mocks.selectGuest = true;
    mocks.stateIndex = 0;
    const checkin = await htmlFor(CheckInPage);
    expect(checkin).toContain("RSVP ambiguo");
    expect(checkin).not.toContain("Verificar y registrar check-in");
    expect(checkin).not.toContain("todavía no tiene RSVP");
    mocks.results.event_guests = { data: guest, error: null };
    const lookup = new FormData();
    lookup.set("token", "test-token");
    expect((await searchCheckInGuest(event.slug, { message: "", guest: null }, lookup)).guest).toMatchObject({ rsvpAvailable: false, rsvpAmbiguous: true });
    const entry = new FormData();
    entry.set("checked_in_count", "2");
    entry.set("attendance_verified", "yes");
    entry.set("override_declined", "true");
    expect((await markGuestCheckIn(event.slug, "test-token", { message: "", success: false, checkedInAt: null, checkedInCount: null }, entry)).success).toBe(false);
    const edit = new FormData();
    edit.set("full_name", "Persona ficticia");
    edit.set("max_guests", "3");
    expect((await updateGuest(event.slug, guest.id, { message: "", success: false }, edit)).message).toContain("ambiguo");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("keeps empty RSVP valid and blocks editing on query failure", async () => {
    mocks.results.event_guests = { data: guest, error: null };
    const form = new FormData();
    form.set("full_name", "Persona ficticia");
    form.set("max_guests", "3");
    mocks.results.rsvps = failure;
    expect((await updateGuest(event.slug, guest.id, { message: "", success: false }, form)).success).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
    mocks.results.rsvps = { data: [], error: null };
    expect((await updateGuest(event.slug, guest.id, { message: "", success: false }, form)).success).toBe(true);
  });
});
