import { useState, useCallback } from "react";
import { CalendarIcon, Clock, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

const QUICK_OFFSETS: { label: string; seconds: number }[] = [
  { label: "1h", seconds: 3600 },
  { label: "2h", seconds: 7200 },
  { label: "tomorrow", seconds: 86400 },
  { label: "2 days", seconds: 172800 },
  { label: "1 week", seconds: 604800 },
];

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [hours, setHours] = useState<string>(() => {
    if (value) return String(value.getHours()).padStart(2, "0");
    return "23";
  });
  const [minutes, setMinutes] = useState<string>(() => {
    if (value) return String(value.getMinutes()).padStart(2, "0");
    return "59";
  });

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      setSelectedDate(date);
      // Combine date + time
      const h = parseInt(hours) || 0;
      const m = parseInt(minutes) || 0;
      const combined = new Date(date);
      combined.setHours(h, m, 0, 0);
      onChange(combined);
    },
    [hours, minutes, onChange]
  );

  const handleTimeChange = useCallback(
    (newHours: string, newMinutes: string) => {
      setHours(newHours);
      setMinutes(newMinutes);
      if (selectedDate) {
        const h = parseInt(newHours) || 0;
        const m = parseInt(newMinutes) || 0;
        const combined = new Date(selectedDate);
        combined.setHours(h, m, 0, 0);
        onChange(combined);
      }
    },
    [selectedDate, onChange]
  );

  const handleQuickOffset = useCallback(
    (totalSeconds: number) => {
      const future = new Date(Date.now() + totalSeconds * 1000);
      setSelectedDate(future);
      setHours(String(future.getHours()).padStart(2, "0"));
      setMinutes(String(future.getMinutes()).padStart(2, "0"));
      onChange(future);
      setOpen(false);
    },
    [onChange]
  );

  const handleHoursBlur = useCallback(() => {
    let h = parseInt(hours) || 0;
    h = Math.max(0, Math.min(23, h));
    handleTimeChange(String(h).padStart(2, "0"), minutes);
  }, [hours, minutes, handleTimeChange]);

  const handleMinutesBlur = useCallback(() => {
    let m = parseInt(minutes) || 0;
    m = Math.max(0, Math.min(59, m));
    handleTimeChange(hours, String(m).padStart(2, "0"));
  }, [hours, minutes, handleTimeChange]);

  return (
    <div className="space-y-3">
      {/* Quick pills */}
      <div>
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2 block">
          deadline
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_OFFSETS.map(({ label, seconds }) => (
            <Button
              key={seconds}
              type="button"
              variant="outline"
              size="xs"
              className="rounded-full font-semibold text-primary border-primary/30 bg-primary/5 hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleQuickOffset(seconds)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Date + Time row */}
      <div className="flex gap-2">
        {/* Date picker popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal gap-2",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="size-4" />
              {selectedDate ? format(selectedDate, "MMM d, yyyy") : "pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              defaultMonth={selectedDate ?? new Date()}
              disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
            />
          </PopoverContent>
        </Popover>

        {/* Time inputs */}
        <div className="flex items-center gap-1 bg-secondary/50 border border-input rounded-md px-2 py-1">
          <Clock className="size-3.5 text-muted-foreground" />
          <Input
            type="text"
            inputMode="numeric"
            value={hours}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d{0,2}$/.test(v)) setHours(v);
            }}
            onBlur={handleHoursBlur}
            className="w-10 h-7 text-center text-sm border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="HH"
          />
          <span className="text-muted-foreground font-bold">:</span>
          <Input
            type="text"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || /^\d{0,2}$/.test(v)) setMinutes(v);
            }}
            onBlur={handleMinutesBlur}
            className="w-10 h-7 text-center text-sm border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="MM"
          />
        </div>
      </div>

      {/* Selected deadline display — always rendered to prevent layout shift */}
      <div className="flex items-center justify-between min-h-[1.25rem]">
        <p className="text-xs text-muted-foreground">
          {selectedDate ? `deadline: ${format(selectedDate, "MMM d, yyyy · h:mm a")}` : "\u00A0"}
        </p>
        {selectedDate && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-muted-foreground hover:text-overdue h-5 px-1.5"
            onClick={() => {
              setSelectedDate(undefined);
              setHours("23");
              setMinutes("59");
              onChange(undefined);
            }}
          >
            <X className="size-3" />
            clear
          </Button>
        )}
      </div>
    </div>
  );
}
