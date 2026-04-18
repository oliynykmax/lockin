import { useCallback, useEffect, useState } from "react";
import { Sun, Moon, Target, Hourglass, Type } from "lucide-react";
import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import { HeroTimer } from "@/components/HeroTimer";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskItem } from "@/components/TaskItem";
import { useTasks } from "@/hooks/useTasks";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { loadLockInTipSeen, saveLockInTipSeen } from "@/lib/store";
import type { TimerMode } from "@/lib/types";

export default function App() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  const {
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
  } = useTasks();

  const { theme, toggleTheme, mode, setTimerMode: _setTimerMode, fontStyle, toggleFontStyle } = useTheme();
  const [showLockInTip, setShowLockInTip] = useState(false);

  useEffect(() => {
    setShowLockInTip(!loadLockInTipSeen(userId));
  }, [userId]);

  // When manually switching to countdown, clear any active lock-in
  const setTimerMode = useCallback((m: TimerMode) => {
    if (m === "countdown") {
      const locked = tasks.find((t) => t.lockedInAt && !t.completed);
      if (locked) lockOut(locked.id);
    }
    _setTimerMode(m);
  }, [tasks, lockOut, _setTimerMode]);

  // Wrapping lockIn to also switch to lock-in mode automatically
  const handleLockIn = useCallback((id: string) => {
    lockIn(id);
    setTimerMode("lockin");
    if (showLockInTip) {
      saveLockInTipSeen(userId);
      setShowLockInTip(false);
    }
  }, [lockIn, setTimerMode, showLockInTip, userId]);

  // Switch back to countdown when unlocking (setTimerMode clears the locked task)
  const handleLockOut = useCallback((_id: string) => {
    setTimerMode("countdown");
  }, [setTimerMode]);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="max-w-[1080px] mx-auto px-4 md:px-8 h-dvh flex flex-col overflow-hidden">
      {/* Header */}
      <header className="py-4 md:py-5 shrink-0">
        <div className="rounded-2xl border border-border/70 bg-card/85 px-3 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70 md:px-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="mr-auto min-w-0">
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-foreground md:text-[1.9rem]">
                lockin<span className="text-primary">.</span>
              </h1>
            </div>

            <div className="order-3 w-full sm:order-none sm:w-auto">
              <div className="grid grid-cols-2 items-center rounded-xl border border-border/70 bg-background/70 p-1">
                <button
                  onClick={() => setTimerMode("countdown")}
                  className={cn(
                    "flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold tracking-wide transition-all",
                    mode === "countdown"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={mode === "countdown"}
                  aria-label="Countdown mode"
                >
                  <Hourglass className="size-3" />
                  countdown
                </button>
                <button
                  onClick={() => setTimerMode("lockin")}
                  className={cn(
                    "flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold tracking-wide transition-all",
                    mode === "lockin"
                      ? "bg-lockin text-lockin-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={mode === "lockin"}
                  aria-label="Lock-in mode"
                >
                  <Target className="size-3" />
                  lock-in
                </button>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/70 p-1">
              <AuthButton />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleFontStyle}
                className={cn(
                  "rounded-lg text-muted-foreground",
                  fontStyle === "mono"
                    ? "mono-chip text-primary"
                    : "hover:bg-primary/10 hover:text-primary"
                )}
                aria-label="Toggle monospace style"
                aria-pressed={fontStyle === "mono"}
                title={fontStyle === "mono" ? "Mono mode on" : "Mono mode"}
              >
                <Type className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleTheme}
                className="rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main: 2-column grid */}
      <main className="grid grid-cols-1 md:grid-cols-[5fr_4fr] grid-rows-[auto_1fr] md:grid-rows-1 gap-5 md:gap-10 flex-1 min-h-0 overflow-hidden">
        {/* Left: Hero Timer */}
        <section className="shrink-0">
          <HeroTimer tasks={tasks} mode={mode} showLockInTip={showLockInTip} />
        </section>

        {/* Right: Tasks */}
        <section className="min-w-0 flex flex-col min-h-0 overflow-hidden">
          {/* Add Task */}
          <div className="shrink-0">
            <AddTaskForm onAdd={addTask} />
          </div>

          {/* Task List — scrollable area */}
          <div className="task-scroll flex-1 overflow-y-auto space-y-2.5 min-h-0 py-1 pr-2">
            {activeTasks.map((task, i) => (
              <TaskItem
                key={task.id}
                task={task}
                index={i}
                total={activeTasks.length}
                onComplete={completeTask}
                onEdit={editTask}
                onDelete={deleteTask}
                onMove={moveTask}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                onLockIn={handleLockIn}
                onLockOut={handleLockOut}
              />
            ))}
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                index={-1}
                total={-1}
                onComplete={completeTask}
                onEdit={editTask}
                onDelete={deleteTask}
                onMove={moveTask}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                onLockIn={handleLockIn}
                onLockOut={handleLockOut}
              />
            ))}

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground/40 mb-3 flex justify-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12l2.5 2.5L16 9" />
                  </svg>
                </div>
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-muted-foreground mb-1">
                  no tasks yet
                </p>
                <p className="text-sm text-muted-foreground/60">
                  add one above to start lockin in
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs text-muted-foreground/60 tracking-wide shrink-0">
        stay focused. stay lockin.
      </footer>
    </div>
  );
}
