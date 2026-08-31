"use client";

import styles from "@/components/baby-shower/BabyVoiceMessage.module.css";
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
    <div className={`${styles.player} ${isPlaying ? styles.playing : ""}`}>
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
        className={styles.button}
        aria-label={buttonLabel}
      >
        <span aria-hidden="true" className={styles.note}>♪</span>
        <span>{buttonLabel}</span>
        <span aria-hidden="true" className={styles.bars}>
          <span />
          <span />
          <span />
        </span>
      </button>
    </div>
  );
}
