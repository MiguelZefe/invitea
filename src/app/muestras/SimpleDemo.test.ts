import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import SimpleDemo, { linkedTemplateIndex, templates, type SampleEventType } from "./SimpleDemo";

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
    isChecked: (id: string) => all().find((node) => node.props.id === id)?.props.checked,
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
    showFullInvitation() {
      all().find((node) => node.props.id === "sample-preview-action")!.props.onClick!();
      render();
    },
    quickPreview() {
      all().find((node) => node.props.id === "sample-quick-preview")!.props.onClick!();
      render();
    },
    reset() {
      all().find((node) => node.props.children === "Restablecer ejemplo")!.props.onClick!();
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

it("puts the essential mobile fields before the template gallery and offers a direct preview button", () => {
  const html = demo().html();
  const name = html.indexOf('id="sample-name"');
  const date = html.indexOf('id="sample-date"');
  const place = html.indexOf('id="sample-place"');
  const gallery = html.indexOf("Elige una plantilla");
  const music = html.indexOf("Música de fondo para tu muestra");
  expect(name).toBeGreaterThan(0);
  expect(name).toBeLessThan(date);
  expect(date).toBeLessThan(place);
  expect(place).toBeLessThan(gallery);
  expect(gallery).toBeLessThan(music);
  expect(html).toContain('id="sample-quick-preview"');
});

it("opens the final invitation from the essential fields and offers a way back to editing", () => {
  const hero = { scrollTop: 90, scrollIntoView: vi.fn() };
  const audio = { play: vi.fn().mockResolvedValue(undefined) };
  vi.stubGlobal("document", { getElementById: (id: string) => id === "sample-hero" ? hero : id === "sample-background-audio" ? audio : null });
  vi.stubGlobal("window", { requestAnimationFrame: (callback: () => void) => callback(), matchMedia: () => ({ matches: true }) });

  const sample = demo();
  sample.change("sample-name", "Luna de ejemplo");
  sample.quickPreview();

  const html = sample.html();
  expect(html).toContain("Luna de ejemplo");
  expect(html).toContain('aria-expanded="true"');
  expect(html).toContain('href="#customize-title"');
  expect(html).toContain("Cambiar datos o plantilla");
  expect(audio.play).toHaveBeenCalledOnce();
  expect(hero.scrollIntoView).toHaveBeenCalled();
});

it("keeps the chosen style in the WhatsApp inquiry", () => {
  const messages = (html: string) => [...html.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)]
    .map((match) => new URL(match[1].replaceAll("&amp;", "&")).searchParams.get("text"));
  const sample = demo();
  sample.chooseTemplate("Granja alegre");
  expect(messages(sample.html())).toContainEqual(expect.stringContaining("Plantilla que me gustó: Granja alegre."));

  sample.change("sample-event-type", "Boda");
  sample.chooseTemplate("Votos de champaña");
  const inquiry = messages(sample.html());
  expect(inquiry).toContainEqual(expect.stringContaining("Plantilla que me gustó: Votos de champaña."));
  expect(inquiry).toContainEqual(expect.stringContaining("por cotizar aparte"));
});

