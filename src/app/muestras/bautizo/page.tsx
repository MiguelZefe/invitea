import type { Metadata } from "next";
import SimpleDemo from "../SimpleDemo";

export const metadata: Metadata = {
  title: { absolute: "Muestra de bautizo · ZefeInvita" },
  description: "Ejemplo ficticio de invitación digital sencilla para bautizo.",
  openGraph: {
    title: "Plantillas de bautizo · ZefeInvita",
    description: "Explora plantillas ficticias, personaliza una muestra y consulta tu invitación por WhatsApp.",
    url: "https://www.zefeinvita.com.mx/muestras/bautizo",
    siteName: "ZefeInvita",
    locale: "es_MX",
    type: "website",
    images: [{ url: "https://www.zefeinvita.com.mx/og-zefeinvita", width: 1200, height: 630, alt: "ZefeInvita: plantillas de invitación para bautizo" }],
  },
  twitter: { card: "summary_large_image", title: "Plantillas de bautizo · ZefeInvita", images: ["https://www.zefeinvita.com.mx/og-zefeinvita"] },
};

export default function BaptismSample() {
  return <SimpleDemo
    type="Bautizo"
    name="Mateo"
    intro="Te invitamos a mi bautizo"
    message="Acompáñanos en un día lleno de cariño para nuestra familia."
    date="2026-12-19"
    time="12:00"
    place="Salón de ejemplo · Ciudad imaginaria"
  />;
}
