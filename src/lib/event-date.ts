export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
};

const SPANISH_MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

function normalizeSpanishText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTime(value?: string | null): [number, number] | null {
  if (!value?.trim()) {
    return null;
  }

  const match = normalizeSpanishText(value).match(
    /(?:^|\s)(\d{1,2})(?::(\d{2}))?\s*(a\.?\s*m\.?|p\.?\s*m\.?|h(?:oras?)?)?(?:\s|$)/
  );

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const period = match[3]?.replace(/[.\s]/g, "");

  if (minutes > 59) {
    return null;
  }

  if (period === "am" || period === "pm") {
    if (hours < 1 || hours > 12) {
      return null;
    }

    if (period === "am") {
      hours %= 12;
    } else if (hours !== 12) {
      hours += 12;
    }
  } else if (hours > 23) {
    return null;
  }

  return [hours, minutes];
}

function createLocalDate(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number
) {
  const date = new Date(year, month, day, hours, minutes, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes
  ) {
    return null;
  }

  return date;
}

export function parseEventDateTime(
  dateValue: string,
  timeValue?: string | null
): Date | null {
  const normalizedDate = normalizeSpanishText(dateValue);
  const isoMatch = normalizedDate.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[t ](\d{2}):(\d{2})(?::\d{2})?)?$/
  );

  if (isoMatch) {
    const explicitTime = parseTime(timeValue);
    const hours = explicitTime?.[0] ?? Number(isoMatch[4] ?? 0);
    const minutes = explicitTime?.[1] ?? Number(isoMatch[5] ?? 0);

    return createLocalDate(
      Number(isoMatch[1]),
      Number(isoMatch[2]) - 1,
      Number(isoMatch[3]),
      hours,
      minutes
    );
  }

  const spanishMatch = normalizedDate.match(
    /(?:^|\s)(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})(?:\s|$)/
  );

  if (!spanishMatch) {
    return null;
  }

  const time = parseTime(timeValue) ?? [0, 0];

  return createLocalDate(
    Number(spanishMatch[3]),
    SPANISH_MONTHS[spanishMatch[2]],
    Number(spanishMatch[1]),
    time[0],
    time[1]
  );
}

export function getCountdownParts(
  targetDate: Date,
  currentDate = new Date()
): CountdownParts {
  const remainingMilliseconds = Math.max(
    0,
    targetDate.getTime() - currentDate.getTime()
  );
  const totalSeconds = Math.floor(remainingMilliseconds / 1000);

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    isComplete: remainingMilliseconds === 0,
  };
}
