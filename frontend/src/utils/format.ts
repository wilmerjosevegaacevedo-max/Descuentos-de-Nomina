export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatRelativeTime(date?: Date | null): string {
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.round(diffMs / 1000);

  if (diffSeconds < 5) return "Justo ahora";
  if (diffSeconds < 60) return `Hace ${diffSeconds} s`;

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.round(diffHours / 24);
  return `Hace ${diffDays} d`;
}

export function esHoy(date?: Date | null): boolean {
  if (!date) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function formatDateTime(date?: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
