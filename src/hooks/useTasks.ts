import { useState, useCallback, useEffect, useRef } from "react";
import type { Task } from "@/lib/types";
import { uid, now, saveTasks, loadTasks } from "@/lib/store";
import { useSession } from "@/lib/auth-client";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status}`);
  return res.json();
}

export function useTasks() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const syncedRef = useRef(false);
  const skipSyncRef = useRef(false);
  const prevUserIdRef = useRef<string | null>(null);

  // Reset tasks when user signs out or switches account
  useEffect(() => {
    if (prevUserIdRef.current && !userId) {
      // User signed out — reload from localStorage (which may have pre-auth local tasks)
      setTasks(loadTasks());
      syncedRef.current = false;
    } else if (prevUserIdRef.current && userId && prevUserIdRef.current !== userId) {
      // User switched accounts — load fresh
      setTasks([]);
      syncedRef.current = false;
    }
    prevUserIdRef.current = userId;
  }, [userId]);

  // Load from server when user signs in
  useEffect(() => {
    if (!userId) {
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return;
    syncedRef.current = true;

    (async () => {
      try {
        const serverTasks: Task[] = await apiFetch("/tasks");
        setTasks((local) => {
          const serverMap = new Map(serverTasks.map((t) => [t.id, t]));
          const merged = local.map((t) => {
            const server = serverMap.get(t.id);
            if (!server) return t;
            return (server.updatedAt ?? 0) >= (t.updatedAt ?? 0) ? server : t;
          });
          const localIds = new Set(local.map((t) => t.id));
          for (const st of serverTasks) {
            if (!localIds.has(st.id)) merged.push(st);
          }
          return merged;
        });
      } catch (e) {
        console.error("Failed to load tasks from server:", e);
      }
    })();
  }, [userId]);

  // Sync to server on changes (debounced)
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    saveTasks(tasks);

    if (!userId) return;
    // Skip sync after server response to avoid infinite loop
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      try {
        const serverTasks: Task[] = await apiFetch("/tasks", {
          method: "PUT",
          body: JSON.stringify({ tasks: tasksRef.current }),
        });
        skipSyncRef.current = true;
        setTasks(serverTasks);
      } catch (e) {
        console.error("Failed to sync tasks:", e);
      }
    }, 2000);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [tasks, userId]);

  const addTask = useCallback((title: string, deadline: string | null) => {
    const t = now();
    const task: Task = {
      id: uid(),
      title: title.trim(),
      deadline,
      completed: false,
      subtasks: [],
      createdAt: t,
      lockedInAt: null,
      timeSpentMs: 0,
      updatedAt: t,
    };
    setTasks((prev) => [...prev, task]);
  }, []);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? {
          ...t,
          completed: !t.completed,
          lockedInAt: null,
          timeSpentMs: t.lockedInAt ? t.timeSpentMs + (now() - t.lockedInAt) : t.timeSpentMs,
          updatedAt: now(),
        } : t
      )
    );
  }, []);

  const editTask = useCallback((id: string, updates: Partial<Pick<Task, "title" | "deadline">>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now() } : t))
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
      return next.map((t) => ({ ...t, updatedAt: now() }));
    });
  }, []);

  const addSubtask = useCallback((taskId: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, { text: text.trim(), done: false }], updatedAt: now() }
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
              updatedAt: now(),
            }
          : t
      )
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subIndex: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: t.subtasks.filter((_, i) => i !== subIndex), updatedAt: now() } : t
      )
    );
  }, []);

  const lockIn = useCallback((id: string) => {
    const t = now();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.completed) return task;
        if (task.id === id) return { ...task, lockedInAt: t, updatedAt: t };
        if (task.lockedInAt !== null) return { ...task, lockedInAt: null, timeSpentMs: task.timeSpentMs + (t - task.lockedInAt), updatedAt: t };
        return task;
      })
    );
  }, []);

  const lockOut = useCallback((id: string) => {
    const t = now();
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, lockedInAt: null, timeSpentMs: task.lockedInAt ? task.timeSpentMs + (t - task.lockedInAt) : task.timeSpentMs, updatedAt: t }
          : task
      )
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
