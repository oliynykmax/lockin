import { Sun, Moon, Target, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroTimer } from "@/components/HeroTimer";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskItem } from "@/components/TaskItem";
import { useTasks } from "@/hooks/useTasks";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import type { TimerMode } from "@/lib/types";

export default function App() {
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

  const { theme, toggleTheme, mode, setTimerMode: _setTimerMode } = useTheme();

  // When manually switching to countdown, clear any active lock-in
  const setTimerMode = (m: TimerMode) => {
    if (m === "countdown") {
      const locked = tasks.find((t) => t.lockedInAt && !t.completed);
      if (locked) lockOut(locked.id);
    }
    _setTimerMode(m);
  };

  // Wrapping lockIn to also switch to lock-in mode automatically
  const handleLockIn = (id: string) => {
    lockIn(id);
    setTimerMode("lockin");
  };

  // Switch back to countdown when unlocking (setTimerMode clears the locked task)
  const handleLockOut = (_id: string) => {
    setTimerMode("countdown");
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="max-w-[1080px] mx-auto px-4 md:px-8 min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between py-6 pb-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-[1.9rem] font-bold tracking-tight text-foreground">
          lockin<span className="text-primary">.</span>
        </h1>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center rounded-full bg-card border border-border p-0.5">
            <button
              onClick={() => setTimerMode("countdown")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-[family-name:var(--font-display)] tracking-wide transition-all",
                mode === "countdown"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Countdown mode"
            >
              <Hourglass className="size-3" />
              <span className="hidden sm:inline">countdown</span>
            </button>
            <button
              onClick={() => setTimerMode("lockin")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-[family-name:var(--font-display)] tracking-wide transition-all",
                mode === "lockin"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Lock-in mode"
            >
              <Target className="size-3" />
              <span className="hidden sm:inline">lock-in</span>
            </button>
          </div>
          {/* Theme toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full size-9 text-muted-foreground bg-card border-border hover:bg-primary/10 hover:text-primary hover:border-border/80"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main: 2-column grid */}
      <main className="grid grid-cols-1 md:grid-cols-[5fr_4fr] gap-5 md:gap-10 flex-1 items-start">
        {/* Left: Hero Timer (sticky on desktop) */}
        <section className="md:sticky md:top-6">
          <HeroTimer tasks={tasks} mode={mode} />
        </section>

        {/* Right: Tasks */}
        <section className="min-w-0 space-y-6">
          {/* Add Task */}
          <AddTaskForm onAdd={addTask} />

          {/* Task List */}
          <div className="space-y-2.5">
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
          </div>

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
        </section>
      </main>

      {/* Footer */}
      <footer className="py-7 text-center text-xs text-muted-foreground/60 tracking-wide">
        stay focused. stay lockin.
      </footer>
    </div>
  );
}
