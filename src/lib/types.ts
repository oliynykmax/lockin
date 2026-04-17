export interface Subtask {
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  deadline: string | null;
  completed: boolean;
  subtasks: Subtask[];
  createdAt: number;
  lockedInAt: number | null;
}

export type TimerMode = "countdown" | "lockin";
