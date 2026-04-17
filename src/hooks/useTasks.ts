import { useState, useCallback, useEffect } from "react";
import type { Task } from "@/lib/types";
import { uid, saveTasks, loadTasks } from "@/lib/store";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  // Persist on every change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((title: string, deadline: string | null) => {
    const task: Task = {
      id: uid(),
      title: title.trim(),
      deadline,
      completed: false,
      subtasks: [],
      createdAt: Date.now(),
      lockedInAt: null,
    };
    setTasks((prev) => [...prev, task]);
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, lockedInAt: null } : t
      )
    );
  }, []);

  const editTask = useCallback((id: string, updates: Partial<Pick<Task, "title" | "deadline">>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTask = useCallback((id: string, direction: number) => {
    setTasks((prev) => {
      const activeTasks = prev.filter((t) => !t.completed);
      const idx = activeTasks.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= activeTasks.length) return prev;

      const fullIdx = prev.findIndex((t) => t.id === activeTasks[idx]!.id);
      const fullNewIdx = prev.findIndex((t) => t.id === activeTasks[newIdx]!.id);
      const next = [...prev];
      [next[fullIdx], next[fullNewIdx]] = [next[fullNewIdx]!, next[fullIdx]!];
      return next;
    });
  }, []);

  const addSubtask = useCallback((taskId: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, { text: text.trim(), done: false }] }
          : t
      )
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subIndex: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s, i) =>
                i === subIndex ? { ...s, done: !s.done } : s
              ),
            }
          : t
      )
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subIndex: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: t.subtasks.filter((_, i) => i !== subIndex) } : t
      )
    );
  }, []);

  const lockIn = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.completed) return t;
        if (t.id === id) return { ...t, lockedInAt: Date.now() };
        // Unlock any other task that was locked in
        if (t.lockedInAt !== null) return { ...t, lockedInAt: null };
        return t;
      })
    );
  }, []);

  const lockOut = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, lockedInAt: null } : t))
    );
  }, []);

  return {
    tasks,
    addTask,
    editTask,
    completeTask,
    deleteTask,
    moveTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    lockIn,
    lockOut,
  };
}
