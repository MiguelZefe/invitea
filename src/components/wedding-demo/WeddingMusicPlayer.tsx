"use client";

import { useRef, useState } from "react";

type WeddingMusicPlayerProps = {
  musicUrl: string | null;
  theme?: "wedding" | "baby";
};

export default function WeddingMusicPlayer({
  musicUrl,
  theme = "wedding",
}: WeddingMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!musicUrl) {
    return null;
  }

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
        <source src={musicUrl} type="audio/mpeg" />
      </audio>

      <button
        type="button"
        onClick={toggleMusic}
        className={`rounded-full px-5 py-4 text-sm text-white shadow-xl transition hover:opacity-90 ${
          theme === "baby" ? "bg-[#746072]" : "bg-black"
        }`}
      >
        {isPlaying ? "Pausar música" : "Reproducir música"}
      </button>
    </div>
  );
}
