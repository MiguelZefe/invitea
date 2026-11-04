export const sampleTracks = [
  { id: "days-of-change", label: "Days of Change", detail: "1:14 min", src: "/music/bensound-daysofchange.mp3" },
  { id: "no-hip-no-hop", label: "No Hip No Hop", detail: "1:58 min", src: "/music/bensound-nohipnohop.mp3" },
  { id: "mi-corazon-encantado", label: "Mi corazón encantado", detail: "2:50 min", src: "/music/mi-corazon-encantado.mp3" },
  { id: "urban", label: "Urban", detail: "0:45 min", src: "/music/tunetank-2090-urban.mp3" },
  { id: "tennessee-morning", label: "Tennessee Morning", detail: "0:45 min", src: "/music/tunetank-6580-tennessee-morning.mp3" },
] as const;

export const recommendedSampleTrack = {
  "Cumpleaños": "no-hip-no-hop",
  "Bautizo": "tennessee-morning",
  "Baby shower": "days-of-change",
  "Boda": "mi-corazon-encantado",
  "XV años": "urban",
  "Primera comunión": "tennessee-morning",
  "Graduación": "urban",
  "Aniversario": "days-of-change",
} as const;

const allowedAudioTypes = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav", "audio/vnd.wave", "audio/ogg", "audio/mp4", "audio/x-m4a", "audio/webm"]);
export const maxSampleAudioBytes = 15 * 1024 * 1024;

export function sampleAudioError(file: Pick<File, "type" | "size">): string | null {
  if (!allowedAudioTypes.has(file.type)) return "Usa un archivo MP3, WAV, OGG, M4A o WebM de audio.";
  if (file.size > maxSampleAudioBytes) return "El audio debe pesar 15 MB o menos.";
  if (file.size === 0) return "El archivo de audio está vacío.";
  return null;
}
