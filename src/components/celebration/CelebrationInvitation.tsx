import EventCountdown from "@/components/EventCountdown";
import type { InviteEvent } from "@/types/event";
import type { ReactNode } from "react";
import styles from "./CelebrationInvitation.module.css";

type Props = {
  event: InviteEvent;
  children: ReactNode;
};

function themeFor(eventType: string) {
  const type = eventType.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/bautizo|comunion/.test(type)) return "light";
  if (/cumpleanos|quince|xv/.test(type)) return "festive";
  if (/graduacion/.test(type)) return "night";
  return "garden";
}

export default function CelebrationInvitation({ event, children }: Props) {
  const locations = [
    { label: "Ceremonia o encuentro", place: event.ceremony_place, time: event.ceremony_time, address: event.ceremony_address, map: event.ceremony_maps_url },
    { label: "Celebración", place: event.reception_place, time: event.reception_time, address: event.reception_address, map: event.reception_maps_url },
  ].filter((location) => location.place || location.address);

  return (
    <>
      <section className={styles.cover} data-theme={themeFor(event.event_type)} aria-labelledby="invitation-title">
        <div className={styles.ornament} aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>
        <div className={styles.coverContent}>
          <p className={styles.eyebrow}>{event.event_type}</p>
          <div className={styles.seal} aria-hidden="true">✦</div>
          <p className={styles.heroLabel}>{event.hero_label}</p>
          <h1 id="invitation-title">{event.main_names}</h1>
          {event.subtitle && <p className={styles.subtitle}>{event.subtitle}</p>}
          <p className={styles.date}>{event.event_date}</p>
          <a href="#detalles" className={styles.coverAction}>Ver la invitación <span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section id="detalles" className={styles.details} aria-labelledby="details-title">
        <div className={styles.sectionInner}>
          <p className={styles.eyebrow}>Un día para recordar</p>
          <h2 id="details-title">Nos encantará celebrar contigo</h2>
          <p className={styles.dateLine}>{event.event_date}</p>
          <EventCountdown date={event.event_date} time={event.ceremony_time ?? event.reception_time} effect="float" />
          {locations.length > 0 && <div className={styles.locations}>
            {locations.map((location) => <article key={location.label} className={styles.location}>
              <p className={styles.eyebrow}>{location.label}</p>
              {location.place && <h3>{location.place}</h3>}
              {location.time && <p>{location.time}</p>}
              {location.address && <p>{location.address}</p>}
              {location.map && <a href={location.map} target="_blank" rel="noopener noreferrer">Ver ubicación <span className="sr-only">(abre otra pestaña)</span></a>}
            </article>)}
          </div>}
          {event.dress_code && <p className={styles.dressCode}><strong>Código de vestimenta:</strong> {event.dress_code}{event.dress_code_description ? ` · ${event.dress_code_description}` : ""}</p>}
          <a href="#asistencia" className={styles.confirmAction}>Confirmar asistencia</a>
        </div>
      </section>
      {children}
    </>
  );
}
