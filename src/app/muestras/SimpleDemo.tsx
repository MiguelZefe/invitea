"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { googleMapsSearchLink } from "@/lib/google-maps";
import { assistedCustomEventQuoteLink, assistedOrderLink, type SimpleEventType } from "@/lib/assisted-sales";
import EventCountdown, { type CountdownEffect } from "@/components/EventCountdown";
import DemoAccessCard from "./DemoAccessCard";
import SampleMusicPlayer from "./SampleMusicPlayer";
import styles from "./SampleMotion.module.css";

export type SampleEventType = SimpleEventType | "Baby shower" | "Boda" | "XV años" | "Primera comunión" | "Graduación" | "Aniversario";

type Props = {
  type: SampleEventType;
  name: string;
  intro: string;
  message: string;
  date: string;
  time: string;
  place: string;
};

const palettes = {
  rose: { label: "Rosa cálido", background: "#fbf1ed", ink: "#382724", panel: "#fffaf7", accent: "#aa5946", cta: "#a74457", swatch: "#d98b83", envelope: "#a74457", envelopeFlap: "#c65f70" },
  garden: { label: "Jardín", background: "#edf3ee", ink: "#20362e", panel: "#fbfdf9", accent: "#456d5b", cta: "#496d61", swatch: "#75977e", envelope: "#456d5b", envelopeFlap: "#628b77" },
  ocean: { label: "Azul sereno", background: "#edf4f8", ink: "#243746", panel: "#fbfdff", accent: "#397492", cta: "#356b88", swatch: "#70a6bc", envelope: "#356b88", envelopeFlap: "#4d8ba8" },
  lilac: { label: "Lavanda", background: "#f2eff8", ink: "#352c43", panel: "#fdfbff", accent: "#755b91", cta: "#72548d", swatch: "#a08bbb", envelope: "#72548d", envelopeFlap: "#8b70a8" },
  sunshine: { label: "Día soleado", background: "#fbf5e8", ink: "#41351f", panel: "#fffdf7", accent: "#9a702e", cta: "#9b6b26", swatch: "#d3ad5c", envelope: "#9b6b26", envelopeFlap: "#bd8c3b" },
  navy: { label: "Azul noche", background: "#f4efe4", ink: "#1c2d4a", panel: "#fffaf0", accent: "#a87855", cta: "#182d4e", swatch: "#1b3154", envelope: "#192f52", envelopeFlap: "#263f68" },
  coral: { label: "Coral", background: "#fff0e9", ink: "#4b2928", panel: "#fffaf5", accent: "#ad534c", cta: "#a04442", swatch: "#e6927d", envelope: "#a04442", envelopeFlap: "#c66a62" },
  plum: { label: "Ciruela", background: "#f4edf4", ink: "#3b2942", panel: "#fffbff", accent: "#805477", cta: "#704263", swatch: "#b985a8", envelope: "#704263", envelopeFlap: "#94638a" },
  mint: { label: "Menta", background: "#eaf5f0", ink: "#244437", panel: "#fbfffc", accent: "#387661", cta: "#2f6857", swatch: "#86bba4", envelope: "#2f6857", envelopeFlap: "#55907b" },
  champagne: { label: "Champaña", background: "#f8f2e6", ink: "#423626", panel: "#fffdf7", accent: "#98713d", cta: "#846135", swatch: "#d1b07a", envelope: "#846135", envelopeFlap: "#b38c59" },
  midnight: { label: "Medianoche", background: "#e9edf5", ink: "#17233d", panel: "#f8faff", accent: "#536fa4", cta: "#253d72", swatch: "#7e9ac9", envelope: "#253d72", envelopeFlap: "#47659d" },
} as const;

type PaletteId = keyof typeof palettes;
type SampleLayout = "classic" | "compact" | "poster" | "frame" | "ticket";
type TemplateMotion = "shimmer" | "confetti" | "petals" | "glow" | "orbit";
type SampleTemplate = { name: string; palette: PaletteId; font: "serif" | "sans"; layout: SampleLayout; decorations: boolean; motion?: TemplateMotion; art?: string; artTone?: "light" | "dark" };
const motionClasses: Record<TemplateMotion, string> = {
  shimmer: styles.motionShimmer,
  confetti: styles.motionConfetti,
  petals: styles.motionPetals,
  glow: styles.motionGlow,
  orbit: styles.motionOrbit,
};
type SampleStyle = CSSProperties & {
  "--sample-background": string;
  "--sample-ink": string;
  "--sample-panel": string;
  "--sample-accent": string;
  "--sample-cta": string;
  "--sample-envelope": string;
  "--sample-envelope-flap": string;
};

const eventTypes: SampleEventType[] = [
  "Cumpleaños", "Bautizo", "Baby shower", "Boda", "XV años",
  "Primera comunión", "Graduación", "Aniversario",
];

const copyByEventType: Record<SampleEventType, { intro: string; message: string }> = {
  "Cumpleaños": { intro: "¡Es mi cumpleaños!", message: "Ven a celebrar mis 5 años. Habrá juegos, alegría y muchas sonrisas." },
  "Bautizo": { intro: "Te invitamos a mi bautizo", message: "Acompáñanos en un día lleno de cariño para nuestra familia." },
  "Baby shower": { intro: "¡Una nueva aventura está por comenzar!", message: "Acompáñanos a celebrar la llegada de nuestro bebé." },
  "Boda": { intro: "¡Nos casamos!", message: "Acompáñanos a celebrar nuestro amor y comenzar una nueva etapa juntos." },
  "XV años": { intro: "Mis XV años", message: "Acompáñame a celebrar una noche muy especial." },
  "Primera comunión": { intro: "Mi Primera Comunión", message: "Acompáñanos en un día importante para nuestra familia." },
  "Graduación": { intro: "¡Lo logré!", message: "Celebremos este logro y todo lo que viene." },
  "Aniversario": { intro: "Celebramos nuestro aniversario", message: "Nos encantará compartir este capítulo con quienes más queremos." },
};

