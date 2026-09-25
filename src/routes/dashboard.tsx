import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AlertCard } from "@/components/AlertCard";
import { CheckIt } from "@/components/CheckIt";
import { Hero } from "@/components/Hero";
import { ReportScam } from "@/components/ReportScam";
import { SchoolSection } from "@/components/SchoolSection";
import { TopBar } from "@/components/TopBar";
import { fetchAlerts, type Alert } from "@/lib/feed.functions";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "knox by nzoia — Real-Time Scam Alert Dashboard" },
      {
        name: "description",
        content:
          "Live scam, fraud and phishing alerts from news, Reddit and YouTube, plus an instant risk check for any suspicious message.",
      },
      { property: "og:title", content: "knox by nzoia — Stay One Step Ahead of Scammers" },
      {
        property: "og:description",
        content:
          "A real-time scam alert feed with an AI-powered risk breakdown for suspicious messages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

type Cache = { alerts: Alert[]; fetchedAt: string };
const CACHE_KEY = "knoxbynzoia.feed";
const TABS = ["All", "News", "Reddit", "YouTube", "High Risk Only"] as const;
type Tab = (typeof TABS)[number];

function Dashboard() {
  const load = useServerFn(fetchAlerts);
  const [cached, setCached] = useState<Cache | null>(null);
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) setCached(JSON.parse(raw) as Cache);
    } catch {
      /* ignore unreadable cache */
    }
  }, []);

  const { data, isFetching } = useQuery<Cache>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const result = (await load()) as Cache;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      } catch {
        /* storage blocked */
      }
      return result;
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const feed = data ?? cached;
  const alerts = feed?.alerts ?? [];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alerts.filter((a) => {
      if (tab === "High Risk Only" && a.risk !== "high" && a.risk !== "critical") return false;
      if (tab !== "All" && tab !== "High Risk Only" && a.source !== tab) return false;
      if (q && !`${a.title} ${a.summary}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [alerts, tab, query]);

  return (
    <div className="min-h-screen">
      <TopBar fetchedAt={feed?.fetchedAt ?? null} refreshing={isFetching && !feed} />
      <Hero alertCount={alerts.length} />
      <CheckIt />

      <section id="feed" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">Live Alert Feed</h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search alerts by keyword"
              aria-label="Search alerts by keyword"
              className="w-full rounded-xl border border-input bg-background py-2.5 pr-3 pl-9 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {visible.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No alerts match this filter yet.
            </div>
          )}

          {visible.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </section>

      <ReportScam />
      <SchoolSection />
    </div>
  );
}
