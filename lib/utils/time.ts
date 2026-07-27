export function formatRelativeTime(targetDate: string, now = new Date()): string {
  const target = new Date(targetDate);
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

const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

export function formatEventTag(
  startDate: string,
  endDate: string,
  now = new Date(),
  gracePeriodMs = GRACE_PERIOD_MS,
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

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
