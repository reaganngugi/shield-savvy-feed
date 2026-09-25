import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { aboutSections, aboutSummary } from "@/lib/about-content";

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
  const [aboutOpen, setAboutOpen] = useState(false);

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
            <span className="text-xl" aria-label="Vault door">
              🚪
            </span>
          </span>
          <span className="font-display text-lg font-bold tracking-tight">knox by nzoia</span>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAboutOpen((value) => !value)}
              aria-expanded={aboutOpen}
              aria-label="Open about information"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/80 px-3 py-2 font-medium text-foreground transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10"
            >
              <Info className="size-4 text-primary" />
              About
            </button>

            {aboutOpen && (
              <div className="absolute right-0 z-40 mt-3 w-[min(32rem,82vw)] max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/20">
                <p className="text-sm font-medium text-primary">Why this matters</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{aboutSummary}</p>

                <div className="mt-4 space-y-3">
                  {aboutSections.map((section) => (
                    <div key={section.title} className="rounded-xl border border-border/70 bg-background/50 p-3">
                      <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="font-display tabular-nums text-foreground">
            {now ? now.toLocaleTimeString() : "--:--:--"}
          </span>
          <span className="hidden text-muted-foreground sm:inline">
            Last updated: {refreshing ? "refreshing…" : agoLabel(fetchedAt)}
          </span>
        </div>
      </div>
    </header>
  );
}
