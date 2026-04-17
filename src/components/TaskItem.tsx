import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { formatTimerSmall, formatDeadline } from "@/lib/time";

interface TaskItemProps {
  task: Task;
  index: number;
  total: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: number) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subIndex: number) => void;
  onDeleteSubtask: (taskId: string, subIndex: number) => void;
}

export function TaskItem({
  task,
  index,
  total,
  onComplete,
  onDelete,
  onMove,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskItemProps) {
  const [, setTick] = useState(0);

  // Tick every second for timer updates
  useEffect(() => {
    if (task.completed || !task.deadline) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [task.completed, task.deadline]);

  const remaining = task.deadline
    ? new Date(task.deadline).getTime() - Date.now()
    : null;

  const timerText = task.completed
    ? "completed ✓"
    : remaining !== null
      ? formatTimerSmall(remaining)
      : "no deadline";

  const isOverdue = !task.completed && remaining !== null && remaining <= 0;
  const isNoDeadline = !task.completed && remaining === null;

  const [subtaskInput, setSubtaskInput] = useState("");

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    onAddSubtask(task.id, subtaskInput);
    setSubtaskInput("");
  };

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-xl px-4 py-4 transition-all animate-task-enter",
        "hover:border-border/80 hover:shadow-md",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onComplete(task.id)}
          className={cn(
            "mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300",
            task.completed
              ? "bg-primary border-primary animate-check-pop"
              : "border-primary/40 hover:border-primary hover:bg-primary/10 hover:scale-110 active:scale-90"
          )}
          aria-label="Complete task"
        >
          {task.completed && (
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <polyline points="3.5 8.5 6.5 11.5 12.5 5.5" />
            </svg>
          )}
        </button>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "font-[family-name:var(--font-display)] text-base font-semibold tracking-tight",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </span>
            <span
              className={cn(
                "font-[family-name:var(--font-display)] text-sm font-medium tabular-nums tracking-wide",
                isOverdue && "text-overdue",
                isNoDeadline && "text-muted-foreground font-normal",
                !isOverdue && !isNoDeadline && !task.completed && "text-primary",
                task.completed && "text-muted-foreground"
              )}
            >
              {timerText}
            </span>
          </div>

          {task.deadline && !task.completed && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDeadline(task.deadline)}
            </p>
          )}

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="mt-2.5 space-y-1.5">
              {task.subtasks.map((st, si) => (
                <div key={si} className="flex items-center gap-2 group/sub">
                  <Checkbox
                    checked={st.done}
                    onCheckedChange={() => onToggleSubtask(task.id, si)}
                    className="size-4 rounded-full"
                  />
                  <span
                    className={cn(
                      "text-sm flex-1 min-w-0 transition-colors",
                      st.done
                        ? "line-through text-muted-foreground"
                        : "text-foreground/80"
                    )}
                  >
                    {st.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-overdue hover:bg-overdue-bg transition-all"
                    onClick={() => onDeleteSubtask(task.id, si)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add subtask */}
          {!task.completed && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60">
              <Input
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="add subtask…"
                className="h-7 text-sm bg-secondary/30 border-border/50"
              />
              <Button
                variant="outline"
                size="xs"
                onClick={handleAddSubtask}
                className="rounded-full text-primary border-primary/30 shrink-0"
              >
                <Plus className="size-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
          {!task.completed && (
            <>
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={index === 0}
                onClick={() => onMove(task.id, -1)}
                className="text-muted-foreground"
              >
                <ChevronUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={index >= total - 1}
                onClick={() => onMove(task.id, 1)}
                className="text-muted-foreground"
              >
                <ChevronDown className="size-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-overdue hover:bg-overdue-bg"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Subtask progress badge */}
      {task.subtasks.length > 0 && !task.completed && (
        <div className="mt-2 ml-10">
          <Badge variant="secondary" className="text-[0.65rem] font-medium">
            {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} done
          </Badge>
        </div>
      )}
    </div>
  );
}
