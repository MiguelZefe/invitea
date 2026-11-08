import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CommercialLab, { demoExpiryMessage } from "./CommercialLab";
import { DRAFT_TTL_MS, STORAGE_KEY } from "@/lib/commercial-lab/draft";

// Same dependency-free handler harness as existing component tests; not a DOM/E2E test.
const hooks = vi.hoisted(() => ({ slots: [] as unknown[], cursor: 0, effects: [] as (() => void)[] }));
vi.mock("react", async original => ({
  ...await original<typeof import("react")>(),
  useState(initial: unknown) {
    const index = hooks.cursor++;
    if (!(index in hooks.slots)) hooks.slots[index] = initial;
    return [hooks.slots[index], (value: unknown) => { hooks.slots[index] = value; }];
  },
  useEffect(effect: () => void) { hooks.effects.push(effect); },
}));

type Props = { children?: ReactNode; value?: string; onChange?: (e: { target: { value: string } }) => void; onClick?: () => void; onSubmit?: (e: { preventDefault: () => void }) => void };
function elements(node: ReactNode): ReactElement<Props>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<Props>(node)) return [];
  return [node, ...elements(node.props.children)];
}
function mount() {
  hooks.slots = []; hooks.cursor = 0; hooks.effects = [];
  let view = CommercialLab();
  hooks.effects[0]();
  function render() { hooks.cursor = 0; view = CommercialLab(); }
  render();
  return {
    change(index: number, value: string) {
      elements(view).filter(n => n.type === "input" || n.type === "select")[index].props.onChange!({ target: { value } }); render();
    },
    save() { elements(view).find(n => n.type === "form")!.props.onSubmit!({ preventDefault() {} }); render(); },
    showRemaining(ms: number) { hooks.slots[7] = ms; render(); },
    startCountdown() { hooks.effects.at(-1)?.(); },
    refresh: render,
    preview() { elements(view).filter(n => n.type === "button")[1].props.onClick!(); render(); },
    click(label: string) {
      const button = elements(view).find(n => n.type === "button" && n.props.children === label);
      if (!button) throw new Error(`Missing button: ${label}`);
      button.props.onClick!(); render();
    },
    html: () => renderToStaticMarkup(view),
  };
}
let data: Map<string, string>;
let scheduledUpdate: (() => void) | null;

it("warns at ten, five and one minute without warning after expiry", () => {
  expect(demoExpiryMessage(10 * 60 * 1000)).toContain("10 minutos");
  expect(demoExpiryMessage(5 * 60 * 1000)).toContain("5 minutos");
  expect(demoExpiryMessage(60 * 1000)).toContain("1 minuto");
  expect(demoExpiryMessage(0)).toBeNull();
  expect(demoExpiryMessage(null)).toBeNull();
});

it("does not promise account preservation for a saved local demo", () => {
  const lab = mount();
  lab.save();
  lab.showRemaining(30 * 60 * 1000);
  expect(lab.html()).toContain("Guardar con una cuenta aún no está disponible");
  expect(lab.html()).not.toContain("/registro?next=%2Flaboratorio-comercial");
});

it("exposes every available event sample without expanding the local draft contract", () => {
  const html = mount().html();
  for (const label of ["Cumpleaños", "Bautizo", "Baby shower", "Boda", "XV años", "Primera comunión", "Graduación", "Aniversario"]) expect(html).toContain(label);
  expect(html).toContain("limitado a Boda y Baby shower");
});

