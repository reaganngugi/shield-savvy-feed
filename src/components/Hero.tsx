import { ArrowDown, Radar } from "lucide-react";

export function Hero({ alertCount }: { alertCount: number }) {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Radar className="size-3.5" />
        Live scam intelligence · {alertCount} alerts tracked
      </span>
      <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] font-bold sm:text-6xl">
        Stay One Step Ahead of Scammers
      </h1>
      <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
        Real-time fraud alerts from news, Reddit and YouTube — plus an instant risk check for any
        suspicious message that lands in your inbox.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <a
          href="#feed"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Get Started <ArrowDown className="size-4" />
        </a>
        <a
          href="#check"
          className="inline-flex items-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
        >
          Check a message
        </a>
      </div>
    </section>
  );
}
