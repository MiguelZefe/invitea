"use client";

import { useState } from "react";
import Link from "next/link";
import { googleMapsSearchLink } from "@/lib/google-maps";
import { assistedOrderLink, type SimpleEventType } from "@/lib/assisted-sales";
import styles from "./SampleMotion.module.css";

type Props = {
  type: SimpleEventType;
  name: string;
  intro: string;
  message: string;
  date: string;
  time: string;
  place: string;
  colors: { background: string; ink: string; panel: string; accent: string; cta: string };
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

export default function SimpleDemo({ type, name: initialName, intro, message, date: initialDate, time: initialTime, place: initialPlace, colors }: Props) {
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [place, setPlace] = useState(initialPlace);
  const [edited, setEdited] = useState({ name: false, date: false, time: false, place: false });
  const displayDate = `${formatDate(date)} · ${formatTime(time)}`;
  const mapsLink = place.trim() ? googleMapsSearchLink(place) : null;
  const orderLink = assistedOrderLink(type, {
    name: edited.name ? name : undefined,
    date: edited.date ? date : undefined,
    time: edited.time ? time : undefined,
    place: edited.place ? place : undefined,
  });

  function resetSample() {
    setName(initialName);
    setDate(initialDate);
    setTime(initialTime);
    setPlace(initialPlace);
    setEdited({ name: false, date: false, time: false, place: false });
  }

  return (
    <main className={styles.ambient + " relative min-h-screen overflow-hidden px-5 py-6 pb-28 sm:px-8 sm:py-10 sm:pb-10 " + colors.background + " " + colors.ink}>
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
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium" htmlFor="sample-name">Nombre
              <input id="sample-name" value={name} maxLength={60} onChange={(event) => { setName(event.target.value); setEdited((current) => ({ ...current, name: true })); }} className="mt-2 min-h-11 w-full rounded-xl border border-current/20 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#76483d]" />
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
        </section>

        <article className={styles.hero + " relative isolate mt-8 flex min-h-[72svh] items-center justify-center overflow-hidden rounded-[2rem] border border-current/10 px-6 py-12 text-center shadow-2xl sm:rounded-[2.75rem] sm:px-14 sm:py-16 " + colors.panel}>
          <span aria-hidden="true" className={styles.glow + " " + styles.glowOne} />
          <span aria-hidden="true" className={styles.glow + " " + styles.glowTwo} />
          <span aria-hidden="true" className={styles.balloon + " " + styles.balloonOne} />
          <span aria-hidden="true" className={styles.balloon + " " + styles.balloonTwo} />
          <span aria-hidden="true" className={styles.balloon + " " + styles.balloonThree} />
          <span aria-hidden="true" className={styles.sparkle + " " + styles.sparkleOne}>✦</span>
          <span aria-hidden="true" className={styles.sparkle + " " + styles.sparkleTwo}>✧</span>
          <span aria-hidden="true" className={styles.sparkle + " " + styles.sparkleThree}>✦</span>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-8 z-10 h-px bg-current/10 sm:inset-x-14" />
          <div className={styles.heroContent}>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-current/15 bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.18em] shadow-sm backdrop-blur">
              <span className={styles.twinkle} aria-hidden="true">✦</span> Una celebración especial <span className={styles.twinkle + " " + styles.twinkleLate} aria-hidden="true">✦</span>
            </div>
            <p className="mt-12 text-xs font-semibold uppercase tracking-[0.28em] opacity-65">{type}</p>
            <p className="mt-5 text-lg">{intro}</p>
            <h1 className={styles.title + " mt-3 text-6xl leading-tight sm:text-8xl " + colors.accent}>{name}</h1>
            <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed opacity-80">{message}</p>
            <div className={styles.dateBadge + " mx-auto mt-8 max-w-md rounded-3xl border border-white/70 bg-white/60 px-5 py-5 shadow-sm backdrop-blur-sm sm:px-8"}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Guarda la fecha</p>
              <p className="mt-2 text-xl font-medium sm:text-2xl">{displayDate}</p>
              <p className="mt-4 text-sm opacity-70">Nos encantará compartir este día contigo.</p>
            </div>
          </div>
        </article>

        <section className="mt-6 grid gap-5 sm:grid-cols-2" aria-label="Detalles de la celebración">
          <article className={styles.detail + " rounded-3xl border border-current/10 bg-white/75 p-6 shadow-sm sm:p-8"}>
            <span aria-hidden="true" className={styles.detailIcon}>◷</span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Cuándo</p>
            <h2 className="mt-3 text-2xl">Una fecha para recordar</h2>
            <p className="mt-3 leading-relaxed opacity-75">{displayDate}</p>
          </article>
          <article className={styles.detail + " " + styles.detailLate + " rounded-3xl border border-current/10 bg-white/75 p-6 shadow-sm sm:p-8"}>
            <span aria-hidden="true" className={styles.detailIcon}>⌖</span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">Dónde</p>
            <h2 className="mt-3 text-2xl">Nos encontramos aquí</h2>
            <p className="mt-3 leading-relaxed opacity-75">{place || "Agrega el lugar de tu celebración"}</p>
            {mapsLink && <a href={mapsLink} target="_blank" rel="noopener noreferrer" className={styles.mapLink + " mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-current/30 px-5 py-2 font-medium transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4"}>
              <span aria-hidden="true">⌖</span> Buscar en Google Maps<span className="sr-only"> (abre otra pestaña)</span>
            </a>}
            <p className="mt-3 text-xs opacity-60">La ubicación del ejemplo es ficticia.</p>
          </article>
        </section>

        <aside className={styles.closing + " mx-auto mt-8 max-w-2xl rounded-3xl border border-current/10 bg-white/65 p-6 text-center sm:p-8"}>
          <p className="text-sm leading-relaxed">Esta invitación es una muestra con datos ficticios; no confirma asistencia ni reserva un evento.</p>
          <a href={orderLink} target="_blank" rel="noopener noreferrer" className={styles.cta + " mt-5 inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 " + colors.cta}>Pedir una invitación así · $99 MXN<span className="sr-only"> por WhatsApp (abre otra pestaña)</span></a>
          <p className="mt-3 text-xs">Consulta alcance y entrega antes de transferir.</p>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] backdrop-blur sm:hidden">
        <a href={orderLink} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center rounded-full bg-[#433b33] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#625044] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#76483d]">
          Pedir esta invitación · $99 MXN<span className="sr-only"> por WhatsApp (abre otra pestaña)</span>
        </a>
      </div>
    </main>
  );
}