it("opens the complete invitation from the end of the form without resetting edits", () => {
  const hero = { scrollTop: 90, scrollIntoView: vi.fn() };
  const action = { focus: vi.fn() };
  const audio = { play: vi.fn().mockResolvedValue(undefined) };
  vi.stubGlobal("document", { getElementById: (id: string) => id === "sample-hero" ? hero : id === "sample-letter-action" ? action : id === "sample-background-audio" ? audio : null });
  vi.stubGlobal("window", { requestAnimationFrame: (callback: () => void) => callback(), matchMedia: () => ({ matches: true }) });

  const sample = demo();
  sample.change("sample-name", "Luna de ejemplo");
  sample.change("sample-accent-color", "#714ea0");
  sample.showFullInvitation();

  const html = sample.html();
  expect(html).toContain('id="sample-preview-action"');
  expect(html).toContain("Ver prueba final");
  expect(html).toContain("Luna de ejemplo");
  expect(html).toContain("--sample-accent:#714ea0");
  expect(html).toContain('aria-expanded="true"');
  expect(hero.scrollTop).toBe(0);
  expect(hero.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  expect(action.focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(audio.play).toHaveBeenCalledOnce();
  expect(fetch).not.toHaveBeenCalled();
});

it("explains that an external music player must be started separately", () => {
  const hero = { scrollTop: 0, scrollIntoView: vi.fn() };
  vi.stubGlobal("document", { getElementById: (id: string) => id === "sample-hero" ? hero : null });
  vi.stubGlobal("window", { requestAnimationFrame: (callback: () => void) => callback(), matchMedia: () => ({ matches: false }) });

  const sample = demo();
  sample.showFullInvitation();
  expect(sample.html()).toContain("Para Spotify o YouTube Music, pulsa reproducir en su propio reproductor.");
  expect(hero.scrollIntoView).toHaveBeenCalled();
});

it("starts with every section and decorative effect enabled and keeps a deliberate choice", () => {
  const sample = demo();
  const checkboxes = ["sample-decorations", "sample-show-intro", "sample-show-message", "sample-show-date", "sample-show-location", "sample-show-countdown", "sample-show-demo-access"];
  for (const id of checkboxes) expect(sample.isChecked(id), id).toBe(true);

  sample.change("sample-event-type", "Boda");
  for (const id of checkboxes) expect(sample.isChecked(id), id).toBe(true);
  expect(sample.html()).toContain("Destellos animados");
  expect(sample.html()).not.toContain("balloonOne");

  sample.change("sample-decorations", "", false);
  sample.chooseTemplate("Votos de champaña");
  expect(sample.isChecked("sample-decorations")).toBe(false);
  sample.reset();
  for (const id of checkboxes) expect(sample.isChecked(id), id).toBe(true);
});

it("keeps advanced settings optional while leaving the final preview action visible", () => {
  const html = demo().html();
  const advanced = html.indexOf("Más personalización (opcional)");
  const finalPreview = html.indexOf('id="sample-preview-action"');
  expect(html).toContain("<details");
  expect(html).toContain('id="sample-accent-color"');
  expect(advanced).toBeGreaterThan(0);
  expect(finalPreview).toBeGreaterThan(advanced);
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

it("changes the countdown motion across event types and restores the default", () => {
  const sample = demo();
  expect(sample.html()).toContain('data-effect="float"');

  sample.change("sample-countdown-effect", "sparkle");
  sample.change("sample-event-type", "Boda");
  expect(sample.html()).toContain('data-effect="sparkle"');

  sample.change("sample-countdown-effect", "none");
  expect(sample.html()).toContain('data-effect="none"');

  sample.reset();
  expect(sample.html()).toContain('data-effect="float"');
});

it("offers custom celebrations by separate quote without advertising the $99 order", () => {
  const sample = demo();
  sample.change("sample-event-type", "Boda");

  let html = sample.html();
  expect(html).toContain("Boda</p>");
  expect(html).toContain("¡Nos casamos!");
  expect(html).toContain("Acompáñanos a celebrar nuestro amor");
  expect(html).toContain("Esta categoría se cotiza como proyecto personalizado");
  expect(html).toContain("Consultar esta celebración por WhatsApp");
  expect(html).not.toContain("Pedir una invitación de boda · $99 MXN");

  sample.change("sample-intro", "Nuestra boda ficticia");
  sample.change("sample-event-type", "Cumpleaños");
  html = sample.html();
  expect(html).toContain("Nuestra boda ficticia");
  expect(html).toContain("Pedir una invitación de cumpleaños · $99 MXN");
  expect(html).toContain("wa.me/525525613131");
});

it("offers five additional animated templates for every event type", () => {
  const sample = demo();
  const eventTypes = ["Cumpleaños", "Bautizo", "Baby shower", "Boda", "XV años", "Primera comunión", "Graduación", "Aniversario"];
  const counts: Record<string, number> = { "Cumpleaños": 15, "Bautizo": 9, "Baby shower": 8, "Boda": 9, "XV años": 9, "Primera comunión": 8, "Graduación": 8, "Aniversario": 8 };

  for (const eventType of eventTypes) {
    sample.change("sample-event-type", eventType);
    expect(sample.templateCount(), eventType).toBe(counts[eventType]);
    if (eventType === "Boda") expect(sample.html()).toContain("/muestras/boda/editorial");
  }
});

it("adds three illustrated birthday styles that preserve editable names and dates", () => {
  const sample = demo();
  sample.change("sample-name", "Luna de ejemplo");
  sample.change("sample-date", "2027-06-05");
  for (const name of ["Festival de luz", "Jardín tropical", "Noche ciruela"]) {
    sample.chooseTemplate(name);
    const html = sample.html();
    expect(html).toContain(name);
    expect(html).toContain("Luna de ejemplo");
    expect(html).toContain("5 · JUN · 2027");
    expect(html).toContain("heroWithArt");
  }
});

it("maps a featured birthday link to its selected template", () => {
  for (const name of ["Festival de luz", "Jardín tropical", "Noche ciruela"]) {
    const index = templates.Cumpleaños.findIndex((template) => template.name === name);
    const hash = `#plantilla-${templates.Cumpleaños[index].art!.split("/").pop()!.replace(".webp", "")}`;
    expect(linkedTemplateIndex("Cumpleaños", hash)).toBe(index);
  }
  expect(linkedTemplateIndex("Cumpleaños", "#sample-hero")).toBe(-1);
});

it("updates every event's cover with the current name and date", () => {
  const sample = demo();
  sample.change("sample-name", "Luna y Sol (ficticios)");
  sample.change("sample-date", "2027-04-18");

  for (const eventType of Object.keys(templates) as SampleEventType[]) {
    sample.change("sample-event-type", eventType);
    const firstCover = sample.html().match(/<button[^>]*data-template="yes"[\s\S]*?<\/button>/)?.[0];
    expect(firstCover, eventType).toContain("Luna y Sol (ficticios)");
    expect(firstCover, eventType).toContain("18 · ABR · 2027");
  }

  sample.change("sample-name", "  ");
  sample.change("sample-date", "");
  const emptyCover = sample.html().match(/<button[^>]*data-template="yes"[\s\S]*?<\/button>/)?.[0];
  expect(emptyCover).toContain("Tu nombre");
  expect(emptyCover).toContain("FECHA POR DEFINIR");
});

it("gives unillustrated designs a themed scene and applies the new motion styles", () => {
  const sample = demo();

  for (const eventType of Object.keys(templates) as SampleEventType[]) {
    sample.change("sample-event-type", eventType);
    sample.chooseTemplate(templates[eventType].at(-1)!.name);
    const html = sample.html();
    expect(html, eventType).toContain("heroNoArt");
    expect(html, eventType).toContain("heroWatermark");
  }

  sample.change("sample-event-type", "Boda");
  sample.chooseTemplate("Retrato de amor");
  expect(sample.html()).toContain("motionHearts");
  expect(sample.html()).not.toContain("heroNoArt");

  sample.change("sample-event-type", "XV años");
  sample.chooseTemplate("Estrellas de medianoche");
  expect(sample.html()).toContain("motionStars");
});

it("uses a fitting fictitious example for each event without replacing customer edits", () => {
  const sample = demo();
  sample.change("sample-event-type", "Boda");
  let html = sample.html();
  expect(html).toContain("Mar y Sol (ficticios)");
  expect(html).toContain("15 · MAY · 2027");
  expect(html).toContain("6:00 p. m.");

  sample.change("sample-name", "Luna y Sol (ficticios)");
  sample.change("sample-date", "2027-07-18");
  sample.change("sample-event-type", "Baby shower");
  html = sample.html();
  expect(html).toContain("Luna y Sol (ficticios)");
  expect(html).toContain("18 · JUL · 2027");
  expect(html).not.toContain("Nuestra bebé (ficticia)");
});

it("shows five distinct illustrated motion templates per celebration in the isolated preview", () => {
  const sample = demo();
  const launcher = readFileSync(join(process.cwd(), "scripts/commercial-lab-local.mjs"), "utf8");

  for (const eventType of Object.keys(templates) as SampleEventType[]) {
    const featured = templates[eventType].slice(0, 5);
    expect(featured, eventType).toHaveLength(5);
    expect(new Set(featured.map((template) => template.art)).size, eventType).toBe(5);
    sample.change("sample-event-type", eventType);

    for (const template of featured) {
      expect(template.motion, template.name).toBeTruthy();
      expect(template.art, template.name).toMatch(/^\/images\/sample-templates\/.+\.webp$/);
      expect(existsSync(join(process.cwd(), "public", template.art!.slice(1))), template.name).toBe(true);
      expect(launcher, template.name).toContain(`"public${template.art}"`);
      expect(sample.html(), template.name).toContain(template.art);
      sample.chooseTemplate(template.name);
      expect(sample.html(), template.name).toContain("templateArt");
    }
  }
});

it("animates Noche dorada and keeps edited content when choosing new designs", () => {
  const sample = demo();
  expect(sample.html()).toContain("motionConfetti");
  expect(sample.html()).toContain("/images/sample-templates/noche-dorada.webp");
  expect(sample.html()).toContain("/images/sample-templates/fiesta-colorida.webp");
  expect(sample.html()).toContain("/images/sample-templates/dulce-minimal.webp");

  sample.change("sample-name", "Luna (ficticia)");
  sample.chooseTemplate("Órbita de fiesta");
  let html = sample.html();
  expect(html).toContain('aria-label="Órbita de fiesta" aria-pressed="true"');
  expect(html).toContain("motionOrbit");
  expect(html).toContain("Luna (ficticia)");

  sample.change("sample-event-type", "Baby shower");
  sample.chooseTemplate("Nube de algodón");
  html = sample.html();
  expect(html).toContain("motionPetals");
  expect(html).toContain("Luna (ficticia)");

  sample.change("sample-event-type", "Boda");
  sample.chooseTemplate("Votos de champaña");
  html = sample.html();
  expect(html).toContain("motionShimmer");
  expect(html).not.toContain("balloonOne");
});

it("applies original illustrated art while keeping edited content and the optional access demo", () => {
  const sample = demo();
  sample.change("sample-name", "Luna (ficticia)");
  sample.chooseTemplate("Neón gamer");
  let html = sample.html();
  expect(html).toContain('aria-label="Neón gamer" aria-pressed="true"');
  expect(html).toContain("/images/sample-templates/neon-gamer.webp");
  expect(html).toContain("heroArtDark");
  expect(html).toContain("Luna (ficticia)");
  expect(html).toContain("Control de acceso opcional · demostración");
  expect(html).toContain("El check-in real se consulta y cotiza por separado");

  sample.change("sample-event-type", "XV años");
  html = sample.html();
  expect(html).toContain("/images/sample-templates/jardin-orquideas.webp");
  expect(html).toContain("heroArtLight");
  expect(html).toContain("Luna (ficticia)");
});

it("shows portrait wedding and graduation covers and applies them to the preview", () => {
  const sample = demo();
  sample.change("sample-event-type", "Boda");
  let html = sample.html();
  expect(html).toContain("Elige una plantilla");
  expect(html).toContain("aspect-[3/4]");
  expect(html).toContain("/images/sample-templates/sobre-azul-noche.webp");
  expect(html).toContain("/images/sample-templates/jardin-romantico.webp");
  expect(html).toContain("heroArtLight");

  sample.change("sample-event-type", "Graduación");
  html = sample.html();
  expect(html).toContain("/images/sample-templates/graduacion-noche.webp");
  expect(html).toContain("heroArtDark");
});

it("scrolls the whole preview into view without shifting its background internally", () => {
  const hero = { scrollTop: 115, scrollIntoView: vi.fn() };
  const action = { focus: vi.fn(), scrollIntoView: vi.fn() };
  vi.stubGlobal("document", { getElementById: (id: string) => id === "sample-hero" ? hero : id === "sample-letter-action" ? action : null });
  vi.stubGlobal("window", { requestAnimationFrame: (callback: () => void) => callback(), matchMedia: () => ({ matches: false }) });

  demo().chooseTemplate("Granja alegre");

  expect(hero.scrollTop).toBe(0);
  expect(hero.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
  expect(action.focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(action.scrollIntoView).not.toHaveBeenCalled();
});

it("applies the new framed and ticket layouts without losing edited invitation data", () => {
  const sample = demo();
  sample.change("sample-name", "Luna (ficticia)");
  sample.chooseTemplate("Marco de recuerdos");
  let html = sample.html();
  expect(html).toContain('aria-label="Marco de recuerdos" aria-pressed="true"');
  expect(html).toContain("heroFrame");
  expect(html).toContain("Luna (ficticia)");
  expect(html).toContain("--sample-background:#edf4f8");

  sample.chooseTemplate("Pase de fiesta");
  html = sample.html();
  expect(html).toContain('aria-label="Pase de fiesta" aria-pressed="true"');
  expect(html).toContain("heroTicket");
  expect(html).toContain("Luna (ficticia)");

  sample.change("sample-event-type", "Bautizo");
  sample.chooseTemplate("Pase botánico");
  html = sample.html();
  expect(html).toContain('aria-label="Pase botánico" aria-pressed="true"');
  expect(html).toContain("heroTicket");
  expect(html).not.toContain("balloonOne");
  expect(html).toContain("Luna (ficticia)");
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
  expect(html).toContain("--sample-background:#edf3ee");
  expect(html).toContain("serifTitle");
  expect(html).toContain("heroPoster");
  expect(html).toContain("sparkleOne");
  expect(html).not.toContain("Pedir una invitación de boda · $99 MXN");
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
