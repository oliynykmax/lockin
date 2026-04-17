import type { Task } from "./types";

const STORE_KEY = "lockin_tasks";
const THEME_KEY = "lockin_theme";

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(tasks));
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : [];
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
