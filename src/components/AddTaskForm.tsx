import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/DateTimePicker";

interface AddTaskFormProps {
  onAdd: (title: string, deadline: string | null) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      // Use local time string to avoid UTC shift
      const pad = (n: number) => String(n).padStart(2, "0");
      const deadlineStr = deadline
        ? `${deadline.getFullYear()}-${pad(deadline.getMonth() + 1)}-${pad(deadline.getDate())}T${pad(deadline.getHours())}:${pad(deadline.getMinutes())}`
        : null;
      onAdd(title, deadlineStr);
      setTitle("");
      setDeadline(undefined);
      setShowForm(false);
    },
    [title, deadline, onAdd]
  );

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setTitle("");
    setDeadline(undefined);
  }, []);

  if (!showForm) {
    return (
      <Button
        variant="outline"
        className="w-full h-12 border-dashed border-2 border-primary/30 text-primary font-[family-name:var(--font-display)] font-medium gap-2.5 bg-primary/5 hover:bg-primary/15 hover:border-primary hover:-translate-y-px transition-all"
        onClick={() => setShowForm(true)}
      >
        <Plus className="size-4" />
        add a task
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl p-5 shadow-md animate-slide-down space-y-4"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="what do you need to do?"
        className="h-11 text-base font-medium bg-secondary/50 border-primary/20 focus-visible:border-primary"
        autoFocus
      />

      <DateTimePicker value={deadline} onChange={setDeadline} />

      <div className="flex gap-2 justify-end pt-1">
        <Button type="submit" className="rounded-full font-[family-name:var(--font-display)] font-semibold shadow-md shadow-primary/20">
          add task
        </Button>
        <Button type="button" variant="ghost" onClick={handleCancel} className="rounded-full">
          cancel
        </Button>
      </div>
    </form>
  );
}
