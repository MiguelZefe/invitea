// Reproducible, dependency-free original instrumental loops for the public sample player.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sampleRate = 22050;
const songs = [
  { file: "sample-brisa.wav", bpm: 112, chords: [[60, 64, 67], [57, 60, 64], [65, 69, 72], [67, 71, 74]], melody: [72, 76, 79, 76, 69, 72, 76, 72, 77, 81, 79, 77, 74, 79, 76, 72], wave: "bell" },
  { file: "sample-jardin.wav", bpm: 82, chords: [[55, 59, 62], [52, 55, 59], [53, 57, 60], [50, 53, 57]], melody: [74, 71, 69, 67, 71, 69, 67, 64, 72, 69, 67, 65, 69, 65, 62, 67], wave: "soft" },
  { file: "sample-luces.wav", bpm: 96, chords: [[53, 57, 60], [50, 53, 57], [58, 62, 65], [55, 58, 62]], melody: [77, 81, 84, 81, 76, 79, 81, 79, 74, 77, 81, 77, 79, 77, 74, 72], wave: "glass" },
];

function frequency(midi) { return 440 * 2 ** ((midi - 69) / 12); }

function render(song) {
  const beat = 60 / song.bpm;
  const seconds = beat * 32;
  const samples = new Float32Array(Math.ceil(seconds * sampleRate));
  function note(midi, start, duration, gain, timbre) {
    const frequencyHz = frequency(midi);
    const first = Math.floor(start * sampleRate);
    const last = Math.min(samples.length, Math.floor((start + duration) * sampleRate));
    for (let i = first; i < last; i++) {
      const age = (i - first) / sampleRate;
      const attack = Math.min(1, age / (timbre === "pad" ? .18 : .018));
      const release = Math.min(1, (duration - age) / (timbre === "pad" ? .35 : .12));
      const decay = timbre === "pad" ? 1 : Math.exp(-age * (timbre === "glass" ? 1.8 : 2.6));
      const phase = 2 * Math.PI * frequencyHz * age;
      const overtone = timbre === "soft" ? .14 : timbre === "pad" ? .08 : .28;
      const sound = Math.sin(phase) + overtone * Math.sin(2 * phase) + (timbre === "glass" ? .13 * Math.sin(3 * phase) : 0);
      samples[i] += sound * gain * Math.max(0, attack) * Math.max(0, release) * decay;
    }
  }
  for (let bar = 0; bar < 8; bar++) {
    const chord = song.chords[bar % song.chords.length];
    const barStart = bar * 4 * beat;
    for (const pitch of chord) note(pitch, barStart, 3.92 * beat, .08, "pad");
    note(chord[0] - 12, barStart, 1.8 * beat, .18, "soft");
    note(chord[0] - 12, barStart + 2 * beat, 1.7 * beat, .13, "soft");
    for (let step = 0; step < 4; step++) {
      note(song.melody[(bar * 4 + step) % song.melody.length], barStart + step * beat, .9 * beat, .23, song.wave);
      note(chord[(step + bar) % 3] + 12, barStart + (step + .5) * beat, .42 * beat, .08, "bell");
    }
  }
  const pcm = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    const edge = Math.min(1, i / (sampleRate * .15), (samples.length - i) / (sampleRate * .25));
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i] * edge)) * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

await mkdir(resolve(root, "public/music"), { recursive: true });
for (const song of songs) {
  const file = resolve(root, "public/music", song.file);
  const wav = render(song);
  await writeFile(file, wav);
  console.log(`${song.file}: ${(wav.length / 1024).toFixed(0)} KiB`);
}
