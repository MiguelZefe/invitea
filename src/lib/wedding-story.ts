export type WeddingStoryPhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type WeddingStoryData = {
  names: string;
  date: string;
  time: string;
  introduction: string;
  ceremonyName: string;
  ceremonyAddress: string;
  ceremonyMap: string | null;
  receptionName: string;
  receptionAddress: string;
  receptionMap: string | null;
  receptionTime: string | null;
  photos: readonly WeddingStoryPhoto[];
};

export const elizabethAndAlonso: WeddingStoryData = {
  names: "Elizabeth & Alonso",
  date: "2026-10-17",
  time: "09:30",
  introduction: "Hay historias que merecen celebrarse con quienes más queremos. Nos encantará que seas parte de la nuestra.",
  ceremonyName: "Registro Civil No. 30",
  ceremonyAddress: "San Juan de Dios y Coscomate s/n, Toriello Guerra, Tlalpan, C. P. 14050",
  ceremonyMap: "https://maps.app.goo.gl/iAFs3bEnfUuhjzeD7",
  receptionName: "Recepción",
  receptionAddress: "3ra cerrada de Encinos #29, San Miguel Topilejo",
  receptionMap: "https://maps.app.goo.gl/cTsCt4EfStBL66rT6",
  receptionTime: null,
  photos: [
    { src: "/images/wedding-elizabeth-alonso/city.jpg", alt: "Elizabeth y Alonso juntos durante una salida nocturna", width: 900, height: 1600 },
    { src: "/images/wedding-elizabeth-alonso/christ.jpg", alt: "Elizabeth y Alonso juntos frente a una escultura", width: 1200, height: 1600 },
    { src: "/images/wedding-elizabeth-alonso/tlayacapan.jpg", alt: "Elizabeth y Alonso en Tlayacapan", width: 1600, height: 899 },
    { src: "/images/wedding-elizabeth-alonso/forest.jpg", alt: "Elizabeth y Alonso en un puente rodeado de árboles", width: 2160, height: 2880 },
  ],
};

export const editorialWeddingSample: WeddingStoryData = {
  names: "Mar & Sol",
  date: "2027-05-15",
  time: "18:00",
  introduction: "Una historia para celebrar juntos. Personaliza esta plantilla y descubre cómo podría verse tu invitación.",
  ceremonyName: "Ceremonia de ejemplo",
  ceremonyAddress: "Jardín imaginario · Ciudad ficticia",
  ceremonyMap: null,
  receptionName: "Recepción de ejemplo",
  receptionAddress: "Terraza imaginaria · Ciudad ficticia",
  receptionMap: null,
  receptionTime: null,
  photos: [],
};

export function weddingInitials(names: string): string[] {
  return names.trim().split(/(?:\s*&\s*|\s+y\s+)/i)
    .map((name) => name.trim().charAt(0).toLocaleUpperCase("es-MX"))
    .filter(Boolean).slice(0, 2);
}

export function weddingDateLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (!year || !month || !day || Number.isNaN(date.getTime()) || date.getUTCDate() !== day || date.getUTCMonth() !== month - 1) {
    return "Fecha por confirmar";
  }
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

export function weddingWeekdayLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (!year || !month || !day || Number.isNaN(date.getTime()) || date.getUTCDate() !== day || date.getUTCMonth() !== month - 1) return "Día por confirmar";
  return new Intl.DateTimeFormat("es-MX", { weekday: "long", timeZone: "UTC" }).format(date);
}

export function weddingTimeLabel(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return "Hora por confirmar";
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return "Hora por confirmar";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "a. m." : "p. m."}`;
}
