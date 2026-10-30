import type { Metadata } from "next";
import SimpleDemo from "../SimpleDemo";

export const metadata: Metadata = {
  title: { absolute: "Muestra de cumpleaños · ZefeInvita" },
  description: "Ejemplo ficticio de invitación digital sencilla para cumpleaños.",
  openGraph: {
    title: "Plantillas de cumpleaños · ZefeInvita",
    description: "Explora plantillas ficticias, personaliza una muestra y consulta tu invitación por WhatsApp.",
    url: "https://www.zefeinvita.com.mx/muestras/cumpleanos",
    siteName: "ZefeInvita",
    locale: "es_MX",
    type: "website",
    images: [{ url: "https://www.zefeinvita.com.mx/og-zefeinvita", width: 1200, height: 630, alt: "ZefeInvita: plantillas de invitación para cumpleaños" }],
  },
  twitter: { card: "summary_large_image", title: "Plantillas de cumpleaños · ZefeInvita", images: ["https://www.zefeinvita.com.mx/og-zefeinvita"] },
};

export default function BirthdaySample() {
  return <SimpleDemo
    type="Cumpleaños"
    name="Sofía"
    intro="¡Es mi cumpleaños!"
    message="Ven a celebrar mis 5 años. Habrá juegos, alegría y muchas sonrisas."
    date="2026-12-12"
    time="16:00"
    place="Jardín de ejemplo · Ciudad imaginaria"
  />;
}
