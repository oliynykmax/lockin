import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import type { Task, TimerMode } from "@/lib/types";
import { formatCountdown, formatDeadline, formatElapsed } from "@/lib/time";
import type { Countdown } from "@/lib/time";

interface HeroTimerProps {
  tasks: Task[];
  mode: TimerMode;
}

export function HeroTimer({ tasks, mode }: HeroTimerProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const active = tasks.filter((t) => !t.completed);
  const withDeadline = active.filter((t) => t.deadline);
  const lockedTask = active.find((t) => t.lockedInAt !== null) ?? null;

  // ── Lock-in mode ──
  if (mode === "lockin") {
    const isIdle = !lockedTask;
    const totalMs = lockedTask?.lockedInAt
      ? lockedTask.timeSpentMs + (Date.now() - lockedTask.lockedInAt)
      : 0;
    const elapsed = totalMs > 0
      ? formatElapsed(totalMs)
      : { days: "00", hours: "00", mins: "00", secs: "00" };

    const isPastDeadline =
      lockedTask?.deadline &&
      new Date(lockedTask.deadline).getTime() <= Date.now();

    return (
      <div
        className={`relative overflow-hidden rounded-2xl px-8 py-12 md:px-14 md:py-16 ${
          isIdle
            ? "bg-gradient-to-br from-lockin/40 via-lockin/25 to-lockin/15"
            : "bg-gradient-to-br from-lockin/90 via-lockin-mid to-lockin-end"
        }`}
      >
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: "150px 150px",
          }}
        />
        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_25%,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />

        <div className="relative z-10 text-center">
          {isIdle && (
            <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-0.5 rounded-full bg-white/10 text-[0.6rem] font-bold tracking-[0.16em] uppercase text-white/60 font-[family-name:var(--font-display)]">
              <Target className="size-3" />
              locked in
            </div>
          )}

          <div className="flex items-start justify-center gap-6 md:gap-10 mb-4">
            <DigitGroup value={elapsed.days} label="days" pulse={false} />
            <DigitGroup value={elapsed.hours} label="hrs" pulse={false} />
            <DigitGroup value={elapsed.mins} label="min" pulse={false} />
            <DigitGroup value={elapsed.secs} label="sec" pulse={false} />
          </div>

          <p
            className={`font-[family-name:var(--font-display)] text-lg md:text-xl font-medium tracking-tight ${
              isIdle ? "text-white/60" : "text-white/90"
            }`}
          >
            {isIdle
              ? "tap a task to lock in"
              : lockedTask?.title ?? ""}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            {lockedTask?.deadline && (
              <span
                className={`text-xs ${
                  isPastDeadline ? "text-amber-300/80" : "text-white/60"
                }`}
              >
                {isPastDeadline ? "past deadline" : formatDeadline(lockedTask.deadline)}
              </span>
            )}
            {!lockedTask?.deadline && !isIdle && (
              <span className="text-xs text-white/55">no deadline</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Countdown mode (original) ──
  let current: Task | undefined;
  let cd: Countdown;
  let deadlineStr = "";
  let isOverdue = false;
  let isCompleted = false;

  if (active.length === 0) {
    isCompleted = true;
    cd = { days: "00", hours: "00", mins: "00", secs: "00", overdue: false };
  } else {
    current =
      withDeadline.length > 0
        ? withDeadline.sort(
            (a, b) =>
              new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
          )[0]!
        : active[0]!;

    if (current.deadline) {
      const remaining = new Date(current.deadline).getTime() - Date.now();
      cd = formatCountdown(remaining);
      isOverdue = cd.overdue;
      deadlineStr = formatDeadline(current.deadline);
    } else {
      cd = { days: "—", hours: "—", mins: "—", secs: "—", overdue: false };
      deadlineStr = "no deadline";
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl px-8 py-12 md:px-14 md:py-16 ${
        isOverdue
          ? "bg-gradient-to-br from-red-900/80 via-red-800/60 to-red-900/40 dark:from-red-950/80 dark:via-red-900/60 dark:to-red-950/40"
          : isCompleted
            ? "bg-gradient-to-br from-green-900/40 via-emerald-800/30 to-green-900/20 dark:from-green-950/50 dark:via-emerald-900/30 dark:to-green-950/20"
            : "bg-gradient-to-br from-purple-500/90 via-violet-600 to-indigo-700 dark:from-purple-800/90 dark:via-violet-900 dark:to-indigo-950"
      }`}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "150px 150px",
        }}
      />
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_25%,rgba(255,255,255,0.1),transparent_55%)] pointer-events-none" />

      <div className="relative z-10 text-center">
        {isOverdue && (
          <div className="inline-block mb-3 px-3 py-0.5 rounded-full bg-red-500/55 text-[0.6rem] font-bold tracking-[0.16em] uppercase text-white/85 font-[family-name:var(--font-display)]">
            overdue
          </div>
        )}

        <div className="flex items-start justify-center gap-6 md:gap-10 mb-4">
          <DigitGroup value={cd.days} label="days" pulse={isOverdue} />
          <DigitGroup value={cd.hours} label="hrs" pulse={isOverdue} />
          <DigitGroup value={cd.mins} label="min" pulse={isOverdue} />
          <DigitGroup value={cd.secs} label="sec" pulse={isOverdue} />
        </div>

        <p
          className={`font-[family-name:var(--font-display)] text-lg md:text-xl font-medium tracking-tight ${
            isCompleted ? "text-white/60" : "text-white/90"
          }`}
        >
          {isCompleted
            ? "all done 🎉"
            : current?.title ?? "add your first task"}
        </p>
        <p className="text-xs text-white/60 mt-1">
          {isCompleted ? "" : deadlineStr}
        </p>
      </div>
    </div>
  );
}

function DigitGroup({
  value,
  label,
  pulse,
}: {
  value: string;
  label: string;
  pulse: boolean;
}) {
  return (
    <div className="flex flex-col items-center w-[56px] md:w-[80px]">
      <span
        className={`font-[family-name:var(--font-display)] text-[2.2rem] md:text-[4.5rem] font-bold leading-none text-white tabular-nums ${
          pulse ? "animate-pulse-urgent" : ""
        }`}
      >
        {value}
      </span>
      <span className="font-[family-name:var(--font-body)] text-[0.6rem] font-medium uppercase tracking-[0.14em] text-white/60 mt-1.5">
        {label}
      </span>
    </div>
  );
}
