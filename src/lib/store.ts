import type { Task } from "./types";

const STORE_KEY = "lockin_tasks";
const THEME_KEY = "lockin_theme";
const MODE_KEY = "lockin_mode";

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(tasks));
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const tasks: Task[] = JSON.parse(raw);
    return tasks.map((t) => ({
      ...t,
      lockedInAt: t.lockedInAt ?? null,
      timeSpentMs: t.timeSpentMs ?? 0,
    }));
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
