"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type WeddingStoryData, type WeddingStoryPhoto, weddingDateLabel, weddingInitials, weddingTimeLabel, weddingWeekdayLabel } from "@/lib/wedding-story";
import styles from "./WeddingStory.module.css";

type Props = { initial: WeddingStoryData; isSample?: boolean };

function FloatingHearts({ className }: { className: string }) {
  return <div className={`${styles.hearts} ${className}`} aria-hidden="true">
    {Array.from({ length: 14 }, (_, index) => <span key={index}>♥</span>)}
  </div>;
}

function WeddingCountdown({ date, time }: { date: string; time: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    // Mexico City stays at UTC-6 on these event dates. An explicit offset keeps
    // the countdown correct for guests opening the invitation abroad.
    const target = Date.parse(`${date}T${time}:00-06:00`);
    if (Number.isNaN(target)) return;
    const update = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [date, time]);

  if (remaining === 0) return <p className={styles.countdownComplete}>¡Hoy celebramos nuestra historia!</p>;
  const parts = remaining === null ? null : [
    Math.floor(remaining / 86400),
    Math.floor((remaining % 86400) / 3600),
    Math.floor((remaining % 3600) / 60),
    remaining % 60,
  ];

  return <div role="timer" aria-label={parts ? `Faltan ${parts[0]} días, ${parts[1]} horas, ${parts[2]} minutos y ${parts[3]} segundos` : "Calculando cuenta regresiva"} className={styles.countdown}>
    {["Días", "Horas", "Min", "Seg"].map((label, index) => <div key={label}><strong>{parts ? String(parts[index]).padStart(2, "0") : "--"}</strong><span>{label}</span></div>)}
  </div>;
}

