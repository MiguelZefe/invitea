import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "INVITEA · Invitaciones digitales",
    template: "%s · INVITEA",
  },
  description:
    "Crea y administra invitaciones digitales con invitados, RSVP, códigos QR y check-in.",
  applicationName: "INVITEA",
  keywords: [
    "invitaciones digitales",
    "eventos",
    "RSVP",
    "códigos QR",
    "check-in",
  ],
  creator: "INVITEA",
  category: "events",
  referrer: "strict-origin-when-cross-origin",
  openGraph: {
    title: "INVITEA · Invitaciones digitales",
    description:
      "Crea y administra invitaciones digitales con invitados, RSVP, códigos QR y check-in.",
    siteName: "INVITEA",
    locale: "es_MX",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${playfair.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
