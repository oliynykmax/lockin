import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, X, Pencil, Check, Target, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DateTimePicker } from "@/components/DateTimePicker";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { formatTimerSmall, formatDeadline, dateToLocalISO } from "@/lib/time";

interface TaskItemProps {
  task: Task;
  index: number;
  total: number;
  onComplete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Pick<Task, "title" | "deadline">>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: number) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subIndex: number) => void;
  onDeleteSubtask: (taskId: string, subIndex: number) => void;
  onLockIn: (id: string) => void;
  onLockOut: (id: string) => void;
}

export function TaskItem({
  task,
  index,
  total,
  onComplete,
  onEdit,
  onDelete,
  onMove,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onLockIn,
  onLockOut,
}: TaskItemProps) {
  const [, setTick] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDeadline, setEditDeadline] = useState<Date | undefined>(
    task.deadline ? new Date(task.deadline) : undefined
  );
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Tick every second for timer updates
  useEffect(() => {
    if (task.completed || !task.deadline) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [task.completed, task.deadline]);

  // Focus title input when entering edit mode
  useEffect(() => {
    if (editing) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editing]);

  // Sync edit state when task changes
  useEffect(() => {
    if (!editing) {
      setEditTitle(task.title);
      setEditDeadline(task.deadline ? new Date(task.deadline) : undefined);
    }
  }, [task.title, task.deadline, editing]);

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

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    const deadlineStr = editDeadline ? dateToLocalISO(editDeadline) : null;
    onEdit(task.id, { title: editTitle.trim(), deadline: deadlineStr });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDeadline(task.deadline ? new Date(task.deadline) : undefined);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-xl px-4 py-4 transition-all animate-task-enter",
        "hover:border-border/80 hover:shadow-md",
        task.completed && "opacity-60",
        task.lockedInAt && !task.completed && "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10 animate-glow-soft"
      )}
    >
      {editing ? (
        /* ── Edit mode ── */
        <div className="space-y-3">
          <Input
            ref={titleInputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveEdit();
              }
              if (e.key === "Escape") handleCancelEdit();
            }}
            className="h-9 text-base font-semibold bg-secondary/50 border-primary/20 focus-visible:border-primary"
          />
          <DateTimePicker value={editDeadline} onChange={setEditDeadline} />
          <div className="flex gap-2 justify-end pt-1">
            <Button
              size="sm"
              onClick={handleSaveEdit}
              className="rounded-full font-semibold shadow-sm"
            >
              <Check className="size-3.5" />
              save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              className="rounded-full"
            >
              cancel
            </Button>
          </div>
        </div>
      ) : (
        /* ── View mode ── */
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
              {task.lockedInAt && !task.completed && (
                <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold tracking-[0.12em] uppercase text-emerald-600 dark:text-emerald-400 font-[family-name:var(--font-display)]">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  locked in
                </span>
              )}
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
                {task.lockedInAt ? (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onLockOut(task.id)}
                    className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                    title="Stop focusing"
                  >
                    <Square className="size-3.5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onLockIn(task.id)}
                    className="text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                    title="Lock in"
                  >
                    <Target className="size-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setEditing(true)}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Pencil className="size-3.5" />
                </Button>
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
      )}

      {/* Subtask progress badge */}
      {task.subtasks.length > 0 && !task.completed && !editing && (
        <div className="mt-2 ml-10">
          <Badge variant="secondary" className="text-[0.65rem] font-medium">
            {task.subtasks.filter((s) => s.done).length}/{task.subtasks.length} done
          </Badge>
        </div>
      )}
    </div>
  );
}
