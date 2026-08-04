/*
Las fechas de evento viajan y se guardan como "hora de pared" de Chile SIN zona
("YYYY-MM-DDTHH:mm", tal cual lo tipeó el admin en el <input type="datetime-local">):
lib/db/transform.ts las escribe agregándoles una Z, así que en la BD el instante es la hora Chile
leída como UTC.

Para comparar contra "ahora" hay que llevar los dos lados al mismo espacio:
  - las fechas de evento se parsean como UTC (parseEventDate)
  - "ahora" se convierte a la hora de pared de Chile y también se lee como UTC (nowInChile)

Comparar con `new Date()` crudo hace que un evento se dé por vencido 3-4 horas antes de tiempo en
un servidor en UTC (Vercel/Cloudflare) — y `pruneExpiredEvents` los borra de verdad.
*/

export const CHILE_TIME_ZONE = "America/Santiago";

export const GRACE_PERIOD_MS = (Number(process.env.NEXT_PUBLIC_EVENTS_GRACE_PERIOD) || 86400) * 1000;

const chileParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: CHILE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// Hora de pared de Chile (respeta el horario de verano vía Intl) expresada como UTC, para poder
// compararla con las fechas de evento. NO es el instante real: es "qué hora es en Chile".
export function nowInChile(instant: Date = new Date()): Date {
  const parts: Record<string, string> = {};
  for (const part of chileParts.formatToParts(instant)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  return new Date(
    Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      // Algunos motores devuelven "24" para la medianoche con hour12: false.
      Number(parts.hour) % 24,
      Number(parts.minute),
      Number(parts.second),
    ),
  );
}

// Una fecha sin zona es hora Chile: se lee como UTC para quedar en el mismo espacio que nowInChile.
// Si ya trae zona (formato ISO completo), se respeta.
export function parseEventDate(value: string): Date {
  return new Date(/([zZ]|[+-]\d\d:?\d\d)$/.test(value) ? value : `${value}Z`);
}

export function formatRelativeTime(targetDate: string, now = nowInChile()): string {
  const target = parseEventDate(targetDate);
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44);
  const years = Math.floor(days / 365.25);

  const prefix = isPast ? "Hace" : "En";

  if (years >= 1) return `${prefix} ${years} ${years === 1 ? "año" : "años"}`;
  if (months >= 1) return `${prefix} ${months} ${months === 1 ? "mes" : "meses"}`;
  if (days >= 1) return `${prefix} ${days} ${days === 1 ? "día" : "días"}`;
  if (hours >= 1) return `${prefix} ${hours} ${hours === 1 ? "hora" : "horas"}`;
  if (minutes >= 1) return `${prefix} ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;

  return "Ahora";
}

export function formatEventTag(
  startDate: string,
  endDate: string,
  now = nowInChile(),
  gracePeriodMs = GRACE_PERIOD_MS,
): string {
  const start = parseEventDate(startDate);
  const end = parseEventDate(endDate);

  if (now >= start && now <= end) {
    return "En curso";
  }

  if (now > end) {
    const elapsed = now.getTime() - end.getTime();
    if (elapsed <= gracePeriodMs) {
      return formatRelativeTime(endDate, now);
    }
    return "";
  }

  return formatRelativeTime(startDate, now);
}
