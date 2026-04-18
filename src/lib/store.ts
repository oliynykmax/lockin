import type { Task } from "./types";

const STORE_KEY = "lockin_tasks";
const THEME_KEY = "lockin_theme";
const MODE_KEY = "lockin_mode";
const FONT_STYLE_KEY = "lockin_font_style";
const LOCKIN_TIP_KEY = "lockin_lockin_tip_seen";

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function now(): number {
  return Date.now();
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(tasks));
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const tasks: Task[] = JSON.parse(raw);
    return tasks.map((t) => {
      // Auto-expire stale lock-in sessions older than 4 hours
      const maxSessionMs = 4 * 60 * 60 * 1000;
      const lockedInAt = t.lockedInAt
        ? (Date.now() - t.lockedInAt > maxSessionMs ? null : t.lockedInAt)
        : null;
      const timeSpentMs = t.lockedInAt && !lockedInAt
        ? t.timeSpentMs + (Date.now() - t.lockedInAt)
        : (t.timeSpentMs ?? 0);
      return {
        ...t,
        lockedInAt,
        timeSpentMs,
        updatedAt: t.updatedAt ?? t.createdAt,
      };
    });
  } catch {
    return [];
  }
}

export function loadTheme(): "light" | "dark" {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "dark" ? "dark" : "light";
}

export function saveTheme(theme: "light" | "dark"): void {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadMode(): "countdown" | "lockin" {
  const saved = localStorage.getItem(MODE_KEY);
  return saved === "lockin" ? "lockin" : "countdown";
}

export function saveMode(mode: "countdown" | "lockin"): void {
  localStorage.setItem(MODE_KEY, mode);
}

export function loadFontStyle(): "default" | "mono" {
  const saved = localStorage.getItem(FONT_STYLE_KEY);
  return saved === "mono" ? "mono" : "default";
}

export function saveFontStyle(style: "default" | "mono"): void {
  localStorage.setItem(FONT_STYLE_KEY, style);
}

function getLockInTipKey(userId: string | null): string {
  return userId ? `${LOCKIN_TIP_KEY}:${userId}` : LOCKIN_TIP_KEY;
}

export function loadLockInTipSeen(userId: string | null): boolean {
  return localStorage.getItem(getLockInTipKey(userId)) === "1";
}

export function saveLockInTipSeen(userId: string | null): void {
  localStorage.setItem(getLockInTipKey(userId), "1");
}
