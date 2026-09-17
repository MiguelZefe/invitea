import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DemoRSVP from "./DemoRSVP";

// Exercise rendered elements and handlers without an additional DOM dependency.
const harness = vi.hoisted(() => ({ slots: [] as unknown[], cursor: 0, rpc: vi.fn(), from: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { rpc: harness.rpc, from: harness.from } }));
vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useState: (initial: unknown) => {
    const slot = harness.cursor++;
    if (!(slot in harness.slots)) harness.slots[slot] = initial;
    return [harness.slots[slot], (value: unknown) => { harness.slots[slot] = value; }];
  },
}));

type Props = {
  children?: ReactNode;
  id?: string;
  href?: string;
  type?: string;
  value?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  onBlur?: unknown;
  onChange?: (event: { target: { value: string }; currentTarget: { value: string } }) => void;
  onClick?: (event: { currentTarget: { form: { reportValidity: () => boolean; querySelector: (selector: string) => { focus: () => void } } } }) => void;
  onSubmit?: (event: { preventDefault: () => void }) => void;
};
function elements(node: ReactNode): ReactElement<Props>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Props>(node)) return [];
  return [node, ...elements(node.props.children)];
}
function form(theme: "baby" | "wedding" = "baby") {
  let view: ReactElement;
  const render = () => { harness.cursor = 0; view = DemoRSVP({ theme }); };
  render();
  const find = (type: string) => elements(view).find((node) => node.type === type)!.props;
  return {
    field: (id: string) => elements(view).find((node) => node.props.id === `demo-${id}`)!.props,
    click(valid = true) {
      const reportValidity = vi.fn(() => valid);
      const focus = vi.fn();
      const querySelector = vi.fn(() => ({ focus }));
      elements(view).find((node) => node.type === "button" && node.props.type === "button")!.props.onClick!({ currentTarget: { form: { reportValidity, querySelector } } });
      render();
      return { reportValidity, focus, querySelector };
    },
    html: () => renderToStaticMarkup(view),
    change(id: string, value: string) {
      elements(view).find((node) => node.props.id === `demo-${id}`)!.props.onChange!({ target: { value }, currentTarget: { value } });
      render();
    },
    submit() { const preventDefault = vi.fn(); find("form").onSubmit!({ preventDefault }); render(); return preventDefault; },
  };
}
beforeEach(() => {
  harness.slots = []; harness.cursor = 0;
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("window", { open: vi.fn() });
});
afterEach(() => {
  expect(fetch).not.toHaveBeenCalled();
  expect(harness.rpc).not.toHaveBeenCalled();
  expect(harness.from).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

it("encodes the demo recipient, event, attendance, count and optional Spanish message", () => {
  const demo = form();
  demo.change("attendance", "confirmed");
  demo.change("guests", "3");
  demo.change("message", " ¡Qué emoción! & cariño + regalos 🎉\nNos vemos. ");
  const expected = "Evento: Baby shower de Liam Alejandro\nAsistencia: Asistiré.\nCantidad de asistentes: 3\nMensaje: ¡Qué emoción! & cariño + regalos 🎉\nNos vemos.";
  demo.click();
  expect(window.open).toHaveBeenCalledExactlyOnceWith(`https://wa.me/525530518141?text=${encodeURIComponent(expected)}`, "_blank", "noopener,noreferrer");
  const url = new URL(vi.mocked(window.open).mock.calls[0][0] as string);
  expect(url.searchParams.get("text")).toBe(expected);
  expect([...url.searchParams.keys()]).toEqual(["text"]);
  expect(demo.html().indexOf("Confirmar por WhatsApp")).toBeLessThan(demo.html().indexOf("Probar confirmación simulada"));
});

it("omits all quantity references when declining and omits an empty optional message", () => {
  const demo = form();
  demo.change("attendance", "confirmed");
  demo.change("guests", "5");
  demo.change("attendance", "declined");
  demo.change("message", "   ");
  demo.click();
  expect(window.open).toHaveBeenCalledOnce();
  expect(new URL(vi.mocked(window.open).mock.calls[0][0] as string).searchParams.get("text")).toBe("Evento: Baby shower de Liam Alejandro\nAsistencia: No podré asistir.");
});

it.each([false, true])("opens only after native form validation succeeds (%s)", (valid) => {
  const demo = form();
  demo.change("attendance", "confirmed");
  const { reportValidity } = demo.click(valid);
  expect(reportValidity).toHaveBeenCalledOnce();
  expect(window.open).toHaveBeenCalledTimes(valid ? 1 : 0);
});

it("never sends automatically when rendering, editing, or submitting the simulation", () => {
  const demo = form();
  demo.change("attendance", "confirmed");
  demo.change("guests", "2");
  demo.change("message", "Prueba");
  expect(demo.submit()).toHaveBeenCalledOnce();
  expect(demo.html()).toContain("ningún dato fue enviado ni guardado");
  expect(window.open).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
  expect(harness.rpc).not.toHaveBeenCalled();
  expect(harness.from).not.toHaveBeenCalled();
});

it("keeps the wedding demo free of the test recipient and WhatsApp action", () => {
  const demo = form("wedding");
  expect(demo.html()).not.toContain("wa.me");
  expect(demo.html()).not.toContain("525530518141");
  expect(demo.html()).not.toContain("Confirmar por WhatsApp");
  expect(demo.html()).not.toContain("55 3051 8141");
  expect(demo.html()).toContain("Probar confirmación");
});

it.each(["1", "6"])("opens once for %s attendees without an optional message", (count) => {
  const demo = form();
  demo.change("attendance", "confirmed");
  demo.change("guests", count);
  demo.click();
  const expected = `Evento: Baby shower de Liam Alejandro\nAsistencia: Asistiré.\nCantidad de asistentes: ${count}`;
  expect(window.open).toHaveBeenCalledExactlyOnceWith(`https://wa.me/525530518141?text=${encodeURIComponent(expected)}`, "_blank", "noopener,noreferrer");
});

it.each(["", "unexpected"])("rejects disallowed attendance %j even if native validity is simulated as true", (status) => {
  const demo = form();
  demo.change("attendance", status);
  const { focus, querySelector } = demo.click();
  expect(window.open).not.toHaveBeenCalled();
  expect(querySelector).toHaveBeenCalledWith("#demo-attendance");
  expect(focus).toHaveBeenCalledOnce();
  expect(demo.field("attendance").value).toBe(status);
});

it.each(["", "0", "-1", "1.5", "abc", "7"])("preserves invalid quantity %j and allows one opening after correction", (count) => {
  const demo = form();
  demo.change("attendance", "confirmed");
  demo.change("guests", count);
  demo.change("message", "Mensaje ficticio");
  expect(demo.field("guests").onBlur).toBeUndefined();
  // Force native validity true to independently exercise the explicit guard.
  const { focus, querySelector } = demo.click();
  expect(window.open).not.toHaveBeenCalled();
  expect(querySelector).toHaveBeenCalledWith("#demo-guests");
  expect(focus).toHaveBeenCalledOnce();
  expect(demo.field("guests").value).toBe(count);
  expect(demo.field("message").value).toBe("Mensaje ficticio");
  demo.change("guests", "2");
  demo.click();
  expect(window.open).toHaveBeenCalledOnce();
});

it("renders native constraints and a non-navigation button in all form states", () => {
  const demo = form();
  expect(demo.field("attendance").required).toBe(true);
  expect(demo.html()).not.toContain("href=");
  demo.change("attendance", "confirmed");
  expect(demo.field("guests")).toMatchObject({ required: true, min: 1, max: 6, step: 1 });
  expect(demo.html()).toContain('type="button"');
  expect(demo.html()).not.toContain("href=");
  demo.change("guests", "");
  expect(demo.html()).not.toContain("href=");
  expect(window.open).not.toHaveBeenCalled();
});
