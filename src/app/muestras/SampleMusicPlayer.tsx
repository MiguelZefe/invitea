"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { SampleEventType } from "./SimpleDemo";
import { parseMusicProviderLink, type MusicProviderPreview } from "./music-links";
import { recommendedSampleTrack, sampleAudioError, sampleTracks } from "./sample-music";

const subscribeToClient = () => () => {};

export default function SampleMusicPlayer({ eventType }: { eventType: SampleEventType }) {
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const recommended = sampleTracks.find((track) => track.id === recommendedSampleTrack[eventType]) ?? sampleTracks[0];
  const [source, setSource] = useState<string | null>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const [localName, setLocalName] = useState("");
  const [providerInput, setProviderInput] = useState("");
  const [providerPreview, setProviderPreview] = useState<MusicProviderPreview | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const hasOrderBar = eventType === "Cumpleaños" || eventType === "Bautizo";
  const localUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedSource = source ?? recommended.src;
  const selectedId = selection ?? recommended.id;

  useEffect(() => () => {
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
  }, []);

  function clearLocalAudio() {
    audioRef.current?.pause();
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    localUrlRef.current = null;
    setLocalName("");
    setPlaying(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectTrack(id: string) {
    const track = sampleTracks.find((item) => item.id === id);
    if (!track) return;
    clearLocalAudio();
    setProviderPreview(null);
    setSelection(track.id);
    setSource(track.src);
    setError("");
  }

  function selectFile(file?: File) {
    if (!file) return;
    const validationError = sampleAudioError(file);
    if (validationError) {
      setError(validationError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    clearLocalAudio();
    const url = URL.createObjectURL(file);
    localUrlRef.current = url;
    setProviderPreview(null);
    setSource(url);
    setSelection("local");
    setLocalName(file.name);
    setError("");
  }

  function showProvider() {
    const preview = parseMusicProviderLink(providerInput);
    if (!preview) {
      setProviderPreview(null);
      setError("Pega un enlace válido de Spotify o YouTube Music (canción o lista).");
      return;
    }
    audioRef.current?.pause();
    setPlaying(false);
    setProviderPreview(preview);
    setError("");
  }

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
      setError("");
    } catch {
      setError("El navegador no pudo reproducir este audio. Prueba otra melodía o archivo.");
    }
  }

  return <>
  <fieldset className="mt-5 rounded-2xl border border-current/15 bg-white/65 p-5">
    <legend className="px-1 text-sm font-semibold">Música de fondo para tu muestra</legend>
    <p className="mt-1 text-xs leading-relaxed opacity-70">Elige una de tres melodías originales o prueba tu archivo. La música empezará al pulsar «Ver prueba final»; también puedes escucharla ahora y pausarla con el control flotante.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {sampleTracks.map((track) => <button key={track.id} type="button" aria-pressed={selectedId === track.id && !providerPreview} onClick={() => selectTrack(track.id)} className={`min-h-16 rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${selectedId === track.id && !providerPreview ? "border-current bg-[#f5ebe2] font-semibold" : "border-current/20 bg-white"}`}>
        <span className="block text-sm">♫ {track.label}{recommended.id === track.id && <span className="ml-1 text-[10px] font-normal opacity-65">· sugerida</span>}</span><span className="mt-1 block text-xs font-normal opacity-65">{track.detail}</span>
      </button>)}
    </div>
    {!providerPreview && <audio key={selectedSource} id="sample-background-audio" ref={audioRef} controls loop preload="none" src={selectedSource} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setError("Este audio no se pudo reproducir en el navegador.")} className="mt-4 w-full" aria-label={selectedId === "local" ? `Escuchar ${localName}` : `Escuchar ${sampleTracks.find((track) => track.id === selectedId)?.label ?? "música de ejemplo"}`} />}
    <label htmlFor="sample-music-file" className="mt-4 block text-sm font-semibold">O prueba tu propia canción en esta vista
      <input ref={inputRef} id="sample-music-file" type="file" accept=".mp3,.wav,.ogg,.m4a,.webm,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm" onChange={(event) => selectFile(event.target.files?.[0])} className="mt-2 block min-h-11 w-full rounded-xl border border-current/20 bg-white p-2 text-sm file:mr-3 file:min-h-8 file:rounded-full file:border-0 file:bg-[#76483d] file:px-3 file:text-white focus-visible:outline-2 focus-visible:outline-offset-2" />
    </label>
    <p className="mt-2 text-xs leading-relaxed opacity-65">MP3, WAV, OGG, M4A o WebM · máximo 15 MB. Tu archivo solo se escucha en este navegador: no se guarda, envía ni publica. Usa música que tengas derecho a compartir.</p>
    {selectedId === "local" && <p className="mt-2 text-xs font-semibold">Audio local: {localName}</p>}
    <div className="mt-5 border-t border-current/10 pt-5">
      <label htmlFor="sample-provider-link" className="block text-sm font-semibold">O pega una canción o lista de Spotify o YouTube Music</label>
      <p className="mt-1 text-xs leading-relaxed opacity-70">Se abrirá el reproductor oficial en esta página solo si pulsas Mostrar reproductor. El proveedor recibirá la solicitud al cargarlo; puede limitar la reproducción según la canción, tu sesión o el navegador.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input id="sample-provider-link" type="url" value={providerInput} onChange={(event) => setProviderInput(event.target.value)} placeholder="https://open.spotify.com/track/… o https://music.youtube.com/watch?v=…" autoComplete="off" maxLength={2048} className="min-h-11 min-w-0 flex-1 rounded-xl border border-current/20 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2" />
        <button type="button" onClick={showProvider} className="min-h-11 rounded-xl bg-[#302b3b] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2">Mostrar reproductor</button>
      </div>
      {providerPreview && <div className="mt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm"><strong>Reproductor de {providerPreview.provider}</strong><button type="button" onClick={() => setProviderPreview(null)} className="min-h-10 rounded-full border border-current/25 px-3 py-1 focus-visible:outline-2 focus-visible:outline-offset-2">Quitar reproductor</button></div>
        <iframe title={`Reproductor de ${providerPreview.provider}`} src={providerPreview.embedUrl} loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" className={`w-full rounded-xl border-0 ${providerPreview.provider === "Spotify" ? "h-[160px]" : "aspect-video min-h-[200px]"}`} />
        <a href={providerPreview.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold underline underline-offset-2">Abrir en {providerPreview.provider}<span className="sr-only"> (abre otra pestaña)</span></a>
      </div>}
    </div>
    {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-800">{error}</p>}
    <p className="mt-3 text-xs opacity-65">La música y los enlaces son una demostración local: no se guardan ni publican. Su inclusión en un pedido se acuerda por separado.</p>
  </fieldset>
  {isClient && !providerPreview && createPortal(<button type="button" onClick={togglePlayback} aria-controls="sample-background-audio" aria-pressed={playing} aria-label={playing ? "Pausar música de fondo" : "Escuchar música de fondo"} title={playing ? "Pausar música" : "Escuchar música"} className={`fixed right-0 z-30 flex min-h-11 w-10 items-center justify-center rounded-full border border-white/30 bg-[#302b3b] p-0 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#302b3b] sm:bottom-5 sm:right-5 sm:w-auto sm:px-4 sm:py-2 ${hasOrderBar ? "bottom-28" : "bottom-5"}`}><span aria-hidden="true">♫</span><span className="hidden sm:inline">&nbsp;{playing ? "Pausar" : "Escuchar"}</span></button>, document.body)}
  </>;
}