beforeEach(() => {
  data = new Map();
  scheduledUpdate = null;
  vi.stubGlobal("window", {
    localStorage: { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) },
    setTimeout: (callback: () => void) => { scheduledUpdate = callback; return 1; },
    clearTimeout: () => {},
    setInterval: () => 2,
    clearInterval: () => {},
  });
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("No network allowed"); }));
});
afterEach(() => { expect(fetch).not.toHaveBeenCalled(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("removes the local draft when the open demo reaches its expiry", () => {
  const clock = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
  const lab = mount();
  lab.save();
  lab.startCountdown();
  clock.mockReturnValue(1_000_000 + DRAFT_TTL_MS);
  scheduledUpdate?.();
  lab.refresh();
  expect(data.has(STORAGE_KEY)).toBe(false);
  expect(lab.html()).toContain("El borrador temporal se eliminó de este navegador");
});

it("does not claim deletion when browser storage rejects removal", () => {
  const clock = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
  const lab = mount();
  lab.save();
  vi.spyOn(window.localStorage, "removeItem").mockImplementation(() => { throw new Error("blocked"); });
  lab.startCountdown();
  clock.mockReturnValue(1_000_000 + DRAFT_TTL_MS);
  scheduledUpdate?.();
  lab.refresh();
  expect(data.has(STORAGE_KEY)).toBe(true);
  expect(lab.html()).toContain("No se pudo confirmar la eliminación");
  lab.click("Volver a empezar");
  expect(lab.html()).toContain("No se pudo borrar el borrador local");
  expect(data.has(STORAGE_KEY)).toBe(true);
});

it("creates, edits, saves, remounts and previews both templates without network", () => {
  const lab = mount();
  lab.save();
  expect(JSON.parse(data.get(STORAGE_KEY)!).draft.state).toBe("draft");
  lab.preview();
  expect(lab.html()).toContain("Nuestra boda");
  lab.change(0, "baby-shower"); lab.change(1, "Estrella ficticia");
  lab.change(2, "2026-12-20"); lab.change(3, "Casa imaginaria"); lab.save();
  const reloaded = mount();
  expect(reloaded.html()).toContain("Borrador recuperado");
  reloaded.preview();
  for (const text of ["Celebramos un baby shower", "Estrella ficticia", "2026-12-20", "Casa imaginaria", "$99 MXN", "Sin publicar"]) expect(reloaded.html()).toContain(text);
  expect(reloaded.html()).not.toMatch(/<img|<audio/);
});

it("reports quota failures without claiming a successful save", () => {
  const lab = mount();
  vi.spyOn(window.localStorage, "setItem").mockImplementation(() => { throw new Error("quota"); });
  lab.change(1, "Nombre inventado"); lab.save();
  expect(lab.html()).toContain("No se pudo guardar");
  expect(lab.html()).toContain("Nombre inventado");
});

it("does not overwrite corrupt storage automatically", () => {
  data.set(STORAGE_KEY, "broken");
  expect(mount().html()).toContain("No se pudo recuperar");
  expect(data.get(STORAGE_KEY)).toBe("broken");
});

it("simulates rejection, retry and approval without persisting payment or publishing", () => {
  const lab = mount(); lab.save();
  const saved = data.get(STORAGE_KEY);
  lab.click("Revisar compra simulada");
  lab.click("Simular pago de $99 MXN");
  expect(lab.html()).toContain("Pago simulado pendiente");
  lab.click("Simular rechazo");
  expect(lab.html()).toContain("Pago simulado rechazado");
  lab.click("Volver a intentar"); lab.click("Simular pago de $99 MXN");
  lab.click("Simular aprobación");
  expect(lab.html()).toContain("Pago simulado aprobado");
  expect(lab.html()).toContain("borrador local, sin publicar");
  expect(data.get(STORAGE_KEY)).toBe(saved);
  expect(mount().html()).not.toContain("Pago simulado aprobado");
});

it("cancels a simulation and invalidates the summary when the draft changes", () => {
  const lab = mount(); lab.click("Revisar compra simulada");
  lab.click("Cancelar simulación");
  expect(lab.html()).toContain("Pago simulado cancelado");
  lab.click("Volver a intentar"); lab.click("Simular pago de $99 MXN");
  lab.change(1, "Otro nombre ficticio");
  expect(lab.html()).not.toContain("Resumen de compra");
  lab.click("Revisar compra simulada");
  expect(lab.html()).toContain("Simular pago de $99 MXN");
  expect(lab.html()).not.toContain("Pago simulado pendiente");
});

it("rejects invalid drafts before simulation", () => {
  const lab = mount(); lab.change(1, "   "); lab.click("Revisar compra simulada");
  expect(lab.html()).toContain("Completa nombres, fecha y ubicación");
  expect(lab.html()).not.toContain("Resumen de compra");
});
