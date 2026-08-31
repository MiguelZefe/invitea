"use client";

import { useEffect, useRef, useState } from "react";

type BabyVoiceMessageProps = {
  audioUrl: string;
  storageKey: string;
};

export default function BabyVoiceMessage({
  audioUrl,
  storageKey,
}: BabyVoiceMessageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoPlayAttemptedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || autoPlayAttemptedRef.current) {
      return;
    }

    autoPlayAttemptedRef.current = true;

    const sessionKey = `zefeinvita:voice-message:${storageKey}`;

    try {
      if (window.sessionStorage.getItem(sessionKey) === "played") {
        return;
      }
    } catch {
      // The invitation still works when browser storage is unavailable.
    }

    let disposed = false;

    const removeInteractionListeners = () => {
      window.removeEventListener("pointerdown", startAfterInteraction);
      window.removeEventListener("keydown", startAfterInteraction);
    };

    const attemptPlayback = async () => {
      try {
        await audio.play();

        if (!disposed) {
          setIsPlaying(true);
          removeInteractionListeners();
        }
      } catch {
        // Browsers commonly require a first interaction before playing sound.
      }
    };

    function startAfterInteraction(event: Event) {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-voice-control]")
      ) {
        return;
      }

      void attemptPlayback();
    }

    window.addEventListener("pointerdown", startAfterInteraction);
    window.addEventListener("keydown", startAfterInteraction);
    void attemptPlayback();

    return () => {
      disposed = true;
      removeInteractionListeners();
    };
  }, [storageKey]);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!audio.paused) {
      audio.pause();
      return;
    }

    if (hasEnded) {
      audio.currentTime = 0;
      setHasEnded(false);
    }

    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const buttonLabel = isPlaying
    ? "Pausar mensaje"
    : hasEnded
      ? "Repetir mensaje"
      : "Escuchar mensaje";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => {
          try {
            window.sessionStorage.setItem(
              `zefeinvita:voice-message:${storageKey}`,
              "played"
            );
          } catch {
            // Playback should not depend on browser storage permissions.
          }

          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setHasEnded(true);
        }}
      >
        <source src={audioUrl} type="audio/mpeg" />
      </audio>

      <button
        type="button"
        onClick={togglePlayback}
        data-voice-control
        className="rounded-full bg-[#746072] px-5 py-4 text-sm text-white shadow-xl transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#746072]"
        aria-label={buttonLabel}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
