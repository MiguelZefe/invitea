import EventCountdown from "@/components/EventCountdown";
import styles from "@/components/baby-shower/BabyShowerInvitation.module.css";
import type { InviteEvent } from "@/types/event";
import Image from "next/image";
import type { ReactNode } from "react";

type BabyShowerInvitationProps = {
  event: InviteEvent;
  children?: ReactNode;
  photoUrl?: string;
  calendarUrl?: string;
  primaryActionHref?: string;
  primaryActionLabel?: string;
};

export default function BabyShowerInvitation({
  event,
  children,
  photoUrl,
  calendarUrl,
  primaryActionHref = "#asistencia",
  primaryActionLabel = "Confirmar asistencia",
}: BabyShowerInvitationProps) {
  const eventPlace = event.reception_place ?? event.ceremony_place;
  const eventTime = event.reception_time ?? event.ceremony_time;
  const eventAddress = event.reception_address ?? event.ceremony_address;
  const mapsUrl = event.reception_maps_url ?? event.ceremony_maps_url;

  return (
    <div className={styles.invitation}>
      <section className={styles.hero}>
        <span aria-hidden="true" className={`${styles.cloud} ${styles.cloudOne}`} />
        <span aria-hidden="true" className={`${styles.cloud} ${styles.cloudTwo}`} />
        <span aria-hidden="true" className={`${styles.balloon} ${styles.balloonOne}`} />
        <span aria-hidden="true" className={`${styles.balloon} ${styles.balloonTwo}`} />
        <span aria-hidden="true" className={`${styles.balloon} ${styles.balloonThree}`} />
        <span aria-hidden="true" className={`${styles.sparkle} ${styles.sparkleOne}`}>✦</span>
        <span aria-hidden="true" className={`${styles.sparkle} ${styles.sparkleTwo}`}>✧</span>

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{event.hero_label}</p>
          <h1 className={styles.title}>{event.main_names}</h1>
          <p className={styles.eventTitle}>{event.title}</p>
          <p className={styles.date}>{event.event_date}</p>

          {event.subtitle && <p className={styles.subtitle}>{event.subtitle}</p>}

          <div className={styles.countdown}>
            <EventCountdown
              date={event.event_date}
              time={eventTime}
              theme="baby"
            />
          </div>

          <div className={styles.actions}>
            <a href={primaryActionHref} className={styles.primaryAction}>
              {primaryActionLabel}
            </a>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryAction}
              >
                Cómo llegar
              </a>
            )}
            {calendarUrl && (
              <a
                href={calendarUrl}
                download
                className={styles.secondaryAction}
              >
                Agregar al calendario
              </a>
            )}
          </div>
        </div>
      </section>

      <section className={styles.intro}>
        <div className={styles.introInner}>
          <span aria-hidden="true" className={styles.introIcon}>♡</span>
          <p className={styles.sectionEyebrow}>Una dulce espera</p>
          <h2 className={styles.sectionTitle}>Un pequeño sueño está por comenzar</h2>
          <p className={styles.introText}>
            Queremos compartir contigo la alegría de esta nueva etapa. Tu cariño
            hará que este día sea todavía más especial para nuestra familia.
          </p>
        </div>
      </section>

      {photoUrl && (
        <section className={styles.photoSection}>
          <div className={styles.photoInner}>
            <div className={styles.photoFrame}>
              <Image
                src={photoUrl}
                alt="Recuerdo especial durante la espera de Liam Alejandro"
                width={720}
                height={726}
                sizes="(max-width: 760px) 88vw, 34rem"
                className={styles.photo}
              />
              <span aria-hidden="true" className={styles.photoSparkle}>✦</span>
            </div>
            <div className={styles.photoCopy}>
              <p className={styles.sectionEyebrow}>Esperándote con amor</p>
              <h2 className={styles.sectionTitle}>Cada día falta un poquito menos</h2>
              <p className={styles.introText}>
                Liam Alejandro ya está rodeado de mucho cariño. Gracias por ser
                parte de esta espera y de los recuerdos que estamos creando.
              </p>
            </div>
          </div>
        </section>
      )}

      <section id="detalles" className={styles.details}>
        <div className={styles.sectionInner}>
          <div className={styles.detailsHeader}>
            <p className={styles.sectionEyebrow}>Guarda la fecha</p>
            <h2 className={styles.sectionTitle}>Detalles de la celebración</h2>
          </div>

          <div className={styles.detailGrid}>
            <article className={styles.detailCard}>
              <span aria-hidden="true" className={styles.detailIcon}>◌</span>
              <p className={styles.detailLabel}>Fecha</p>
              <p className={styles.detailValue}>{event.event_date}</p>
            </article>
            <article className={styles.detailCard}>
              <span aria-hidden="true" className={styles.detailIcon}>◷</span>
              <p className={styles.detailLabel}>Hora</p>
              <p className={styles.detailValue}>{eventTime ?? "Por confirmar"}</p>
            </article>
            <article className={styles.detailCard}>
              <span aria-hidden="true" className={styles.detailIcon}>⌖</span>
              <p className={styles.detailLabel}>Lugar</p>
              <p className={styles.detailValue}>{eventPlace ?? "Por confirmar"}</p>
            </article>
          </div>

          {(eventAddress || mapsUrl) && (
            <article className={styles.locationCard}>
              <div>
                <p className={styles.detailLabel}>Nos vemos en</p>
                <h3 className={styles.detailValue}>{eventPlace ?? "Lugar del evento"}</h3>
                {eventAddress && <p className={styles.locationAddress}>{eventAddress}</p>}
              </div>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapAction}
                >
                  Abrir ubicación
                </a>
              )}
            </article>
          )}
        </div>
      </section>

      {(event.dress_code || event.dress_code_description) && (
        <section className={styles.dressCode}>
          <p className={styles.sectionEyebrow}>Código de vestimenta</p>
          {event.dress_code && <h2 className={styles.sectionTitle}>{event.dress_code}</h2>}
          {event.dress_code_description && (
            <p className={styles.dressCodeDescription}>{event.dress_code_description}</p>
          )}
          <p aria-hidden="true" className={styles.tinyHearts}>♡ ♡ ♡</p>
        </section>
      )}

      {children ?? (
        <section className={styles.closing}>
          <p className={styles.sectionEyebrow}>Con mucho cariño</p>
          <h2 className={styles.sectionTitle}>¡Te esperamos!</h2>
          <p className={styles.closingText}>
            Tu presencia hará que el baby shower de Liam Alejandro sea todavía
            más especial.
          </p>
          <span aria-hidden="true" className={styles.closingHeart}>♡</span>
        </section>
      )}
    </div>
  );
}
