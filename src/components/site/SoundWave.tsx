import { cn } from "@/lib/utils";

const HEIGHTS = [30, 55, 80, 45, 95, 65, 40, 85, 60, 100, 50, 75, 35, 90, 55, 70, 40, 80, 45, 60, 30];

export function SoundWave({ className, bars = HEIGHTS.length, animated = true }: { className?: string; bars?: number; animated?: boolean }) {
  return (
    <div aria-hidden className={cn("flex h-16 items-center gap-1.5", className)}>
      {HEIGHTS.slice(0, bars).map((h, i) => (
        <span
          key={i}
          className={cn("w-1.5 rounded-full bg-brand opacity-80", animated && "wave-bar")}
          style={{ height: `${h}%`, animationDelay: `${(i % 7) * 0.13}s` }}
        />
      ))}
    </div>
  );
}
