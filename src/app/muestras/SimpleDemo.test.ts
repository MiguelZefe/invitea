import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SimpleDemo from "./SimpleDemo";

const harness = vi.hoisted(() => ({ slots: [] as unknown[], cursor: 0 }));

vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useState: (initial: unknown) => {
    const slot = harness.cursor++;
    if (!(slot in harness.slots)) harness.slots[slot] = initial;
    return [harness.slots[slot], (next: unknown) => {
      harness.slots[slot] = typeof next === "function"
        ? (next as (current: unknown) => unknown)(harness.slots[slot])
        : next;
    }];
  },
  useRef: (initial: unknown) => {
    const slot = harness.cursor++;
    if (!(slot in harness.slots)) harness.slots[slot] = { current: initial };
    return harness.slots[slot];
  },
  useEffect: () => {},
}));

type ElementProps = {
  id?: string;
  value?: string;
  checked?: boolean;
  children?: ReactNode;
  onChange?: (event: { target: { value: string; checked: boolean; files?: File[] | null } }) => void;
  onClick?: () => void;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "data-template"?: string;
};

function elements(node: ReactNode): ReactElement<ElementProps>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<ElementProps>(node)) return [];
  return [node, ...elements(node.props.children)];
}

const props = {
  type: "Cumpleaños" as const,
  name: "Sofía",
  intro: "¡Es mi cumpleaños!",
  message: "Ven a celebrar mis 5 años.",
  date: "2026-12-12",
  time: "16:00",
  place: "Jardín de ejemplo",
};

function demo() {
  let view: ReactElement;
  const render = () => {
    harness.cursor = 0;
    view = SimpleDemo(props);
  };
  render();
  const all = () => elements(view);
  const change = (id: string, value: string, checked = false) => {
    all().find((node) => node.props.id === id)!.props.onChange!({ target: { value, checked } });
    render();
  };
  const changeImage = (file: File) => {
    all().find((node) => node.props.id === "sample-cover-image")!.props.onChange!({ target: { value: "", checked: false, files: [file] } });
    render();
  };
  return {
    change,
    changeImage,
    choosePalette(label: string) {
      all().find((node) => node.props["aria-label"] === label)!.props.onClick!();
      render();
    },
    chooseTemplate(label: string) {
      all().find((node) => node.props["aria-label"] === label)!.props.onClick!();
      render();
    },
    toggleLetter() {
      all().find((node) => node.props["aria-controls"] === "sample-invitation-preview")!.props.onClick!();
      render();
    },
    templateCount: () => all().filter((node) => node.props["data-template"] === "yes").length,
    html: () => renderToStaticMarkup(view),
  };
}

