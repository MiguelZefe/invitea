import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isValidElement, type ComponentProps, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WeddingRSVP from "./WeddingRSVP";

// No DOM test environment is installed. Exercise the actual form handlers and
// rendered output with persistent hook slots; browser event dispatch is not covered.
const harness = vi.hoisted(() => ({ slots: [] as unknown[], cursor: 0, rpc: vi.fn() }));

vi.mock("@/lib/supabase", () => ({ supabase: { rpc: harness.rpc } }));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useId: () => "rsvp-test",
  useState: (initial: unknown) => {
    const slot = harness.cursor++;
    if (!(slot in harness.slots)) harness.slots[slot] = initial;
    return [harness.slots[slot], (value: unknown) => { harness.slots[slot] = value; }];
  },
  useRef: (initial: unknown) => {
    const slot = harness.cursor++;
    if (!(slot in harness.slots)) harness.slots[slot] = { current: initial };
    return harness.slots[slot];
  },
}));

type Props = ComponentProps<typeof WeddingRSVP>;
type ElementProps = {
  children?: ReactNode;
  id?: string;
  type?: string;
  value?: string | number;
  disabled?: boolean;
  max?: number;
  onChange?: (event: { target: { value: string } }) => void;
  onSubmit?: (event: { preventDefault: () => void }) => Promise<void>;
  onClick?: (event: { currentTarget: { form: { reportValidity: () => boolean; elements: { namedItem: () => { disabled: boolean } } } } }) => void;
};

function elements(node: ReactNode): ReactElement<ElementProps>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<ElementProps>(node)) return [];
  return [node, ...elements(node.props.children)];
}

function renderForm(overrides: Partial<Props> = {}) {
  let view: ReactElement;
  const render = () => {
    harness.cursor = 0;
    view = WeddingRSVP({ eventSlug: "evento-prueba", theme: "baby", ...overrides });
  };
  const find = (predicate: (node: ReactElement<ElementProps>) => boolean) => {
    const node = elements(view).find(predicate);
    if (!node) throw new Error("Expected form element was not rendered");
    return node.props;
  };
  render();
  return {
    render,
    html: () => renderToStaticMarkup(view),
    field: (name: string) => find((node) => node.props.id === `rsvp-test-${name}`),
    button: () => find((node) => node.type === "button" && node.props.type === "submit"),
    whatsapp(valid = true) {
      const reportValidity = vi.fn(() => valid);
      find((node) => node.type === "button" && node.props.type === "button").onClick!({ currentTarget: { form: { reportValidity, elements: { namedItem: () => ({ disabled: false }) } } } });
      render();
      return reportValidity;
    },
    change(name: string, value: string) {
      find((node) => node.props.id === `rsvp-test-${name}`).onChange!({ target: { value } });
      render();
    },
    submit: () => find((node) => node.type === "form").onSubmit!({ preventDefault: vi.fn() }),
  };
}

function fill(form: ReturnType<typeof renderForm>, status = "confirmed") {
  form.change("name", "Persona de prueba");
  form.change("attendance", status);
  form.change("count", "3");
  form.change("message", "Mensaje ficticio");
}

function deferredResponse() {
  let resolve!: (result: { error: null }) => void;
  const promise = new Promise<{ error: null }>((done) => { resolve = done; });
  harness.rpc.mockReturnValue(promise);
  return () => resolve({ error: null });
}

