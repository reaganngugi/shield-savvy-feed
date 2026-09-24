import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

function agoLabel(iso: string | null): string {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins <= 0) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
}

export function TopBar({ fetchedAt, refreshing }: { fetchedAt: string | null; refreshing: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="size-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">ScamShield</span>
        </div>
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <span className="font-display tabular-nums text-foreground">
            {now ? now.toLocaleTimeString() : "--:--:--"}
          </span>
          <span className="text-muted-foreground">
            Last updated: {refreshing ? "refreshing…" : agoLabel(fetchedAt)}
          </span>
        </div>
      </div>
    </header>
  );
}
