import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ScanSearch } from "lucide-react";
import { useState } from "react";
import { analyzeMessage, type Analysis } from "@/lib/analyze.functions";
import { RiskBadge } from "./AlertCard";

export function CheckIt() {
  const [text, setText] = useState("");
  const analyze = useServerFn(analyzeMessage);
  const mutation = useMutation<Analysis, Error, string>({
    mutationFn: (value) => analyze({ data: { text: value } }),
  });

  return (
    <section id="check" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-primary/25 bg-surface/80 p-5 shadow-glow sm:p-7">
        <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <ScanSearch className="size-5 text-primary" /> Check It
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Paste a text, email or DM and get an instant scam risk breakdown.
        </p>
        <label htmlFor="suspect" className="sr-only">
          Paste a suspicious message here
        </label>
        <textarea
          id="suspect"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="Paste a suspicious message here"
          className="mt-4 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!text.trim() || mutation.isPending}
            onClick={() => mutation.mutate(text.trim())}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending ? "Analyzing…" : "Analyze"}
          </button>
          {text && (
            <button
              type="button"
              onClick={() => {
                setText("");
                mutation.reset();
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {mutation.isError && (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            {mutation.error.message}
          </p>
        )}

        {mutation.data && <AnalysisCard result={mutation.data} />}
      </div>
    </section>
  );
}

function AnalysisCard({ result }: { result: Analysis }) {
  const confidence = Math.round(Math.min(Math.max(result.confidence, 0), 1) * 100);
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <RiskBadge risk={result.risk_level} big />
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          {result.scam_type.replace(/_/g, " ")}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          {result.is_scam_report ? "Reports a scam" : "Possible scam itself"}
        </span>
      </div>
      <p className="mt-4 text-base font-medium">{result.summary}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">Targets: {result.target_audience}</p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase">Red flags</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {result.red_flags.length === 0 && <li>No clear red flags detected.</li>}
            {result.red_flags.map((flag) => (
              <li key={flag} className="flex gap-2">
                <span className="text-[var(--critical)]">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold tracking-wide uppercase">What to do</h3>
          <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {result.advice.map((step, i) => (
              <li key={step} className="flex gap-2">
                <span className="font-semibold text-primary">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Confidence</span>
          <span className="tabular-nums">{confidence}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${confidence}%` }} />
        </div>
      </div>
    </div>
  );
}