beforeEach(() => {
  harness.slots = [];
  harness.cursor = 0;
  harness.rpc.mockReset().mockResolvedValue({ error: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("real form WhatsApp with simulated browser responses", () => {
  const config = { eventTitle: "Celebración ficticia", whatsappNumber: "12025550100", whatsappPrimary: true };
  beforeEach(() => {
    vi.stubGlobal("window", { open: vi.fn(() => null) });
    vi.stubGlobal("fetch", vi.fn());
  });

  it.each(["baby", "wedding"] as const)("prioritizes WhatsApp for %s without navigable hrefs", (theme) => {
    const form = renderForm({ ...config, theme });
    expect(form.html().indexOf("Confirmar por WhatsApp")).toBeLessThan(form.html().indexOf("Enviar confirmación"));
    expect(form.html()).not.toContain("href=");
    expect(form.html()).toContain('type="button"');
    expect(window.open).not.toHaveBeenCalled();
  });
  it("keeps RSVP first when WhatsApp is an alternative", () => {
    const form = renderForm({ ...config, whatsappPrimary: false });
    expect(form.html().indexOf("Enviar confirmación")).toBeLessThan(form.html().indexOf("Confirmar por WhatsApp"));
  });
  it.each([undefined, null, "", "not-a-number"])("does not offer WhatsApp with recipient %s", (whatsappNumber) => {
    const form = renderForm({ ...config, whatsappNumber });
    expect(form.html()).not.toContain("Confirmar por WhatsApp");
    expect(form.html()).toContain("Enviar confirmación");
  });
  it("encodes only public message fields and opens once without writing RSVP", () => {
    const form = renderForm({ ...config, guestToken: "private-test-token", initialFullName: "Persona ficticia", maxGuests: 4 });
    form.change("attendance", "confirmed");
    form.change("count", "3");
    form.change("message", "  Cariño & alegría + 🎉\n¡Sí!  ");
    expect(window.open).not.toHaveBeenCalled();
    form.whatsapp(); form.whatsapp();
    const text = "Evento: Celebración ficticia\nNombre: Persona ficticia\nAsistiré.\nCantidad de asistentes: 3\nMensaje: Cariño & alegría + 🎉\n¡Sí!";
    expect(window.open).toHaveBeenCalledExactlyOnceWith(`https://wa.me/12025550100?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    expect(decodeURIComponent(vi.mocked(window.open).mock.calls[0][0] as string)).not.toMatch(/private-test-token|evento-prueba/);
    expect(harness.rpc).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(form.html()).not.toContain("¡Tu asistencia está confirmada!");
  });
  it("omits quantity and empty message for a declined response", () => {
    const form = renderForm(config); fill(form, "declined");
    form.change("count", ""); form.change("message", "  "); form.whatsapp();
    const url = new URL(vi.mocked(window.open).mock.calls[0][0] as string);
    expect(url.searchParams.get("text")).toBe("Evento: Celebración ficticia\nNombre: Persona de prueba\nNo podré asistir.");
    expect(harness.rpc).not.toHaveBeenCalled();
  });
  it.each(["", "0", "-1", "1.5", "abc", "3"])("preserves invalid personal count %j and allows correction", (count) => {
    const form = renderForm({ ...config, maxGuests: 2 }); fill(form);
    form.change("count", count); form.whatsapp();
    expect(window.open).not.toHaveBeenCalled();
    expect(form.field("count").value).toBe(count);
    expect(form.field("message").value).toBe("Mensaje ficticio");
    form.change("count", "2"); form.whatsapp();
    expect(window.open).toHaveBeenCalledOnce();
    expect(harness.rpc).not.toHaveBeenCalled();
  });
  it("keeps general invitations without a new maximum", () => {
    const form = renderForm(config); fill(form); form.change("count", "20"); form.whatsapp();
    expect(form.field("count").max).toBeUndefined();
    expect(window.open).toHaveBeenCalledOnce();
  });
  it("rejects missing names and attendance and respects native validation", () => {
    const form = renderForm(config);
    form.whatsapp(); expect(window.open).not.toHaveBeenCalled();
    form.change("name", "Persona ficticia"); form.whatsapp();
    expect(window.open).not.toHaveBeenCalled();
    form.change("attendance", "confirmed");
    expect(form.whatsapp(false)).toHaveBeenCalledOnce();
    expect(window.open).not.toHaveBeenCalled();
    form.whatsapp(); expect(window.open).toHaveBeenCalledOnce();
  });
  it("does not open while an RSVP is being submitted", async () => {
    const resolve = deferredResponse(); const form = renderForm(config); fill(form);
    const pending = form.submit(); form.whatsapp();
    expect(window.open).not.toHaveBeenCalled();
    expect(harness.rpc).toHaveBeenCalledOnce(); resolve(); await pending;
  });
  it.each(["null", "throw"])("preserves values and RSVP after opening returns %s", (result) => {
    if (result === "throw") vi.mocked(window.open).mockImplementation(() => { throw new Error("Simulated popup failure"); });
    const form = renderForm(config); fill(form); form.whatsapp();
    expect(form.html()).toContain('role="status"');
    expect(form.html()).toContain("Puedes usar Enviar confirmación");
    expect(form.button().disabled).toBe(false);
    expect(form.field("message").value).toBe("Mensaje ficticio");
    expect(harness.rpc).not.toHaveBeenCalled();
  });
  it("uses each event's own recipient and title", () => {
    const first = renderForm(config); fill(first); first.whatsapp();
    harness.slots = [];
    const second = renderForm({ ...config, eventTitle: "Otro evento ficticio", whatsappNumber: "12025550101" });
    fill(second); second.whatsapp();
    const calls = vi.mocked(window.open).mock.calls;
    expect(new URL(calls[0][0] as string).pathname).toBe("/12025550100");
    expect(new URL(calls[1][0] as string).pathname).toBe("/12025550101");
    expect(new URL(calls[1][0] as string).searchParams.get("text")).toContain("Otro evento ficticio");
    expect(harness.rpc).not.toHaveBeenCalled();
  });
});

describe("RSVP form behavior with simulated responses", () => {
  it("waits for success and reports the submitted count even if fields change while pending", async () => {
    const resolve = deferredResponse();
    const form = renderForm();
    fill(form);
    const pending = form.submit();
    form.render();
    expect(form.html()).not.toContain("¡Tu asistencia está confirmada!");
    expect(form.button().disabled).toBe(true);
    expect(form.html()).toContain("Enviando...");
    form.change("count", "2");
    resolve();
    await pending;
    form.render();
    expect(form.html()).toContain("Confirmaste 3 asistentes");
    expect(form.button().disabled).toBe(false);
    expect(harness.rpc).toHaveBeenCalledWith("submit_public_rsvp", expect.objectContaining({
      p_attendance_status: "confirmed", p_guests_count: 3,
    }));
  });

  it("acknowledges a declined response without claiming attendance is confirmed", async () => {
    const form = renderForm();
    fill(form, "declined");
    await form.submit();
    form.render();
    expect(form.html()).toContain("Registramos que no podrás asistir");
    expect(form.html()).not.toContain("¡Tu asistencia está confirmada!");
    expect(harness.rpc).toHaveBeenCalledWith("submit_public_rsvp", expect.objectContaining({ p_attendance_status: "declined" }));
  });

  it("preserves the form after server rejection and allows a successful retry", async () => {
    harness.rpc.mockResolvedValueOnce({ error: { code: "TEST", message: "test_rejection" } });
    const form = renderForm();
    fill(form);
    await form.submit();
    form.render();
    expect(form.html()).toContain('role="alert"');
    expect(form.html()).not.toContain('role="status"');
    expect(form.field("name").value).toBe("Persona de prueba");
    expect(form.field("attendance").value).toBe("confirmed");
    expect(form.field("count").value).toBe(3);
    expect(form.field("message").value).toBe("Mensaje ficticio");
    expect(form.button().disabled).toBe(false);
    await form.submit();
    form.render();
    expect(harness.rpc).toHaveBeenCalledTimes(2);
    expect(form.html()).toContain("Confirmaste 3 asistentes");
    expect(form.html()).not.toContain('role="alert"');
  });

  it("clears prior success on a network failure and unlocks the form for retry", async () => {
    const form = renderForm();
    fill(form);
    await form.submit();
    form.render();
    expect(form.html()).toContain('role="status"');
    fill(form);
    harness.rpc.mockRejectedValueOnce(new Error("Simulated offline"));
    await form.submit();
    form.render();
    expect(form.html()).toContain("Revisa tu conexión");
    expect(form.html()).not.toContain('role="status"');
    expect(form.button().disabled).toBe(false);
    expect(form.field("count").value).toBe(3);
    await form.submit();
    form.render();
    expect(form.html()).toContain("Confirmaste 3 asistentes");
  });

  it.each([false, true])("prevents concurrent submits (rerender between events: %s)", async (rerender) => {
    const resolve = deferredResponse();
    const form = renderForm();
    fill(form);
    const first = form.submit();
    if (rerender) form.render();
    const second = form.submit();
    const callsWhilePending = harness.rpc.mock.calls.length;
    resolve();
    await Promise.all([first, second]);
    expect(callsWhilePending).toBe(1);
    form.render();
    expect(form.button().disabled).toBe(false);
    expect(form.html()).toContain("Confirmaste 3 asistentes");
  });

  it("keeps personal submissions within the assigned pass limit", async () => {
    const form = renderForm({ initialFullName: "Persona de prueba", guestToken: "test-only-token", maxGuests: 2 });
    form.change("attendance", "confirmed");
    form.change("count", "9");
    expect(form.field("count").max).toBe(2);
    expect(form.field("count").value).toBe(2);
    await form.submit();
    form.render();
    expect(harness.rpc).toHaveBeenCalledWith("submit_public_rsvp", expect.objectContaining({ p_guests_count: 2, p_guest_token: "test-only-token" }));
    expect(form.html()).toContain("Confirmaste 2 asistentes");
  });
});
