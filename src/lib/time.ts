export interface Countdown {
  days: string;
  hours: string;
  mins: string;
  secs: string;
  overdue: boolean;
}

export function formatCountdown(ms: number): Countdown {
  if (ms <= 0) {
    const overSec = Math.floor(Math.abs(ms) / 1000);
    return {
      days: String(Math.floor(overSec / 86400)).padStart(2, "0"),
      hours: String(Math.floor((overSec % 86400) / 3600)).padStart(2, "0"),
      mins: String(Math.floor((overSec % 3600) / 60)).padStart(2, "0"),
      secs: String(overSec % 60).padStart(2, "0"),
      overdue: true,
    };
  }
  const totalSec = Math.floor(ms / 1000);
  return {
    days: String(Math.floor(totalSec / 86400)).padStart(2, "0"),
    hours: String(Math.floor((totalSec % 86400) / 3600)).padStart(2, "0"),
    mins: String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0"),
    secs: String(totalSec % 60).padStart(2, "0"),
    overdue: false,
  };
}

export function formatTimerSmall(ms: number): string {
  const totalSec = Math.floor(Math.abs(ms) / 1000);
  const days = String(Math.floor(totalSec / 86400)).padStart(2, "0");
  const h = String(Math.floor((totalSec % 86400) / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${days}d ${h}h ${m}m ${s}s`;
}

export interface Elapsed {
  days: string;
  hours: string;
  mins: string;
  secs: string;
}

export function formatElapsed(ms: number): Elapsed {
  const totalSec = Math.floor(Math.abs(ms) / 1000);
  return {
    days: String(Math.floor(totalSec / 86400)).padStart(2, "0"),
    hours: String(Math.floor((totalSec % 86400) / 3600)).padStart(2, "0"),
    mins: String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0"),
    secs: String(totalSec % 60).padStart(2, "0"),
  };
}

export function dateToLocalISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDeadline(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
