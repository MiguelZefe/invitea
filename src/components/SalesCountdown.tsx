"use client";

import { useEffect, useState } from "react";

const SAMPLE_TARGET = new Date("2026-12-12T16:00:00-06:00").getTime();
type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(): Remaining {
  const total = Math.max(0, SAMPLE_TARGET - Date.now());
  const seconds = Math.floor(total / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
  };
}

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

export default function SalesCountdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const values: Array<[string, number | string]> = remaining
    ? [["Días", remaining.days], ["Horas", remaining.hours], ["Min", remaining.minutes], ["Seg", remaining.seconds]]
    : [["Días", "—"], ["Horas", "—"], ["Min", "—"], ["Seg", "—"]];

  return (
    <section className="mt-7 rounded-2xl border border-neutral-200 bg-white/70 p-5" aria-label="Cuenta regresiva de muestra">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.17em] text-neutral-500">
        <span className="h-2 w-2 rounded-full bg-black motion-safe:animate-pulse" aria-hidden="true" />
        Cuenta regresiva de la muestra ficticia
      </div>
      <p className="mt-2 text-sm text-neutral-600">Cumpleaños de Sofía · 12 de diciembre de 2026</p>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {values.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-[#f8f5f2] px-2 py-3">
            <p className="text-xl font-semibold tabular-nums">{typeof value === "number" && label !== "Días" ? twoDigits(value) : value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-neutral-500">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-500">Es una animación de demostración; no es una fecha límite de compra.</p>
    </section>
  );
}