const cardPreview: Record<SampleEventType, { name: string; date: string }> = {
  "Cumpleaños": { name: "Sofía", date: "12 · DIC · 2026" },
  "Bautizo": { name: "Mateo", date: "19 · DIC · 2026" },
  "Baby shower": { name: "Nuestra bebé", date: "21 · NOV · 2026" },
  "Boda": { name: "Mar & Sol", date: "15 · MAY · 2027" },
  "XV años": { name: "Valentina", date: "20 · MAR · 2027" },
  "Primera comunión": { name: "Emilia", date: "18 · ABR · 2027" },
  "Graduación": { name: "Alex", date: "26 · JUN · 2027" },
  "Aniversario": { name: "Mar & Sol", date: "14 · FEB · 2027" },
};

const templates: Record<SampleEventType, SampleTemplate[]> = {
  "Cumpleaños": [
    { name: "Noche dorada", palette: "navy", font: "serif", layout: "poster", decorations: true, motion: "confetti", art: "/images/sample-templates/noche-dorada.webp", artTone: "dark" },
    { name: "Granja alegre", palette: "sunshine", font: "sans", layout: "poster", decorations: true, art: "/images/sample-templates/granja-alegre.webp", artTone: "light" },
    { name: "Neón gamer", palette: "lilac", font: "sans", layout: "poster", decorations: true, art: "/images/sample-templates/neon-gamer.webp", artTone: "dark" },
    { name: "Fiesta colorida", palette: "rose", font: "serif", layout: "classic", decorations: true },
    { name: "Dulce minimal", palette: "sunshine", font: "sans", layout: "compact", decorations: false },
    { name: "Marco de recuerdos", palette: "ocean", font: "serif", layout: "frame", decorations: true },
    { name: "Pase de fiesta", palette: "lilac", font: "sans", layout: "ticket", decorations: true },
    { name: "Confeti coral", palette: "coral", font: "sans", layout: "classic", decorations: true, motion: "confetti" },
    { name: "Dulce ciruela", palette: "plum", font: "serif", layout: "frame", decorations: true, motion: "petals" },
    { name: "Brillo de champaña", palette: "champagne", font: "serif", layout: "poster", decorations: true, motion: "shimmer" },
    { name: "Órbita de fiesta", palette: "midnight", font: "sans", layout: "ticket", decorations: true, motion: "orbit" },
    { name: "Alegría menta", palette: "mint", font: "sans", layout: "compact", decorations: true, motion: "glow" },
  ],
  "Bautizo": [
    { name: "Jardín de luz", palette: "garden", font: "serif", layout: "classic", decorations: true },
    { name: "Nube celestial", palette: "lilac", font: "serif", layout: "poster", decorations: false },
    { name: "Recuerdo enmarcado", palette: "sunshine", font: "serif", layout: "frame", decorations: true },
    { name: "Pase botánico", palette: "garden", font: "sans", layout: "ticket", decorations: false },
    { name: "Luz de amanecer", palette: "champagne", font: "serif", layout: "poster", decorations: false, motion: "shimmer" },
    { name: "Palomas de menta", palette: "mint", font: "serif", layout: "frame", decorations: false, motion: "petals" },
    { name: "Cielo de bendiciones", palette: "midnight", font: "serif", layout: "classic", decorations: false, motion: "glow" },
    { name: "Pase de luz", palette: "coral", font: "sans", layout: "ticket", decorations: false, motion: "orbit" },
    { name: "Destellos de familia", palette: "plum", font: "serif", layout: "compact", decorations: false, motion: "confetti" },
  ],
  "Baby shower": [
    { name: "Nube tierna", palette: "lilac", font: "serif", layout: "poster", decorations: true },
    { name: "Jardín botánico", palette: "garden", font: "sans", layout: "compact", decorations: false },
    { name: "Dulce bienvenida", palette: "rose", font: "serif", layout: "frame", decorations: true },
    { name: "Pequeña estrella", palette: "midnight", font: "serif", layout: "poster", decorations: true, motion: "glow" },
    { name: "Nube de algodón", palette: "mint", font: "sans", layout: "classic", decorations: true, motion: "petals" },
    { name: "Lluvia de alegría", palette: "coral", font: "sans", layout: "compact", decorations: true, motion: "confetti" },
    { name: "Carta de bienvenida", palette: "champagne", font: "serif", layout: "frame", decorations: true, motion: "shimmer" },
    { name: "Órbita tierna", palette: "plum", font: "serif", layout: "ticket", decorations: true, motion: "orbit" },
  ],
  "Boda": [
    { name: "Sobre azul noche", palette: "navy", font: "serif", layout: "poster", decorations: false },
    { name: "Jardín romántico", palette: "rose", font: "serif", layout: "classic", decorations: true },
    { name: "Retrato de amor", palette: "sunshine", font: "serif", layout: "frame", decorations: false },
    { name: "Aurora de amor", palette: "coral", font: "serif", layout: "poster", decorations: false, motion: "glow" },
    { name: "Votos de champaña", palette: "champagne", font: "serif", layout: "classic", decorations: false, motion: "shimmer" },
    { name: "Jardín de promesas", palette: "mint", font: "serif", layout: "frame", decorations: false, motion: "petals" },
    { name: "Noche de estrellas", palette: "midnight", font: "serif", layout: "ticket", decorations: false, motion: "orbit" },
    { name: "Celebración eterna", palette: "plum", font: "sans", layout: "compact", decorations: false, motion: "confetti" },
  ],
  "XV años": [
    { name: "Jardín de orquídeas", palette: "rose", font: "serif", layout: "poster", decorations: false, art: "/images/sample-templates/jardin-orquideas.webp", artTone: "light" },
    { name: "Noche glam", palette: "lilac", font: "sans", layout: "poster", decorations: true },
    { name: "Dorado moderno", palette: "sunshine", font: "sans", layout: "compact", decorations: false },
    { name: "Pase de gala", palette: "navy", font: "serif", layout: "ticket", decorations: true },
    { name: "Sueño coral", palette: "coral", font: "serif", layout: "poster", decorations: true, motion: "petals" },
    { name: "Estrellas de medianoche", palette: "midnight", font: "serif", layout: "classic", decorations: true, motion: "orbit" },
    { name: "Brillo de quince", palette: "champagne", font: "sans", layout: "frame", decorations: true, motion: "shimmer" },
    { name: "Fiesta ciruela", palette: "plum", font: "sans", layout: "ticket", decorations: true, motion: "confetti" },
    { name: "Jardín de sueños", palette: "mint", font: "serif", layout: "compact", decorations: true, motion: "glow" },
  ],
  "Primera comunión": [
    { name: "Luz serena", palette: "garden", font: "serif", layout: "classic", decorations: false },
    { name: "Flores delicadas", palette: "lilac", font: "serif", layout: "poster", decorations: true },
    { name: "Marco de luz", palette: "sunshine", font: "serif", layout: "frame", decorations: false },
    { name: "Pan y luz", palette: "champagne", font: "serif", layout: "poster", decorations: false, motion: "shimmer" },
    { name: "Cielo sereno", palette: "midnight", font: "serif", layout: "classic", decorations: false, motion: "glow" },
    { name: "Jardín de fe", palette: "mint", font: "serif", layout: "frame", decorations: false, motion: "petals" },
    { name: "Pase de bendición", palette: "coral", font: "sans", layout: "ticket", decorations: false, motion: "orbit" },
    { name: "Alegría compartida", palette: "plum", font: "sans", layout: "compact", decorations: false, motion: "confetti" },
  ],
  "Graduación": [
    { name: "Logro moderno", palette: "ocean", font: "sans", layout: "compact", decorations: false },
    { name: "Noche de gala", palette: "lilac", font: "serif", layout: "poster", decorations: true },
    { name: "Pase al futuro", palette: "navy", font: "sans", layout: "ticket", decorations: true },
    { name: "Gran logro", palette: "champagne", font: "serif", layout: "poster", decorations: true, motion: "shimmer" },
    { name: "Horizonte nuevo", palette: "mint", font: "sans", layout: "classic", decorations: true, motion: "glow" },
    { name: "Estrellas de éxito", palette: "midnight", font: "serif", layout: "frame", decorations: true, motion: "orbit" },
    { name: "Fiesta de toga", palette: "coral", font: "sans", layout: "ticket", decorations: true, motion: "confetti" },
    { name: "Recuerdos de clase", palette: "plum", font: "serif", layout: "compact", decorations: true, motion: "petals" },
  ],
  "Aniversario": [
    { name: "Clásico dorado", palette: "sunshine", font: "serif", layout: "classic", decorations: false },
    { name: "Jardín eterno", palette: "rose", font: "serif", layout: "poster", decorations: true },
    { name: "Nuestra historia", palette: "ocean", font: "serif", layout: "frame", decorations: false },
    { name: "Brindis eterno", palette: "champagne", font: "serif", layout: "poster", decorations: false, motion: "shimmer" },
    { name: "Jardín de recuerdos", palette: "mint", font: "serif", layout: "classic", decorations: false, motion: "petals" },
    { name: "Luz de dos", palette: "coral", font: "serif", layout: "frame", decorations: false, motion: "glow" },
    { name: "Vuelta al sol", palette: "midnight", font: "sans", layout: "ticket", decorations: false, motion: "orbit" },
    { name: "Fiesta compartida", palette: "plum", font: "sans", layout: "compact", decorations: false, motion: "confetti" },
  ],
};

