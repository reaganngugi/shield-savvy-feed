import { MessageSquareWarning } from "lucide-react";
import { useEffect, useState } from "react";

export type CommunityReport = {
  id: string;
  what: string;
  when: string;
  how: string;
  createdAt: string;
};

const STORAGE_KEY = "scamshield.reports";
const HOW_OPTIONS = [
  { value: "news", label: "News" },
  { value: "friend", label: "A friend" },
  { value: "tried-to-report", label: "Tried to report it" },
  { value: "other", label: "Other" },
];

export function ReportScam() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [open, setOpen] = useState(false);
  const [what, setWhat] = useState("");
  const [when, setWhen] = useState("");
  const [how, setHow] = useState("news");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReports(JSON.parse(raw) as CommunityReport[]);
    } catch {
      /* ignore unreadable cache */
    }
  }, []);

  const save = (next: CommunityReport[]) => {
    setReports(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked */
    }
  };

  const submit = () => {
    if (!what.trim()) return;
    save([
      {
        id: `${Date.now()}`,
        what: what.trim(),
        when: when || new Date().toISOString().slice(0, 10),
        how,
        createdAt: new Date().toISOString(),
      },
      ...reports,
    ]);
    setWhat("");
    setWhen("");
    setHow("news");
    setOpen(false);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold sm:text-2xl">Community Reports</h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          <MessageSquareWarning className="size-4" />
          {open ? "Close form" : "Report a Scam"}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-surface p-5">
          <div>
            <label htmlFor="what" className="text-sm font-medium">
              What happened?
            </label>
            <textarea
              id="what"
              rows={4}
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="when" className="text-sm font-medium">
                When?
              </label>
              <input
                id="when"
                type="date"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div>
              <label htmlFor="how" className="text-sm font-medium">
                How did you find out?
              </label>
              <select
                id="how"
                value={how}
                onChange={(e) => setHow(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
              >
                {HOW_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!what.trim()}
            className="justify-self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            Submit report
          </button>
        </div>
      )}

      <div className="mt-5 grid gap-3">
        {reports.length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No community reports yet. Be the first to share what you saw.
          </p>
        )}
        {reports.map((r) => (
          <article key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-semibold text-foreground">
                Community
              </span>
              <span>{r.when}</span>
              <span>·</span>
              <span>
                Found via {HOW_OPTIONS.find((o) => o.value === r.how)?.label.toLowerCase() ?? r.how}
              </span>
            </div>
            <p className="mt-2 text-sm">{r.what}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
