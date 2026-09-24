import { createServerFn } from "@tanstack/react-start";

export type AlertSource = "News" | "Reddit" | "YouTube";
export type RiskLevel = "critical" | "high" | "medium" | "low";

export type Alert = {
  id: string;
  title: string;
  source: AlertSource;
  origin: string;
  date: string | null;
  summary: string;
  url: string;
  risk: RiskLevel;
};

const UA = "ScamShield/1.0";

function stripHtml(input: string): string {
  return decodeEntities(input.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m?.[1] ? decodeEntities(m[1]).trim() : "";
}

const CRITICAL = [
  "arrest",
  "warrant",
  "wire transfer",
  "life savings",
  "millions",
  "elderly",
  "deepfake",
  "ransom",
  "sextortion",
];
const HIGH = [
  "phishing",
  "gift card",
  "crypto",
  "bitcoin",
  "bank",
  "irs",
  "social security",
  "romance",
  "impersonat",
  "tech support",
  "steal",
  "stolen",
  "victim",
];
const MEDIUM = ["scam", "fraud", "warning", "alert", "suspicious", "fake", "spoof"];

function scoreRisk(text: string): RiskLevel {
  const t = text.toLowerCase();
  if (CRITICAL.some((k) => t.includes(k))) return "critical";
  if (HIGH.filter((k) => t.includes(k)).length >= 2) return "critical";
  if (HIGH.some((k) => t.includes(k))) return "high";
  if (MEDIUM.some((k) => t.includes(k))) return "medium";
  return "low";
}

async function safeText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "*/*" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseRss(xml: string, origin: string): Alert[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return items.slice(0, 20).map((item, i) => {
    const title = stripHtml(tag(item, "title"));
    const rawLink = tag(item, "link");
    const description = stripHtml(tag(item, "description"));
    const pubDate = tag(item, "pubDate");
    return {
      id: `${origin}-${i}-${title.slice(0, 40)}`,
      title: title || "Untitled alert",
      source: "News" as AlertSource,
      origin,
      date: pubDate || null,
      summary: description.slice(0, 220) || title,
      url: rawLink,
      risk: scoreRisk(`${title} ${description}`),
    };
  });
}

async function googleNews(): Promise<Alert[]> {
  const xml = await safeText(
    "https://news.google.com/rss/search?q=scam+OR+fraud+OR+phishing&hl=en-US&gl=US&ceid=US:en",
  );
  return xml ? parseRss(xml, "Google News") : [];
}

async function bingNews(): Promise<Alert[]> {
  const xml = await safeText("https://www.bing.com/news/search?q=scam+warning&format=RSS");
  return xml ? parseRss(xml, "Bing News") : [];
}

async function reddit(): Promise<Alert[]> {
  const body = await safeText(
    "https://www.reddit.com/r/scams/search.json?q=phone&restrict_sr=1&sort=new&limit=10",
  );
  if (!body) return [];
  try {
    const json = JSON.parse(body) as {
      data?: { children?: Array<{ data?: Record<string, unknown> }> };
    };
    const children = json.data?.children ?? [];
    return children.flatMap((child, i) => {
      const d = child.data;
      if (!d) return [];
      const title = String(d["title"] ?? "");
      const selftext = String(d["selftext"] ?? "");
      const created = Number(d["created_utc"] ?? 0);
      return [
        {
          id: `reddit-${String(d["id"] ?? i)}`,
          title: title || "Reddit report",
          source: "Reddit" as AlertSource,
          origin: "r/scams",
          date: created ? new Date(created * 1000).toISOString() : null,
          summary: (stripHtml(selftext) || title).slice(0, 220),
          url: `https://www.reddit.com${String(d["permalink"] ?? "")}`,
          risk: scoreRisk(`${title} ${selftext}`),
        },
      ];
    });
  } catch {
    return [];
  }
}

async function youtube(): Promise<Alert[]> {
  const html = await safeText(
    "https://www.youtube.com/results?search_query=scam+alert+warning&hl=en",
  );
  if (!html) return [];
  const match = html.match(/var ytInitialData = ([\s\S]*?);<\/script>/);
  if (!match?.[1]) return [];
  try {
    const data = JSON.parse(match[1]) as unknown;
    const out: Alert[] = [];
    const walk = (node: unknown) => {
      if (out.length >= 10 || node == null || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      const obj = node as Record<string, unknown>;
      const vr = obj["videoRenderer"] as Record<string, unknown> | undefined;
      if (vr && typeof vr["videoId"] === "string") {
        const title =
          (
            (vr["title"] as { runs?: Array<{ text?: string }> } | undefined)?.runs?.[0]?.text ?? ""
          ).trim() || "YouTube video";
        const snippet =
          (
            vr["detailedMetadataSnippets"] as
              | Array<{ snippetText?: { runs?: Array<{ text?: string }> } }>
              | undefined
          )?.[0]?.snippetText?.runs
            ?.map((r) => r.text ?? "")
            .join("") ?? "";
        const published =
          (vr["publishedTimeText"] as { simpleText?: string } | undefined)?.simpleText ?? "";
        out.push({
          id: `yt-${String(vr["videoId"])}`,
          title,
          source: "YouTube",
          origin: published ? `YouTube · ${published}` : "YouTube",
          date: null,
          summary: (snippet || title).slice(0, 220),
          url: `https://www.youtube.com/watch?v=${String(vr["videoId"])}`,
          risk: scoreRisk(`${title} ${snippet}`),
        });
      }
      Object.values(obj).forEach(walk);
    };
    walk(data);
    return out.slice(0, 10);
  } catch {
    return [];
  }
}

export const fetchAlerts = createServerFn({ method: "GET" }).handler(async () => {
  const [g, b, r, y] = await Promise.all([googleNews(), bingNews(), reddit(), youtube()]);
  const seen = new Set<string>();
  const alerts = [...g, ...b, ...r, ...y].filter((a) => {
    const key = a.title.toLowerCase().slice(0, 60);
    if (!a.url || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { alerts, fetchedAt: new Date().toISOString() };
});