export default function WeddingStory({ initial, isSample = false }: Props) {
  const [story, setStory] = useState(initial);
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [previewPhotos, setPreviewPhotos] = useState<WeddingStoryPhoto[]>([]);
  const [imageError, setImageError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const invitationRef = useRef<HTMLElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoUrlsRef = useRef<string[]>([]);
  const manualAudioChoiceRef = useRef(false);
  const autoplayAttemptedRef = useRef(false);
  const photos = isSample && previewPhotos.length ? previewPhotos : story.photos;
  const initials = weddingInitials(story.names);
  const confirmationUrl = story.confirmationWhatsApp
    ? `https://wa.me/${story.confirmationWhatsApp.number}?text=${encodeURIComponent(`Hola, quiero confirmar mi asistencia a la boda de ${story.names} el ${weddingDateLabel(story.date)}. Mi nombre es: `)}`
    : null;
  const brideConfirmationUrl = story.brideWhatsApp
    ? `https://wa.me/${story.brideWhatsApp.number}?text=${encodeURIComponent(`Hola Elizabeth, quiero confirmar mi asistencia a la boda de ${story.names} el ${weddingDateLabel(story.date)}. Mi nombre es: `)}`
    : null;

  useEffect(() => () => { photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)); }, []);

  useEffect(() => {
    if (isSample || autoplayAttemptedRef.current) return;
    autoplayAttemptedRef.current = true;
    // Browsers may reject unmuted autoplay. The fixed control remains available.
    void audioRef.current?.play().catch(() => {});
  }, [isSample]);

  function update(field: "names" | "date" | "time" | "introduction" | "ceremonyName" | "ceremonyAddress" | "receptionAddress", value: string) {
    setStory((current) => ({ ...current, [field]: value }));
  }

  function openInvitation() {
    setOpened(true);
    if (!isSample && !manualAudioChoiceRef.current && audioRef.current?.paused) {
      // Opening the invitation is a user gesture, so it can unlock playback.
      void audioRef.current.play().catch(() => {});
    }
    window.requestAnimationFrame(() => invitationRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  }

  async function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    manualAudioChoiceRef.current = true;
    if (playing) { audio.pause(); return; }
    try {
      await audio.play();
      setAudioError("");
    } catch {
      setAudioError("No se pudo reproducir la música en este navegador.");
    }
  }

  function openPhoto(index: number) {
    setSelectedPhoto(index);
    dialogRef.current?.showModal();
  }

  function choosePhotos(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (selected.length > 4 || selected.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setImageError("Elige hasta 4 fotos JPG, PNG o WebP de máximo 5 MB cada una.");
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }
    dialogRef.current?.close();
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const urls = selected.map((file) => URL.createObjectURL(file));
    photoUrlsRef.current = urls;
    setPreviewPhotos(urls.map((src, index) => ({ src, alt: `Fotografía de muestra ${index + 1}`, width: 1200, height: 1600 })));
    setSelectedPhoto(0);
    setImageError("");
  }

  function resetSample() {
    setStory(initial);
    dialogRef.current?.close();
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    photoUrlsRef.current = [];
    setPreviewPhotos([]);
    setImageError("");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  return <main className={styles.page}>
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href={isSample ? "/muestras/boda" : "/"} className={styles.brand}>ZefeInvita<span>.</span></Link>
        <span className={styles.headerNote}>{isSample ? "PLANTILLA DE MUESTRA · DATOS FICTICIOS" : "UNA INVITACIÓN HECHA PARA TI"}</span>
      </header>

      {isSample && <section className={styles.editor} aria-labelledby="wedding-editor-title">
        <div><p className={styles.eyebrow}>TU VERSIÓN</p><h2 id="wedding-editor-title">Hazla tuya</h2><p>Prueba el diseño con tus datos. Los cambios solo viven en este navegador; no se guardan ni se publican.</p></div>
        <div className={styles.editorGrid}>
          <label>Nombres<input value={story.names} maxLength={70} onChange={(event) => update("names", event.target.value)} /></label>
          <label>Fecha<input type="date" value={story.date} onChange={(event) => update("date", event.target.value)} /></label>
          <label>Hora de ceremonia<input type="time" value={story.time} onChange={(event) => update("time", event.target.value)} /></label>
          <label>Ceremonia<input value={story.ceremonyName} maxLength={80} onChange={(event) => update("ceremonyName", event.target.value)} /></label>
          <label>Dirección de ceremonia<input value={story.ceremonyAddress} maxLength={140} onChange={(event) => update("ceremonyAddress", event.target.value)} /></label>
          <label>Dirección de recepción<input value={story.receptionAddress} maxLength={140} onChange={(event) => update("receptionAddress", event.target.value)} /></label>
          <label className={styles.editorWide}>Mensaje<textarea value={story.introduction} maxLength={220} rows={3} onChange={(event) => update("introduction", event.target.value)} /></label>
          <label className={styles.editorWide}>Tus fotos para probar la galería<input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => choosePhotos(event.target.files)} /><span>Hasta 4 imágenes de 5 MB. Solo se ven aquí; no se suben ni se guardan.</span></label>
        </div>
        {imageError && <p role="alert" className={styles.imageError}>{imageError}</p>}
        <button type="button" onClick={resetSample} className={styles.resetButton}>Restablecer muestra</button>
      </section>}

      <section className={`${styles.cover} ${opened ? styles.coverOpened : ""}`} aria-labelledby="wedding-cover-title">
        {photos.length ? <Image src={photos[photos.length - 1].src} alt="" fill priority unoptimized={photos[photos.length - 1].src.startsWith("blob:")} sizes="(max-width: 720px) 100vw, 900px" className={styles.coverImage} /> : <div className={styles.coverIllustration} aria-hidden="true"><span>✧</span></div>}
        <div className={styles.coverVeil} />
        <div className={styles.coverGlow} aria-hidden="true" />
        <FloatingHearts className={styles.coverHearts} />
        <div className={styles.coverFrame} aria-hidden="true" />
        <div className={styles.coverContent}>
          <p className={styles.coverTop}>NUESTRA BODA <span aria-hidden="true">✦</span> {weddingDateLabel(story.date).toUpperCase()}</p>
          <div className={styles.seal} aria-hidden="true">{initials[0] || "✦"}{initials[1] && <><span>&</span>{initials[1]}</>}</div>
          <p className={styles.coverLead}>Una historia para celebrar juntos</p>
          <h1 id="wedding-cover-title">{story.names || "Nuestra boda"}</h1>
          <p className={styles.coverDate}>{weddingDateLabel(story.date)}</p>
          <button type="button" onClick={openInvitation} className={styles.openButton}>{opened ? "Volver a la invitación" : "Abrir invitación"}<span aria-hidden="true"> ↗</span></button>
          <p className={styles.coverHint}>Desliza para descubrir nuestra historia</p>
        </div>
      </section>

      <section ref={invitationRef} className={`${styles.letter} ${opened ? styles.letterOpened : ""}`} aria-labelledby="wedding-letter-title">
        <FloatingHearts className={styles.letterHearts} />
        <div className={styles.ornament} aria-hidden="true">✦ ─── ✧ ─── ✦</div>
        <p className={styles.eyebrow}>CON TODO NUESTRO CARIÑO</p>
        <h2 id="wedding-letter-title">El comienzo de un nuevo capítulo</h2>
        <p className={styles.message}>{story.introduction}</p>
        <div className={styles.monogram} aria-hidden="true">{initials.join(" · ") || "✦"}</div>
        <p className={styles.saveDate}>{weddingWeekdayLabel(story.date).toUpperCase()} · {weddingDateLabel(story.date).toUpperCase()}</p>
        <WeddingCountdown date={story.date} time={story.time} />
      </section>

      {story.family && <section className={styles.family} aria-labelledby="wedding-family-title">
        <p className={styles.eyebrow}>CON EL CARIÑO DE NUESTRAS FAMILIAS</p>
        <h2 id="wedding-family-title">Quienes nos acompañan</h2>
        <div className={styles.familyGrid}>
          <div className={styles.familyCard}><span className={styles.familySymbol} aria-hidden="true">E</span><p>Papás de Elizabeth</p>{story.family.brideParents.map((parent) => <strong key={parent}>{parent}</strong>)}</div>
          <div className={styles.familyCard}><span className={styles.familySymbol} aria-hidden="true">A</span><p>Papás de Alonso</p>{story.family.groomParents.map((parent) => <strong key={parent}>{parent}</strong>)}</div>
        </div>
      </section>}

      <section className={styles.details} aria-labelledby="wedding-details-title">
        <p className={styles.eyebrow}>DÓNDE NOS ENCONTRAMOS</p>
        <h2 id="wedding-details-title">Los momentos del día</h2>
        <div className={styles.detailGrid}>
          <article className={styles.detailCard}><span className={styles.cardNumber}>01 / LA CEREMONIA</span><div className={styles.cardIcon} aria-hidden="true">✧</div><h3>{story.ceremonyName}</h3><p className={styles.detailTime}>{weddingTimeLabel(story.time)}</p><p>{story.ceremonyAddress}</p>{story.ceremonyMap && <a href={story.ceremonyMap} target="_blank" rel="noopener noreferrer">Cómo llegar a la ceremonia <span aria-hidden="true">↗</span><span className="sr-only"> (abre Google Maps en otra pestaña)</span></a>}</article>
          <article className={styles.detailCard}><span className={styles.cardNumber}>02 / LA RECEPCIÓN</span><div className={styles.cardIcon} aria-hidden="true">❦</div><h3>{story.receptionName}</h3>{story.receptionTime && <p className={styles.detailTime}>{weddingTimeLabel(story.receptionTime)}</p>}<p>{story.receptionAddress}</p>{story.mealTime && <div className={styles.mealDetail}><span>Comida</span><strong>{weddingTimeLabel(story.mealTime)}</strong></div>}{story.receptionMap && <a href={story.receptionMap} target="_blank" rel="noopener noreferrer">Cómo llegar a la recepción <span aria-hidden="true">↗</span><span className="sr-only"> (abre Google Maps en otra pestaña)</span></a>}</article>
        </div>
      </section>

      {confirmationUrl && <section className={styles.confirmation} aria-labelledby="wedding-confirmation-title">
        <p className={styles.eyebrow}>NOS ENCANTARÁ VERTE</p>
        <h2 id="wedding-confirmation-title">Confirma tu asistencia</h2>
        <p>Cuéntanos si podrás acompañarnos. Puedes escribirle directamente a Elizabeth, la novia.</p>
        {brideConfirmationUrl && <a href={brideConfirmationUrl} target="_blank" rel="noopener noreferrer" className={styles.confirmLink}>Confirmar con Elizabeth <span aria-hidden="true">↗</span><span className="sr-only"> (abre WhatsApp en otra pestaña)</span></a>}
        {story.brideWhatsApp && <p className={styles.confirmNumber}>{story.brideWhatsApp.label}</p>}
        <p className={styles.confirmAlternative}>También puedes confirmar al <a href={confirmationUrl} target="_blank" rel="noopener noreferrer">{story.confirmationWhatsApp?.label}<span className="sr-only"> (abre WhatsApp en otra pestaña)</span></a>.</p>
        <p className={styles.confirmNote}>El mensaje se abrirá para que lo revises y envíes; esta invitación no lo manda automáticamente.</p>
      </section>}

      <section className={styles.gallery} aria-labelledby="wedding-gallery-title">
        <p className={styles.eyebrow}>INSTANTES QUE NOS TRAJERON HASTA AQUÍ</p>
        <h2 id="wedding-gallery-title">Nuestra historia en imágenes</h2>
        {photos.length ? <div className={styles.photoGrid}>{photos.map((photo, index) => <button key={photo.src} type="button" className={styles.photoButton} onClick={() => openPhoto(index)} aria-label={`Ampliar foto ${index + 1}: ${photo.alt}`}><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} unoptimized={photo.src.startsWith("blob:")} sizes="(max-width: 640px) 90vw, 400px" /><span>VER FOTO {String(index + 1).padStart(2, "0")} ↗</span></button>)}</div> : <div className={styles.photoPlaceholders} aria-label="Espacios para fotografías personalizadas"><div><span>01</span><p>Un instante juntos</p></div><div><span>02</span><p>Un recuerdo favorito</p></div><div><span>03</span><p>El comienzo de la historia</p></div></div>}
        {isSample && <p className={styles.galleryNote}>En una invitación real, esta galería se personaliza con fotografías autorizadas por la pareja.</p>}
      </section>

      <footer className={styles.footer}><span aria-hidden="true">✦</span><p>Gracias por acompañarnos en esta historia.</p><strong>{story.names || "Nuestra boda"}</strong><span className={styles.footerDate}>{weddingDateLabel(story.date)}</span>{isSample && <p className={styles.sampleNotice}>Muestra ficticia. No confirma asistencia ni crea un evento real.</p>}</footer>
    </div>

    <div className={styles.musicDock}>
      {audioError && <p role="alert" className={styles.audioError}>{audioError}</p>}
      <button type="button" onClick={toggleAudio} aria-label={playing ? "Pausar música" : "Escuchar música"} aria-pressed={playing} className={`${styles.musicButton} ${playing ? styles.musicActive : ""}`}>
        <span className={styles.musicIcon} aria-hidden="true">♫</span><span>{playing ? "Pausar música" : "Escuchar música"}</span>
      </button>
      <audio ref={audioRef} loop preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}><source src={story.music.src} type={story.music.type} /></audio>
    </div>

    {photos.length > 0 && <dialog ref={dialogRef} className={styles.lightbox} aria-label="Fotografía ampliada" onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close(); }}>
      <div className={styles.lightboxInner}><button type="button" onClick={() => dialogRef.current?.close()} className={styles.lightboxClose} aria-label="Cerrar fotografía">✕</button><Image src={photos[selectedPhoto].src} alt={photos[selectedPhoto].alt} width={photos[selectedPhoto].width} height={photos[selectedPhoto].height} unoptimized={photos[selectedPhoto].src.startsWith("blob:")} sizes="90vw" /><div className={styles.lightboxActions}><button type="button" onClick={() => setSelectedPhoto((selectedPhoto - 1 + photos.length) % photos.length)}>← Anterior</button><span>{selectedPhoto + 1} / {photos.length}</span><button type="button" onClick={() => setSelectedPhoto((selectedPhoto + 1) % photos.length)}>Siguiente →</button></div></div>
    </dialog>}
  </main>;
}
