# knox by nzoia 🛡️

A real-time scam alert dashboard that pulls the latest scam, fraud, and phishing
news from multiple free sources and lets you analyze suspicious messages for
risk — built as a high school project.

> Built by **Daniel, Tamira & Ngugi**, Moi High School – Kabarak — 2026

## Features

- **Live Alert Feed** — fetches from four free, no-API-key sources every 5 minutes:
  - Google News RSS (`scam OR fraud OR phishing`)
  - Bing News RSS (`scam warning`)
  - Reddit `r/scams` JSON (User-Agent `knoxbynzoia/1.0`)
  - YouTube public search (`scam alert warning`)
- **Risk-coded cards** — colored left border by severity:
  red (critical), orange (high), yellow (medium), green (low)
- **Source badges** — News / Reddit / YouTube
- **Filter tabs** — All | News | Reddit | YouTube | High Risk Only
- **Keyword search** across the feed
- **Check It analyzer** — paste a suspicious message, get a structured
  risk report (scam type, risk level, red flags, advice, confidence) via
  Lovable's built-in AI (Lovable AI Gateway, `openai/gpt-6-astra`).
- **Report a Scam** — submit and view community reports (stored in `localStorage`).
- **Our School** — background on Moi High School – Kabarak.
- **Dark green theme**, mobile responsive, `localStorage` cache for instant reload.

## Tech Stack

- **Framework:** TanStack Start v1 (React 19, SSR) on Vite 7
- **Styling:** Tailwind CSS v4 (dark green oklch theme)
- **Fonts:** Space Grotesk (display) + DM Sans (body)
- **Backend logic:** TanStack server functions (runs on Cloudflare Workers)
- **AI:** Lovable AI Gateway (no separate API key needed)
- **No database** — in-memory + `localStorage` only

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app runs at `http://localhost:8080`.

### Build for production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── TopBar.tsx        # sticky bar: app name, live clock, "last updated"
│   ├── Hero.tsx          # landing hero + Get Started
│   ├── AlertCard.tsx     # feed card with risk border + source badge
│   ├── CheckIt.tsx       # suspicious-message analyzer + result card
│   ├── ReportScam.tsx    # report form + community reports list
│   └── SchoolSection.tsx # Moi High School – Kabarak info
├── lib/
│   ├── feed.functions.ts    # server fn: fetches all 4 sources, dedup, risk score
│   └── analyze.functions.ts  # server fn: AI analysis via Lovable AI Gateway
├── routes/
│   ├── __root.tsx       # root layout + fonts
│   └── index.tsx        # main page: feed, filters, search, sections, footer
└── styles.css           # Tailwind v4 theme (dark green)
```

## Constraints

- ✅ No API keys required (uses free RSS/JSON feeds + Lovable AI Gateway)
- ✅ No paid services
- ✅ Runs with `npm install && npm run dev`
- ✅ Under 20 source files
- ✅ `localStorage` cache for instant reload

## Notes

The AI analyzer uses Lovable's built-in AI Gateway, which is already
configured for this project — no separate API key or local model is needed.
The alert feed refreshes automatically every 5 minutes and falls back to a
cached copy if a refresh fails.