const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return "Agrega la fecha de tu celebración";
  return `${day} de ${monthNames[month - 1]} de ${year}`;
}

function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return "Agrega la hora";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "p. m." : "a. m."}`;
}

export default function SimpleDemo({ type, name: initialName, intro: initialIntro, message: initialMessage, date: initialDate, time: initialTime, place: initialPlace }: Props) {
  const [name, setName] = useState(initialName);
  const [eventType, setEventType] = useState<SampleEventType>(type);
  const [intro, setIntro] = useState(initialIntro);
  const [message, setMessage] = useState(initialMessage);
  const [copyEdited, setCopyEdited] = useState(false);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [place, setPlace] = useState(initialPlace);
  const initialTemplate = templates[type][0];
  const initialPaletteId = initialTemplate.palette;
  const [paletteId, setPaletteId] = useState<PaletteId>(initialPaletteId);
  const [backgroundColor, setBackgroundColor] = useState<string>(palettes[initialPaletteId].background);
  const [accentColor, setAccentColor] = useState<string>(palettes[initialPaletteId].accent);
  const [buttonColor, setButtonColor] = useState<string>(palettes[initialPaletteId].cta);
  const [templateId, setTemplateId] = useState(0);
  const [font, setFont] = useState<"serif" | "sans">(initialTemplate.font);
  const [layout, setLayout] = useState<SampleLayout>(initialTemplate.layout);
  const [decorations, setDecorations] = useState(initialTemplate.decorations);
  const [letterOpened, setLetterOpened] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showMessage, setShowMessage] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdownEffect, setCountdownEffect] = useState<CountdownEffect>("float");
  const [showDemoAccess, setShowDemoAccess] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef<string | null>(null);
  const [edited, setEdited] = useState({ name: false, date: false, time: false, place: false });
  const palette = palettes[paletteId];
  const currentTemplates = templates[eventType];
  const selectedTemplate = currentTemplates[templateId] ?? currentTemplates[0];
  const activeMotion = selectedTemplate.motion ?? "shimmer";
  const isOrderAvailable = eventType === "Cumpleaños" || eventType === "Bautizo";
  const themeStyle: SampleStyle = {
    "--sample-background": backgroundColor,
    "--sample-ink": palette.ink,
    "--sample-panel": palette.panel,
    "--sample-accent": accentColor,
    "--sample-cta": buttonColor,
    "--sample-envelope": palette.envelope,
    "--sample-envelope-flap": palette.envelopeFlap,
  };
  const displayDate = `${formatDate(date)} · ${formatTime(time)}`;
  const mapsLink = place.trim() ? googleMapsSearchLink(place) : null;
  const orderLink = isOrderAvailable ? assistedOrderLink(eventType, {
    name: edited.name ? name : undefined,
    date: edited.date ? date : undefined,
    time: edited.time ? time : undefined,
    place: edited.place ? place : undefined,
  }) : null;

  useEffect(() => () => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
  }, []);

  function clearCoverImage() {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = null;
    setCoverImage(null);
    setImageError("");
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

  function chooseCoverImage(file?: File) {
    if (!file) return;
    setImageError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Usa una imagen JPG, PNG o WebP.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("La imagen debe pesar 5 MB o menos.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    const imageUrl = URL.createObjectURL(file);
    imageUrlRef.current = imageUrl;
    setCoverImage(imageUrl);
  }

  function changeEventType(value: SampleEventType) {
    setEventType(value);
    applyTemplate(value, 0);
    if (!copyEdited) {
      setIntro(copyByEventType[value].intro);
      setMessage(copyByEventType[value].message);
    }
  }

  function applyTemplate(event: SampleEventType, selectedId: number) {
    const template = templates[event][selectedId] ?? templates[event][0];
    const nextPalette = palettes[template.palette];
    setTemplateId(selectedId);
    setPaletteId(template.palette);
    setBackgroundColor(nextPalette.background);
    setAccentColor(nextPalette.accent);
    setButtonColor(nextPalette.cta);
    setFont(template.font);
    setLayout(template.layout);
    setDecorations(template.decorations);
  }

  function previewTemplate(event: SampleEventType, selectedId: number) {
    applyTemplate(event, selectedId);
    setLetterOpened(true);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        const action = document.getElementById("sample-letter-action");
        const hero = document.getElementById("sample-hero");
        if (!action || !hero) return;
        hero.scrollTop = 0;
        action.focus({ preventScroll: true });
        hero.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "center",
        });
      });
    }
  }

  function resetSample() {
    setName(initialName);
    setEventType(type);
    setIntro(initialIntro);
    setMessage(initialMessage);
    setCopyEdited(false);
    applyTemplate(type, 0);
    setLetterOpened(false);
    setDate(initialDate);
    setTime(initialTime);
    setPlace(initialPlace);
    setShowIntro(true);
    setShowMessage(true);
    setShowDate(true);
    setShowLocation(true);
    setShowCountdown(true);
    setCountdownEffect("float");
    setShowDemoAccess(true);
    clearCoverImage();
    setEdited({ name: false, date: false, time: false, place: false });
  }

  return (
    <main style={themeStyle} className={styles.ambient + " relative min-h-screen overflow-hidden px-5 py-6 pb-28 sm:px-8 sm:py-10 sm:pb-10"}>
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4">ZefeInvita<span className="text-[#98685a]">.</span></Link>
          <span className="rounded-full border border-current/20 bg-white/60 px-4 py-2 text-xs font-medium">Muestra ficticia · No es un evento real</span>
        </header>

        <section className="mt-8 rounded-3xl border border-current/10 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-7" aria-labelledby="customize-title">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-65">Pruébala con tus datos</p>
              <h2 id="customize-title" className="mt-2 text-2xl font-semibold sm:text-3xl">Personaliza esta muestra</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-75">La invitación de abajo cambia al momento. Esta prueba solo vive en esta página; no se guarda.</p>
            </div>
            <button type="button" onClick={resetSample} className="min-h-10 rounded-full border border-current/25 px-4 py-2 text-sm font-medium transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-4">Restablecer ejemplo</button>
          </div>
          <div className="mt-5 max-w-xl">
            <label className="text-sm font-medium" htmlFor="sample-event-type">Tipo de evento
              <select id="sample-event-type" value={eventType} onChange={(event) => changeEventType(event.target.value as SampleEventType)} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]">
                {eventTypes.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
          <fieldset className="mt-5 border-t border-current/10 pt-5">
            <legend className="text-sm font-semibold">Elige tu plantilla favorita</legend>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed opacity-70">Explora {currentTemplates.length + (eventType === "Boda" ? 1 : 0)} estilos para {eventType.toLowerCase()}. Elige uno para aplicarlo y personaliza los detalles a tu gusto.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {currentTemplates.map((option, index) => {
                const optionId = index;
                const optionPalette = palettes[option.palette];
                return <button key={option.name} id={option.art ? `plantilla-${option.art.split("/").pop()?.replace(".webp", "")}` : undefined} type="button" data-template="yes" aria-label={option.name} aria-pressed={templateId === optionId} onClick={() => previewTemplate(eventType, optionId)} className={`group scroll-mt-8 overflow-hidden rounded-2xl border bg-white text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d] ${templateId === optionId ? "ring-2 ring-offset-2" : "border-current/15"}`} style={{ borderColor: optionPalette.accent, "--tw-ring-color": optionPalette.accent } as CSSProperties}>
                  <span aria-hidden="true" className={`relative flex h-48 items-center justify-center overflow-hidden p-4 ${option.art ? styles.artCard + " " + (option.artTone === "dark" ? styles.artCardDark : styles.artCardLight) : ""}`} style={{ background: option.art ? `url('${option.art}') center 46% / cover` : `linear-gradient(145deg, ${optionPalette.background}, ${optionPalette.swatch}35)` }}>
                    <span className={`${styles.motionLayer} ${motionClasses[option.motion ?? "shimmer"]}`} />
                    {option.art ? <span className={styles.artCardCopy}>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">Invitación · {eventType}</span>
                      <span className="mt-2 text-2xl font-semibold leading-tight" style={{ fontFamily: option.font === "serif" ? "Georgia, 'Times New Roman', serif" : "Arial, Helvetica, sans-serif" }}>{cardPreview[eventType].name}</span>
                      <span className="mt-2 text-[10px] tracking-[0.12em]">{cardPreview[eventType].date}</span>
                    </span> : <>
                    <span className="absolute -right-5 -top-7 size-24 rounded-full opacity-30 blur-xl" style={{ backgroundColor: optionPalette.accent }} />
                    <span className={`relative flex min-h-36 w-full flex-col items-center justify-center border px-4 py-4 text-center shadow-md transition group-hover:scale-[1.02] ${option.layout === "poster" ? styles.cardPosterPreview + " max-w-[11rem] rounded-[2.5rem]" : option.layout === "compact" ? styles.cardCompactPreview + " max-w-sm rounded-xl" : option.layout === "frame" ? styles.cardFrame + " max-w-xs rounded-sm" : option.layout === "ticket" ? styles.cardTicket + " max-w-sm rounded-xl" : styles.cardClassicPreview + " max-w-xs rounded-[2rem]"}`} style={{ backgroundColor: optionPalette.panel, borderColor: `${optionPalette.accent}55`, color: optionPalette.ink, fontFamily: option.font === "serif" ? "Georgia, 'Times New Roman', serif" : "Arial, Helvetica, sans-serif" }}>
                      <span className="text-[9px] font-semibold uppercase tracking-[0.24em] opacity-60">Invitación · {eventType}</span>
                      <span aria-hidden="true" className="mt-2 text-lg leading-none" style={{ color: optionPalette.accent }}>{option.layout === "ticket" ? "✦ ─ ✦" : option.layout === "compact" ? "· · ·" : "❦"}</span>
                      <span className="mt-1 text-xl font-semibold leading-tight" style={{ color: optionPalette.accent }}>{cardPreview[eventType].name}</span>
                      <span className="mt-2 h-px w-9" style={{ backgroundColor: optionPalette.accent }} />
                      <span className="mt-2 text-[10px] opacity-70">{cardPreview[eventType].date}</span>
                      {option.decorations && <span className="absolute right-3 top-2 text-sm" style={{ color: optionPalette.accent }}>✦</span>}
                    </span>
                    </>}
                  </span>
                  <span className="flex min-h-[4.5rem] items-center justify-between gap-3 px-4 py-3">
                    <span className="min-w-0"><span className="block font-semibold">{option.name}</span><span className="mt-0.5 block text-xs font-normal opacity-65">{option.art ? "Arte original · portada ilustrada" : `${optionPalette.label} · ${option.layout === "poster" ? "Foto protagonista" : option.layout === "compact" ? "Compacta" : option.layout === "frame" ? "Marco editorial" : option.layout === "ticket" ? "Pase de celebración" : "Clásica"}`}</span></span>
                    <span className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: optionPalette.cta }}>{templateId === optionId ? "Aplicada" : "Ver plantilla"}</span>
                  </span>
                </button>;
              })}
              {eventType === "Boda" && <Link href="/muestras/boda/editorial" data-template="yes" className="group flex min-h-64 flex-col overflow-hidden rounded-2xl border border-[#b99b76] bg-[#f8f2e8] text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]">
                <span aria-hidden="true" className="relative flex h-48 flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_15%,#f9f5eb,#ad9984)] text-[#513d2e]"><span className="text-xs tracking-[0.3em]">NUESTRA BODA</span><span className="mt-4 text-4xl font-serif italic">Mar & Sol</span><span className="mt-5 text-xs tracking-[0.2em]">✦ 15 · MAY · 2027 ✦</span></span>
                <span className="flex min-h-[4.5rem] items-center justify-between gap-3 px-4 py-3"><span className="min-w-0"><span className="block font-semibold">Historia editorial</span><span className="mt-0.5 block text-xs font-normal opacity-65">Carta, música original y galería personalizable</span></span><span className="shrink-0 rounded-full bg-[#513d2e] px-3 py-2 text-xs font-semibold text-white">Abrir plantilla</span></span>
              </Link>}
            </div>
            <p className="mt-3 text-xs opacity-60">La vista previa completa aparece más abajo. Tus cambios solo se muestran en este navegador.</p>
          </fieldset>
          <SampleMusicPlayer />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium" htmlFor="sample-name">Nombre
              <input id="sample-name" value={name} maxLength={60} onChange={(event) => { setName(event.target.value); setEdited((current) => ({ ...current, name: true })); }} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
            </label>
            <label className="text-sm font-medium" htmlFor="sample-intro">Frase de entrada
              <input id="sample-intro" value={intro} maxLength={80} onChange={(event) => { setIntro(event.target.value); setCopyEdited(true); }} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
            </label>
            <label className="text-sm font-medium sm:col-span-2" htmlFor="sample-message">Mensaje
              <textarea id="sample-message" value={message} maxLength={240} rows={3} onChange={(event) => { setMessage(event.target.value); setCopyEdited(true); }} className="mt-2 w-full resize-y rounded-xl border border-current/20 bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
              <span className="mt-1 block text-xs font-normal opacity-60">{message.length}/240 caracteres</span>
            </label>
            <label className="text-sm font-medium sm:col-span-2" htmlFor="sample-cover-image">Foto de portada
              <input ref={imageInputRef} id="sample-cover-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseCoverImage(event.target.files?.[0])} className="mt-2 block min-h-11 w-full rounded-xl border border-current/20 bg-white p-2 text-sm file:mr-3 file:min-h-8 file:rounded-full file:border-0 file:bg-[#76483d] file:px-3 file:text-white focus-visible:outline-2 focus-visible:outline-offset-2" />
              <span className="mt-1 block text-xs font-normal opacity-65">JPG, PNG o WebP · máximo 5 MB · solo vista local; no se guarda ni se sube.</span>
              {imageError && <span role="alert" className="mt-2 block text-sm font-semibold text-red-800">{imageError}</span>}
              {coverImage && <button type="button" onClick={clearCoverImage} className="mt-2 min-h-10 rounded-full border border-current/25 px-4 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">Quitar foto</button>}
            </label>
            <label className="text-sm font-medium" htmlFor="sample-date">Fecha
              <input id="sample-date" type="date" value={date} onChange={(event) => { setDate(event.target.value); setEdited((current) => ({ ...current, date: true })); }} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
            </label>
            <label className="text-sm font-medium" htmlFor="sample-time">Hora
              <input id="sample-time" type="time" value={time} onChange={(event) => { setTime(event.target.value); setEdited((current) => ({ ...current, time: true })); }} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
            </label>
            <label className="text-sm font-medium" htmlFor="sample-place">Lugar
              <input id="sample-place" value={place} maxLength={100} onChange={(event) => { setPlace(event.target.value); setEdited((current) => ({ ...current, place: true })); }} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
            </label>
          </div>
          <div className="mt-6 grid gap-5 border-t border-current/10 pt-5 sm:grid-cols-2">
            <fieldset>
              <legend className="text-sm font-semibold">Paleta de color</legend>
              <div className="mt-3 flex flex-wrap gap-2" aria-label="Elige una paleta">
                {(Object.entries(palettes) as [PaletteId, (typeof palettes)[PaletteId]][]).map(([id, option]) => (
                  <button key={id} type="button" aria-label={option.label} aria-pressed={backgroundColor === option.background && accentColor === option.accent && buttonColor === option.cta} onClick={() => { setPaletteId(id); setBackgroundColor(option.background); setAccentColor(option.accent); setButtonColor(option.cta); }} className={styles.paletteOption}>
                    <span aria-hidden="true" className={styles.swatch} style={{ backgroundColor: option.swatch }} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              <fieldset className="mt-5">
                <legend className="text-sm font-semibold">Colores personalizados</legend>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <label className="grid gap-2 text-xs font-medium" htmlFor="sample-background-color">Fondo
                    <input id="sample-background-color" type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-current/20 bg-white p-1 focus-visible:outline-2 focus-visible:outline-offset-2" />
                  </label>
                  <label className="grid gap-2 text-xs font-medium" htmlFor="sample-accent-color">Nombre
                    <input id="sample-accent-color" type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-current/20 bg-white p-1 focus-visible:outline-2 focus-visible:outline-offset-2" />
                  </label>
                  <label className="grid gap-2 text-xs font-medium" htmlFor="sample-button-color">Botón
                    <input id="sample-button-color" type="color" value={buttonColor} onChange={(event) => setButtonColor(event.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-current/20 bg-white p-1 focus-visible:outline-2 focus-visible:outline-offset-2" />
                  </label>
                </div>
                <p className="mt-2 text-xs font-normal opacity-65">Ajusta los tonos a tu gusto y revisa que el texto conserve buen contraste.</p>
              </fieldset>
            </fieldset>
            <div className="grid content-start gap-4">
              <label className="text-sm font-semibold" htmlFor="sample-font">Tipografía del nombre
                <select id="sample-font" value={font} onChange={(event) => setFont(event.target.value as "serif" | "sans")} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]">
                  <option value="serif">Elegante</option>
                  <option value="sans">Moderna</option>
                </select>
              </label>
              <label className="text-sm font-semibold" htmlFor="sample-layout">Composición de la invitación
                <select id="sample-layout" value={layout} onChange={(event) => setLayout(event.target.value as SampleLayout)} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]">
                  <option value="classic">Clásica</option>
                  <option value="compact">Compacta</option>
                  <option value="poster">Foto protagonista</option>
                  <option value="frame">Marco editorial</option>
                  <option value="ticket">Pase de celebración</option>
                </select>
              </label>
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                <input id="sample-decorations" type="checkbox" checked={decorations} onChange={(event) => setDecorations(event.target.checked)} className="size-5 accent-[#76483d] focus-visible:outline-2 focus-visible:outline-offset-2" />
                Globos y destellos animados
              </label>
              <fieldset className="grid gap-2">
                <legend className="text-sm font-semibold">Secciones visibles</legend>
                <label className="flex min-h-9 items-center gap-3 text-sm font-normal"><input id="sample-show-intro" type="checkbox" checked={showIntro} onChange={(event) => setShowIntro(event.target.checked)} className="size-5 accent-[#76483d]" />Frase de entrada</label>
                <label className="flex min-h-9 items-center gap-3 text-sm font-normal"><input id="sample-show-message" type="checkbox" checked={showMessage} onChange={(event) => setShowMessage(event.target.checked)} className="size-5 accent-[#76483d]" />Mensaje</label>
                <label className="flex min-h-9 items-center gap-3 text-sm font-normal"><input id="sample-show-date" type="checkbox" checked={showDate} onChange={(event) => setShowDate(event.target.checked)} className="size-5 accent-[#76483d]" />Fecha y hora</label>
                <label className="flex min-h-9 items-center gap-3 text-sm font-normal"><input id="sample-show-location" type="checkbox" checked={showLocation} onChange={(event) => setShowLocation(event.target.checked)} className="size-5 accent-[#76483d]" />Ubicación y mapa</label>
                <label className="flex min-h-9 items-center gap-3 text-sm font-normal"><input id="sample-show-countdown" type="checkbox" checked={showCountdown} onChange={(event) => setShowCountdown(event.target.checked)} className="size-5 accent-[#76483d]" />Cuenta regresiva</label>
                <label className="flex min-h-9 items-center gap-3 text-sm font-normal"><input id="sample-show-demo-access" type="checkbox" checked={showDemoAccess} onChange={(event) => setShowDemoAccess(event.target.checked)} className="size-5 accent-[#76483d]" />Pase QR y check-in de demostración</label>
              </fieldset>
              <label className="text-sm font-semibold" htmlFor="sample-countdown-effect">Efecto de la cuenta regresiva
                <select id="sample-countdown-effect" value={countdownEffect} onChange={(event) => setCountdownEffect(event.target.value as CountdownEffect)} disabled={!showCountdown} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]">
                  <option value="none">Sin movimiento</option>
                  <option value="float">Flotar suavemente</option>
                  <option value="pulse">Latido</option>
                  <option value="sparkle">Destellos</option>
                </select>
                <span className="mt-1 block text-xs font-normal opacity-65">Los destellos y el brillo usan el color que elegiste para el nombre.</span>
              </label>
            </div>
          </div>
        </section>

        <article id="sample-hero" style={{ backgroundColor: "var(--sample-panel)" }} className={styles.hero + " " + (layout === "compact" ? styles.heroCompact : layout === "poster" ? styles.heroPoster : layout === "frame" ? styles.heroFrame : layout === "ticket" ? styles.heroTicket : "") + (selectedTemplate.art && !coverImage ? " " + styles.heroWithArt + " " + (selectedTemplate.artTone === "dark" ? styles.heroArtDark : styles.heroArtLight) : "") + (letterOpened ? " " + styles.letterSceneOpen : "") + " relative isolate mt-8 flex min-h-[72svh] items-center justify-center overflow-hidden rounded-[2rem] border border-current/10 px-6 pb-28 pt-12 text-center shadow-2xl sm:rounded-[2.75rem] sm:px-14 sm:pb-28 sm:pt-16"}>
          {selectedTemplate.art && !coverImage && <div style={{ backgroundImage: `url('${selectedTemplate.art}')` }} aria-hidden="true" className={styles.templateArt} />}
          {coverImage && <div style={{ backgroundImage: `url("${coverImage}")` }} aria-hidden="true" className={styles.coverImage} />}
          <span aria-hidden="true" className={`${styles.motionLayer} ${motionClasses[activeMotion]}`} />
          <span aria-hidden="true" className={styles.glow + " " + styles.glowOne} />
          <span aria-hidden="true" className={styles.glow + " " + styles.glowTwo} />
          {decorations && <>
            <span aria-hidden="true" className={styles.balloon + " " + styles.balloonOne} />
            <span aria-hidden="true" className={styles.balloon + " " + styles.balloonTwo} />
            <span aria-hidden="true" className={styles.balloon + " " + styles.balloonThree} />
            <span aria-hidden="true" className={styles.sparkle + " " + styles.sparkleOne}>✦</span>
            <span aria-hidden="true" className={styles.sparkle + " " + styles.sparkleTwo}>✧</span>
            <span aria-hidden="true" className={styles.sparkle + " " + styles.sparkleThree}>✦</span>
          </>}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-8 z-10 h-px bg-current/10 sm:inset-x-14" />
          <div aria-hidden="true" className={styles.envelopeArt + (letterOpened ? " " + styles.envelopeArtOpened : "")}>
            <span className={styles.envelopePaper}>
              <span className="text-[9px] font-semibold uppercase tracking-[0.24em] opacity-60">Una celebración especial</span>
              <span className="mt-3 text-2xl font-semibold" style={{ color: "var(--sample-accent)" }}>{name || "Para ti"}</span>
              <span className="mt-2 text-xs opacity-70">{eventType} · {formatDate(date)}</span>
            </span>
            <span className={styles.envelopeBody} />
            <span className={styles.envelopeFlap} />
            <span className={styles.envelopePocket} />
            <span className={styles.envelopeSeal} style={{ backgroundColor: "var(--sample-cta)" }}>✦</span>
          </div>
          <div id="sample-invitation-preview" aria-hidden={!letterOpened} className={styles.heroContent + (letterOpened ? " " + styles.letterContentOpen : " " + styles.letterContentClosed)}>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-current/15 bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.18em] shadow-sm backdrop-blur">
              <span className={styles.twinkle} aria-hidden="true">✦</span> Una celebración especial <span className={styles.twinkle + " " + styles.twinkleLate} aria-hidden="true">✦</span>
            </div>
            <p className="mt-12 text-xs font-semibold uppercase tracking-[0.28em] opacity-65">{eventType}</p>
            {showIntro && <p className="mt-5 text-lg">{intro || "Tu frase de entrada"}</p>}
            <h1 style={{ color: selectedTemplate.artTone === "dark" && !coverImage ? "color-mix(in srgb, var(--sample-accent) 35%, white)" : "var(--sample-accent)" }} className={styles.title + " mt-3 text-6xl leading-tight sm:text-8xl " + (font === "serif" ? styles.serifTitle : styles.sansTitle)}>{name || "Tu nombre"}</h1>
            {showMessage && <p className="mx-auto mt-5 max-w-lg whitespace-pre-wrap text-lg leading-relaxed opacity-80">{message || "Tu mensaje aparecerá aquí."}</p>}
            {showDate && <div className={styles.dateBadge + " mx-auto mt-8 max-w-md rounded-3xl border border-white/70 bg-white/60 px-5 py-5 shadow-sm backdrop-blur-sm sm:px-8"}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Guarda la fecha</p>
              <p className="mt-2 text-xl font-medium sm:text-2xl">{displayDate}</p>
              <p className="mt-4 text-sm opacity-70">Nos encantará compartir este día contigo.</p>
            </div>}
          </div>
          <button id="sample-letter-action" type="button" aria-label={letterOpened ? "Cerrar y volver a abrir la invitación" : "Abrir invitación"} aria-controls="sample-invitation-preview" aria-expanded={letterOpened} onClick={() => setLetterOpened((current) => !current)} className={styles.letterButton}>
            <span aria-hidden="true">{letterOpened ? "✉" : "✦"}</span> {letterOpened ? "Cerrar y volver a abrir" : "Abrir invitación"}
          </button>
        </article>

        {showCountdown && <section className="mt-6 rounded-3xl border border-current/10 p-5 text-center shadow-sm sm:p-8" style={{ backgroundColor: "var(--sample-panel)" }} aria-label="Cuenta regresiva ficticia">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">El gran día se acerca</p>
          <h2 className="mt-2 text-2xl sm:text-3xl">Nos vemos muy pronto</h2>
          <div className="mt-5"><EventCountdown date={date} time={time} theme={eventType === "Baby shower" ? "baby" : "wedding"} effect={countdownEffect} /></div>
        </section>}

        {(showDate || showLocation) && <section className="mt-6 grid gap-5 sm:grid-cols-2" aria-label="Detalles de la celebración">
          {showDate && <article style={{ backgroundColor: "var(--sample-panel)" }} className={styles.detail + " rounded-3xl border border-current/10 p-6 shadow-sm sm:p-8"}>
            <span aria-hidden="true" className={styles.detailIcon}>◷</span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Cuándo</p>
            <h2 className="mt-3 text-2xl">Una fecha para recordar</h2>
            <p className="mt-3 leading-relaxed opacity-75">{displayDate}</p>
          </article>}
          {showLocation && <article style={{ backgroundColor: "var(--sample-panel)" }} className={styles.detail + " " + styles.detailLate + " rounded-3xl border border-current/10 p-6 shadow-sm sm:p-8"}>
            <span aria-hidden="true" className={styles.detailIcon}>⌖</span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Dónde</p>
            <h2 className="mt-3 text-2xl">Nos encontramos aquí</h2>
            <p className="mt-3 leading-relaxed opacity-75">{place || "Agrega el lugar de tu celebración"}</p>
            {mapsLink && <a href={mapsLink} target="_blank" rel="noopener noreferrer" className={styles.mapLink + " mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-current/30 px-5 py-2 font-medium transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4"}>
              <span aria-hidden="true">⌖</span> Buscar en Google Maps<span className="sr-only"> (abre otra pestaña)</span>
            </a>}
            <p className="mt-3 text-xs opacity-60">La ubicación del ejemplo es ficticia.</p>
          </article>}
        </section>}

        {showDemoAccess && <DemoAccessCard eventType={eventType} allowCheckin />}

        <aside className={styles.closing + " mx-auto mt-8 max-w-2xl rounded-3xl border border-current/10 bg-white/65 p-6 text-center sm:p-8"}>
          <p className="text-sm leading-relaxed">Esta invitación es una muestra con datos ficticios; no confirma asistencia ni reserva un evento.</p>
          {orderLink ? <>
            <a href={orderLink} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "var(--sample-cta)" }} className={styles.cta + " mt-5 inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4"}>Pedir una invitación de {eventType.toLowerCase()} · $99 MXN<span className="sr-only"> por WhatsApp (abre otra pestaña)</span></a>
            <p className="mt-3 text-xs">Consulta alcance y entrega antes de transferir.</p>
          </> : <div className="mx-auto mt-5 max-w-lg rounded-2xl border border-current/15 bg-white/75 p-4 text-sm leading-relaxed"><p>Esta categoría se cotiza como proyecto personalizado. La oferta sencilla de $99 MXN corresponde a cumpleaños y bautizo.</p><a href={assistedCustomEventQuoteLink(eventType)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-current/40 px-5 py-2 font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">Consultar esta celebración por WhatsApp<span className="sr-only"> (abre otra pestaña)</span></a></div>}
        </aside>
      </div>
      {orderLink && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] backdrop-blur sm:hidden">
        <a href={orderLink} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "var(--sample-cta)" }} className="flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-center font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76483d]">
          Pedir invitación · $99 MXN<span className="sr-only"> por WhatsApp (abre otra pestaña)</span>
        </a>
      </div>}
    </main>
  );
}
