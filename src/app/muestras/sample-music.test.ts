import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import SampleMusicPlayer from "./SampleMusicPlayer";
import { maxSampleAudioBytes, recommendedSampleTrack, sampleAudioError, sampleTracks } from "./sample-music";

it("provides three locally hosted, playable original sample files", () => {
  expect(sampleTracks).toHaveLength(3);
  for (const track of sampleTracks) {
    expect(track.src).toMatch(/^\/music\/sample-[a-z]+\.wav$/);
    const wav = readFileSync(join(process.cwd(), "public", track.src.slice(1)));
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
    expect(wav.length).toBeGreaterThan(44);
  }
  const html = renderToStaticMarkup(createElement(SampleMusicPlayer, { eventType: "Cumpleaños" }));
  expect(html).toContain('preload="none"');
  expect(html).toContain('src="/music/sample-brisa.wav"');
  expect(html).toContain("no se guarda, envía ni publica");
  expect(html).toContain("Mostrar reproductor");
  expect(html).toContain('id="sample-background-audio"');
  expect(html).not.toContain("<iframe");
  expect(html).not.toContain('src="https://');
});

it("suggests a fitting locally hosted melody for all eight event types", () => {
  expect(Object.keys(recommendedSampleTrack)).toHaveLength(8);
  for (const [eventType, trackId] of Object.entries(recommendedSampleTrack)) {
    const track = sampleTracks.find((item) => item.id === trackId);
    expect(track, eventType).toBeTruthy();
    const html = renderToStaticMarkup(createElement(SampleMusicPlayer, { eventType: eventType as keyof typeof recommendedSampleTrack }));
    expect(html, eventType).toContain(`src="${track!.src}"`);
  }
});

it("rejects unsupported, empty and oversized local audio", () => {
  expect(sampleAudioError({ type: "audio/mpeg", size: 1024 })).toBeNull();
  expect(sampleAudioError({ type: "audio/x-m4a", size: 1024 })).toBeNull();
  expect(sampleAudioError({ type: "image/png", size: 1024 })).toMatch(/MP3/);
  expect(sampleAudioError({ type: "audio/wav", size: 0 })).toMatch(/vacío/);
  expect(sampleAudioError({ type: "audio/ogg", size: maxSampleAudioBytes + 1 })).toMatch(/15 MB/);
});
