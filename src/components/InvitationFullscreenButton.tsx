"use client";

import { useState, useSyncExternalStore } from "react";

function subscribe(notify: () => void) {
  document.addEventListener("fullscreenchange", notify);
  return () => document.removeEventListener("fullscreenchange", notify);
}

function getMode() {
  if (!document.fullscreenEnabled || !document.documentElement.requestFullscreen) return "unavailable";
  return document.fullscreenElement === document.documentElement ? "full" : "window";
}

function getServerMode() {
  return "unavailable";
}

export function exitInvitationFullscreen() {
  if (typeof document !== "undefined" && document.fullscreenElement && document.fullscreenElement === document.documentElement) {
    return document.exitFullscreen();
  }
}

export default function InvitationFullscreenButton({ className }: { className: string }) {
  const mode = useSyncExternalStore(subscribe, getMode, getServerMode);
  const [error, setError] = useState(false);

  if (mode === "unavailable") return null;

  async function toggleFullscreen() {
    setError(false);
    try {
      if (mode === "full") {
        await exitInvitationFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setError(true);
    }
  }

  return <div className="relative">
    <button type="button" onClick={toggleFullscreen} aria-label={mode === "full" ? "Salir de pantalla completa" : undefined} className={className}>
      {mode === "full" ? "Salir de pantalla" : "Pantalla completa"}
    </button>
    {error && <span role="status" className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white p-2 text-xs text-slate-800 shadow-lg">El navegador no pudo ocultar sus barras.</span>}
  </div>;
}
