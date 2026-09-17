import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import BabyVoiceMessage from "@/components/baby-shower/BabyVoiceMessage";

const harness = vi.hoisted(() => ({
  audio: null as unknown,
  effects: [] as Array<() => void | (() => void)>,
}));

vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useRef: () => ({ current: harness.audio }),
  useState: (initial: unknown) => [initial, vi.fn()],
  useEffect: (effect: () => void | (() => void)) => harness.effects.push(effect),
}));

class AudioDouble extends EventTarget {
  paused = true;
  play = vi.fn(async () => {
    this.paused = false;
    this.dispatchEvent(new Event("play"));
  });
}

let audio: AudioDouble;
let browserWindow: EventTarget & { sessionStorage: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void } };

beforeEach(() => {
  const storage = new Map<string, string>();
  browserWindow = Object.assign(new EventTarget(), {
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    },
  });
  vi.stubGlobal("window", browserWindow);
  vi.stubGlobal("Element", class {});
  audio = new AudioDouble();
  harness.audio = audio;
  harness.effects = [];
});

afterEach(() => vi.unstubAllGlobals());

function mount() {
  const view = BabyVoiceMessage({ audioUrl: "/test.mp3", storageKey: "test-only" });
  const element = (view.props.children as ReactElement<{ onPlay: () => void }>[])[0];
  audio.addEventListener("play", element.props.onPlay);
  return harness.effects[0];
}

describe("voice message playback lifecycle", () => {
  it("can retry after a Strict Mode cleanup when autoplay was blocked", async () => {
    audio.play.mockRejectedValue(new Error("Autoplay blocked"));
    const setup = mount();
    const firstCleanup = setup();
    firstCleanup?.();
    const finalCleanup = setup();
    await Promise.resolve();
    browserWindow.dispatchEvent(new Event("pointerdown"));
    expect(audio.play).toHaveBeenCalledTimes(3);
    finalCleanup?.();
  });

  it("does not restart a manually paused message on a later page interaction", async () => {
    audio.play.mockRejectedValueOnce(new Error("Autoplay blocked"));
    const cleanup = mount()();
    await Promise.resolve();
    await audio.play();
    audio.paused = true;
    browserWindow.dispatchEvent(new Event("pointerdown"));
    browserWindow.dispatchEvent(new Event("keydown"));
    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(audio.paused).toBe(true);
    cleanup?.();
  });

  it("does not autoplay again when the same session already played the message", () => {
    browserWindow.sessionStorage.setItem("zefeinvita:voice-message:test-only", "played");
    const cleanup = mount()();
    browserWindow.dispatchEvent(new Event("pointerdown"));
    expect(audio.play).not.toHaveBeenCalled();
    cleanup?.();
  });

  it("removes interaction listeners when the player is unmounted", async () => {
    audio.play.mockRejectedValue(new Error("Autoplay blocked"));
    const cleanup = mount()();
    await Promise.resolve();
    cleanup?.();
    browserWindow.dispatchEvent(new Event("pointerdown"));
    expect(audio.play).toHaveBeenCalledTimes(1);
  });
});
