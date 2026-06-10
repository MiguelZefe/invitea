"use client";

import { useRef, useState } from "react";

export default function WeddingMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    await audioRef.current.play();
    setIsPlaying(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <audio ref={audioRef} loop>
        <source src="/music/demo-wedding.mp3" type="audio/mpeg" />
      </audio>

      <button
        type="button"
        onClick={toggleMusic}
        className="rounded-full bg-black px-5 py-4 text-sm text-white shadow-xl transition hover:opacity-90"
      >
        {isPlaying ? "Pausar música" : "Reproducir música"}
      </button>
    </div>
  );
}