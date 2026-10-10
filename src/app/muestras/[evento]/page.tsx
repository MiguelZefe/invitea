import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SimpleDemo, { type SampleEventType } from "../SimpleDemo";

const samples = {
  "baby-shower": {
    type: "Baby shower",
    name: "Nuestra bebé (ficticia)",
    intro: "¡Una nueva aventura está por comenzar!",
    message: "Acompáñanos a celebrar la llegada de nuestro bebé.",
    date: "2026-11-21",
    time: "16:00",
    place: "Jardín de ejemplo · Ciudad imaginaria",
  },
  boda: {
    type: "Boda",
    name: "Mar y Sol (ficticios)",
    intro: "¡Nos casamos!",
    message: "Acompáñanos a celebrar nuestro amor y comenzar una nueva etapa juntos.",
    date: "2027-05-15",
    time: "18:00",
    place: "Jardín de ejemplo · Ciudad imaginaria",
  },
  "xv-anos": {
    type: "XV años",
    name: "Valentina (ficticia)",
    intro: "Mis XV años",
    message: "Acompáñame a celebrar una noche muy especial.",
    date: "2027-03-20",
    time: "19:00",
    place: "Salón de ejemplo · Ciudad imaginaria",
  },
  "primera-comunion": {
    type: "Primera comunión",
    name: "Emilia (ficticia)",
    intro: "Mi Primera Comunión",
    message: "Acompáñanos en un día importante para nuestra familia.",
    date: "2027-04-18",
    time: "12:00",
    place: "Templo de ejemplo · Ciudad imaginaria",
  },
  graduacion: {
    type: "Graduación",
    name: "Alex (ficticio)",
    intro: "¡Lo logré!",
    message: "Celebremos este logro y todo lo que viene.",
    date: "2027-06-26",
    time: "17:00",
    place: "Terraza de ejemplo · Ciudad imaginaria",
  },
  aniversario: {
    type: "Aniversario",
    name: "Mar y Sol (ficticios)",
    intro: "Celebramos nuestro aniversario",
    message: "Nos encantará compartir este capítulo con quienes más queremos.",
    date: "2027-02-14",
    time: "19:00",
    place: "Restaurante de ejemplo · Ciudad imaginaria",
  },
} satisfies Record<string, {
  type: SampleEventType;
  name: string;
  intro: string;
  message: string;
  date: string;
  time: string;
  place: string;
}>;

type SampleSlug = keyof typeof samples;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(samples).map((evento) => ({ evento }));
}

export async function generateMetadata({ params }: { params: Promise<{ evento: string }> }): Promise<Metadata> {
  const { evento } = await params;
  const sample = samples[evento as SampleSlug];
  if (!sample) return { title: "Muestra · ZefeInvita" };
  return {
    title: { absolute: `Muestra de ${sample.type.toLowerCase()} · ZefeInvita` },
    description: `Explora ${sample.type === "Boda" ? "tres" : "dos"} estilos ficticios de invitación para ${sample.type.toLowerCase()}.`,
  };
}

export default async function EventSample({ params }: { params: Promise<{ evento: string }> }) {
  const { evento } = await params;
  const sample = samples[evento as SampleSlug];
  if (!sample) notFound();

  return <SimpleDemo {...sample} />;
}
