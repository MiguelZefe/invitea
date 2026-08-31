"use client";

import styles from "@/components/EventCountdown.module.css";
import {
  getCountdownParts,
  parseEventDateTime,
  type CountdownParts,
} from "@/lib/event-date";
import { useEffect, useMemo, useState } from "react";

type EventCountdownProps = {
  date: string;
  time?: string | null;
  theme?: "wedding" | "baby";
};

const COUNTDOWN_UNITS: Array<{
  key: Exclude<keyof CountdownParts, "isComplete">;
  label: string;
}> = [
  { key: "days", label: "Días" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Seg" },
];

export default function EventCountdown({
  date,
  time,
  theme = "wedding",
}: EventCountdownProps) {
  const targetDate = useMemo(() => parseEventDateTime(date, time), [date, time]);
  const [remaining, setRemaining] = useState<CountdownParts | null>(null);

  useEffect(() => {
    if (!targetDate) {
      return;
    }

    const updateCountdown = () => {
      setRemaining(getCountdownParts(targetDate));
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1_000);

    return () => window.clearInterval(intervalId);
  }, [targetDate]);

  if (!targetDate) {
    return null;
  }

  if (remaining?.isComplete) {
    return (
      <p role="status" className={`${styles.complete} ${theme === "baby" ? styles.baby : ""}`}>
        ¡El gran día llegó! ✨
      </p>
    );
  }

  const accessibleLabel = remaining
    ? `Faltan ${remaining.days} días, ${remaining.hours} horas, ${remaining.minutes} minutos y ${remaining.seconds} segundos`
    : "Calculando el tiempo restante";

  return (
    <div
      role="timer"
      aria-label={accessibleLabel}
      className={`${styles.countdown} ${theme === "baby" ? styles.baby : ""}`}
    >
      {COUNTDOWN_UNITS.map(({ key, label }) => (
        <div key={key} aria-hidden="true" className={styles.unit}>
          <span className={styles.value}>
            {remaining ? String(remaining[key]).padStart(2, "0") : "--"}
          </span>
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
}
