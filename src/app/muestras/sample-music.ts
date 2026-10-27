export const sampleTracks = [
  { id: "brisa", label: "Brisa de fiesta", detail: "Alegre y luminosa", src: "/music/sample-brisa.wav" },
  { id: "jardin", label: "Jardín sereno", detail: "Suave y cálida", src: "/music/sample-jardin.wav" },
  { id: "luces", label: "Vals de luces", detail: "Romántica y delicada", src: "/music/sample-luces.wav" },
] as const;

export const recommendedSampleTrack = {
  "Cumpleaños": "brisa",
  "Bautizo": "jardin",
  "Baby shower": "jardin",
  "Boda": "luces",
  "XV años": "luces",
  "Primera comunión": "jardin",
  "Graduación": "brisa",
  "Aniversario": "luces",
} as const;

const allowedAudioTypes = new Set(["audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav", "audio/vnd.wave", "audio/ogg", "audio/mp4", "audio/x-m4a", "audio/webm"]);
export const maxSampleAudioBytes = 15 * 1024 * 1024;

export function sampleAudioError(file: Pick<File, "type" | "size">): string | null {
  if (!allowedAudioTypes.has(file.type)) return "Usa un archivo MP3, WAV, OGG, M4A o WebM de audio.";
  if (file.size > maxSampleAudioBytes) return "El audio debe pesar 15 MB o menos.";
  if (file.size === 0) return "El archivo de audio está vacío.";
  return null;
}