beforeEach(() => {
  harness.slots = [];
  harness.cursor = 0;
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  expect(fetch).not.toHaveBeenCalled();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("updates invitation copy, palette, typography and motion in the live preview", () => {
  const sample = demo();
  sample.change("sample-name", "Ana y Luis");
  sample.change("sample-intro", "Nos casamos");
  sample.change("sample-message", "Acompáñanos a celebrar.");
  sample.change("sample-date", "2027-04-18");
  sample.change("sample-time", "18:30");
  sample.change("sample-place", "Jardín de las Nubes");
  sample.choosePalette("Lavanda");
  expect(sample.html()).toContain("--sample-accent:#755b91");
  sample.change("sample-background-color", "#fcebd6");
  sample.change("sample-accent-color", "#714ea0");
  sample.change("sample-button-color", "#453055");
  sample.change("sample-font", "sans");
  sample.change("sample-layout", "poster");
  sample.change("sample-decorations", "", false);

  const html = sample.html();
  expect(html).toContain("Ana y Luis");
  expect(html).toContain("Nos casamos");
  expect(html).toContain("Acompáñanos a celebrar.");
  expect(html).toContain("18 de abril de 2027");
  expect(html).toContain("6:30 p. m.");
  expect(html).toContain("Jardín de las Nubes");
  expect(html).toContain("--sample-background:#fcebd6");
  expect(html).toContain("--sample-accent:#714ea0");
  expect(html).toContain("--sample-cta:#453055");
  expect(html).toContain("sansTitle");
  expect(html).toContain("heroPoster");
  expect(html).not.toMatch(/class="[^"]*balloon/);
  expect(html).toContain("Personaliza esta muestra");
});

it("lets the user hide and restore the date and location sections", () => {
  const sample = demo();
  sample.change("sample-show-date", "", false);
  sample.change("sample-show-location", "", false);
  let html = sample.html();
  expect(html).not.toContain("Una fecha para recordar");
  expect(html).not.toContain("Nos encontramos aquí");
  expect(html).not.toContain("Buscar en Google Maps");

  sample.change("sample-show-date", "", true);
  sample.change("sample-show-location", "", true);
  html = sample.html();
  expect(html).toContain("Una fecha para recordar");
  expect(html).toContain("Nos encontramos aquí");
  expect(html).toContain("Buscar en Google Maps");
});

it("lets the user customize whether the countdown and demo pass are visible", () => {
  const sample = demo();
  let html = sample.html();
  expect(html).toContain("Cuenta regresiva ficticia");
  expect(html).toContain("Acceso de muestra");

  sample.change("sample-show-countdown", "", false);
  sample.change("sample-show-demo-access", "", false);
  html = sample.html();
  expect(html).not.toContain("Cuenta regresiva ficticia");
  expect(html).not.toContain("Acceso de muestra");

  sample.change("sample-show-countdown", "", true);
  sample.change("sample-show-demo-access", "", true);
  html = sample.html();
  expect(html).toContain("Cuenta regresiva ficticia");
  expect(html).toContain("Acceso de muestra");
});

it("previews other celebration types without advertising the $99 offer for them", () => {
  const sample = demo();
  sample.change("sample-event-type", "Boda");

  let html = sample.html();
  expect(html).toContain("Boda</p>");
  expect(html).toContain("¡Nos casamos!");
  expect(html).toContain("Acompáñanos a celebrar nuestro amor");
  expect(html).toContain("Esta categoría es una muestra para explorar estilos");
  expect(html).not.toContain("wa.me/");

  sample.change("sample-intro", "Nuestra boda ficticia");
  sample.change("sample-event-type", "Cumpleaños");
  html = sample.html();
  expect(html).toContain("Nuestra boda ficticia");
  expect(html).toContain("Pedir una invitación de cumpleaños · $99 MXN");
  expect(html).toContain("wa.me/525525613131");
});

it("offers two inline templates for each event and a third editorial wedding template", () => {
  const sample = demo();
  const eventTypes = ["Cumpleaños", "Bautizo", "Baby shower", "Boda", "XV años", "Primera comunión", "Graduación", "Aniversario"];

  for (const eventType of eventTypes) {
    sample.change("sample-event-type", eventType);
    expect(sample.templateCount(), eventType).toBe(eventType === "Boda" ? 3 : 2);
    if (eventType === "Boda") expect(sample.html()).toContain("/muestras/boda/editorial");
  }
});

it("applies a selected event template's palette, layout, typography and decorations", () => {
  const sample = demo();
  sample.change("sample-event-type", "Boda");
  expect(sample.html()).toContain("Sobre azul noche");
  sample.chooseTemplate("Jardín romántico");

  const html = sample.html();
  expect(html).toContain("aria-label=\"Jardín romántico\" aria-pressed=\"true\"");
  expect(html).toContain("aria-expanded=\"true\"");
  expect(html).toContain("envelopeArtOpened");
  expect(html).toContain("letterContentOpen");
  expect(html).toContain("--sample-background:#fbf1ed");
  expect(html).toContain("serifTitle");
  expect(html).not.toContain("heroPoster");
  expect(html).toContain("balloonOne");
  expect(html).not.toContain("wa.me/");
});

it("opens and closes the invitation letter preview with an accessible state", () => {
  const sample = demo();
  expect(sample.html()).toContain("letterContentClosed");

  sample.toggleLetter();
  let html = sample.html();
  expect(html).toContain("aria-expanded=\"true\"");
  expect(html).toContain("letterSceneOpen");
  expect(html).toContain("letterContentOpen");

  sample.toggleLetter();
  html = sample.html();
  expect(html).toContain("aria-expanded=\"false\"");
  expect(html).toContain("letterContentClosed");
});

it("shows an accepted cover image only as a local preview and rejects unsupported formats", () => {
  const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:local-cover-preview");
  const sample = demo();
  sample.changeImage({ type: "image/jpeg", size: 1024 } as File);

  let html = sample.html();
  expect(createObjectURL).toHaveBeenCalledOnce();
  expect(html).toContain("blob:local-cover-preview");
  expect(html).toContain("no se guarda ni se sube");

  sample.changeImage({ type: "image/svg+xml", size: 1024 } as File);
  html = sample.html();
  expect(html).toContain("Usa una imagen JPG, PNG o WebP.");
  expect(createObjectURL).toHaveBeenCalledOnce();
  expect(fetch).not.toHaveBeenCalled();
});
