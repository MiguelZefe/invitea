"use client";

import { useEffect, useRef, useState } from "react";
import { sampleAudioError, sampleTracks } from "./sample-music";

export default function SampleMusicPlayer() {
  const [source, setSource] = useState<string>(sampleTracks[0].src);
  const [selection, setSelection] = useState<string>(sampleTracks[0].id);
  const [localName, setLocalName] = useState("");
  const [error, setError] = useState("");
  const localUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
  }, []);

  function clearLocalAudio() {
    audioRef.current?.pause();
    if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    localUrlRef.current = null;
    setLocalName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectTrack(id: string) {
    const track = sampleTracks.find((item) => item.id === id);
    if (!track) return;
    clearLocalAudio();
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
    setSource(url);
    setSelection("local");
    setLocalName(file.name);
    setError("");
  }

  return <fieldset className="mt-5 rounded-2xl border border-current/15 bg-white/65 p-5">
    <legend className="px-1 text-sm font-semibold">Música para imaginar tu invitación</legend>
    <p className="mt-1 text-xs leading-relaxed opacity-70">Tres melodías originales de demostración. Escúchalas cuando quieras; no se reproducen automáticamente.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      {sampleTracks.map((track) => <button key={track.id} type="button" aria-pressed={selection === track.id} onClick={() => selectTrack(track.id)} className={`min-h-16 rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${selection === track.id ? "border-current bg-[#f5ebe2] font-semibold" : "border-current/20 bg-white"}`}>
        <span className="block text-sm">♫ {track.label}</span><span className="mt-1 block text-xs font-normal opacity-65">{track.detail}</span>
      </button>)}
    </div>
    <audio key={source} ref={audioRef} controls loop preload="none" src={source} onError={() => setError("Este audio no se pudo reproducir en el navegador.")} className="mt-4 w-full" aria-label={selection === "local" ? `Escuchar ${localName}` : `Escuchar ${sampleTracks.find((track) => track.id === selection)?.label ?? "música de ejemplo"}`} />
    <label htmlFor="sample-music-file" className="mt-4 block text-sm font-semibold">O prueba tu propia canción en esta vista
      <input ref={inputRef} id="sample-music-file" type="file" accept=".mp3,.wav,.ogg,.m4a,.webm,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm" onChange={(event) => selectFile(event.target.files?.[0])} className="mt-2 block min-h-11 w-full rounded-xl border border-current/20 bg-white p-2 text-sm file:mr-3 file:min-h-8 file:rounded-full file:border-0 file:bg-[#76483d] file:px-3 file:text-white focus-visible:outline-2 focus-visible:outline-offset-2" />
    </label>
    <p className="mt-2 text-xs leading-relaxed opacity-65">MP3, WAV, OGG, M4A o WebM · máximo 15 MB. Tu archivo solo se escucha en este navegador: no se guarda, envía ni publica. Usa música que tengas derecho a compartir.</p>
    {selection === "local" && <p className="mt-2 text-xs font-semibold">Audio local: {localName}</p>}
    {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-800">{error}</p>}
    <p className="mt-2 text-xs opacity-65">La música es una demostración; su inclusión en un pedido se acuerda por separado.</p>
  </fieldset>;
}
