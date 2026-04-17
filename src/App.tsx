import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroTimer } from "@/components/HeroTimer";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskItem } from "@/components/TaskItem";
import { useTasks } from "@/hooks/useTasks";
import { useTheme } from "@/hooks/useTheme";

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
  } = useTasks();

  const { theme, toggleTheme } = useTheme();

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="max-w-[1080px] mx-auto px-4 md:px-8 min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between py-6 pb-4">
        <h1 className="font-[family-name:var(--font-display)] text-2xl md:text-[1.9rem] font-bold tracking-tight text-foreground">
          lockin<span className="text-primary">.</span>
        </h1>
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
      </header>

      {/* Main: 2-column grid */}
      <main className="grid grid-cols-1 md:grid-cols-[5fr_4fr] gap-5 md:gap-10 flex-1 items-start">
        {/* Left: Hero Timer (sticky on desktop) */}
        <section className="md:sticky md:top-6">
          <HeroTimer tasks={tasks} />
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
