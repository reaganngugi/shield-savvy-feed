import { ExternalLink } from "lucide-react";
import type { Alert, RiskLevel } from "@/lib/feed.functions";

const riskBorder: Record<RiskLevel, string> = {
  critical: "border-l-[var(--critical)]",
  high: "border-l-[var(--high)]",
  medium: "border-l-[var(--medium)]",
  low: "border-l-[var(--low)]",
};

const riskText: Record<RiskLevel, string> = {
  critical: "text-[var(--critical)] bg-[color-mix(in_oklch,var(--critical)_18%,transparent)]",
  high: "text-[var(--high)] bg-[color-mix(in_oklch,var(--high)_18%,transparent)]",
  medium: "text-[var(--medium)] bg-[color-mix(in_oklch,var(--medium)_18%,transparent)]",
  low: "text-[var(--low)] bg-[color-mix(in_oklch,var(--low)_18%,transparent)]",
};

export function RiskBadge({ risk, big = false }: { risk: RiskLevel; big?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wide ${riskText[risk]} ${
        big ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-[11px]"
      }`}
    >
      {risk}
    </span>
  );
}

function formatDate(date: string | null): string {
  if (!date) return "Recent";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function AlertCard({ alert }: { alert: Alert }) {
  return (
    <article
      className={`rounded-xl border border-border border-l-4 bg-card p-4 transition hover:border-primary/40 sm:p-5 ${riskBorder[alert.risk]}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-semibold text-foreground">
          {alert.source}
        </span>
        <RiskBadge risk={alert.risk} />
        <span>{alert.origin}</span>
        <span>·</span>
        <span>{formatDate(alert.date)}</span>
      </div>
      <h3 className="mt-2.5 text-base leading-snug font-bold sm:text-lg">{alert.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{alert.summary}</p>
      <a
        href={alert.url}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        Read more <ExternalLink className="size-3.5" />
      </a>
    </article>
  );
}
