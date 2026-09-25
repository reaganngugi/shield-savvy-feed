import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ScanSearch, Volume2, Square } from "lucide-react";
import { useEffect, useState } from "react";
import { analyzeMessage, type Analysis } from "@/lib/analyze.functions";
import { RiskBadge } from "./AlertCard";

export function CheckIt() {
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
  const analyze = useServerFn(analyzeMessage);
  const mutation = useMutation<Analysis, Error, { text: string; context: string }>({
    mutationFn: ({ text: value, context: extraContext }) =>
      analyze({ data: { text: value, context: extraContext } }),
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
        <label htmlFor="analysis-context" className="mt-4 block text-sm font-medium text-foreground">
          Additional context
        </label>
        <textarea
          id="analysis-context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={3}
          placeholder="Add any details about who sent the message, where it came from, or the situation around it."
          className="mt-2 w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!text.trim() || mutation.isPending}
            onClick={() => mutation.mutate({ text: text.trim(), context: context.trim() })}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending ? "Analyzing…" : "Analyze"}
          </button>
          {(text || context) && (
            <button
              type="button"
              onClick={() => {
                setText("");
                setContext("");
                mutation.reset();
              }}
              className="text-sm text-muted-foreground transition hover:text-foreground"
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
      return;
    }

    const syncVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      setSpeechSupported(true);

      if (!selectedVoiceName || !availableVoices.some((voice) => voice.name === selectedVoiceName)) {
        const preferred =
          availableVoices.find((voice) => /microsoft|edge/i.test(voice.name) && /en/i.test(voice.lang)) ??
          availableVoices.find((voice) => /en/i.test(voice.lang)) ??
          availableVoices[0];

        if (preferred) setSelectedVoiceName(preferred.name);
      }
    };

    syncVoices();
    window.speechSynthesis.onvoiceschanged = syncVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceName]);

  const speakSummary = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const textToSpeak = [
      result.summary,
      `Targets: ${result.target_audience}.`,
      ...result.red_flags.map((flag) => `Red flag: ${flag}.`),
      ...result.advice.map((tip) => `Advice: ${tip}.`),
    ].join(" ");

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const availableVoices = synth.getVoices();
    const preferredVoice =
      availableVoices.find((voice) => voice.name === selectedVoiceName) ??
      availableVoices.find((voice) => /microsoft|edge/i.test(voice.name) && /en/i.test(voice.lang)) ??
      availableVoices.find((voice) => /en/i.test(voice.lang)) ??
      availableVoices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang || "en-US";
    }

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

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
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-medium">{result.summary}</p>
        {speechSupported && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={isSpeaking ? stopSpeaking : speakSummary}
              className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/15"
              aria-label={isSpeaking ? "Stop reading the analysis aloud" : "Read the analysis aloud"}
            >
              {isSpeaking ? <Square className="size-3.5 fill-current" /> : <Volume2 className="size-3.5" />}
              {isSpeaking ? "Stop" : "Read aloud (Edge)"}
            </button>
            {voices.length > 0 && (
              <select
                aria-label="Choose a speech voice"
                value={selectedVoiceName}
                onChange={(event) => setSelectedVoiceName(event.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-2 text-xs text-foreground outline-none focus:border-primary/60"
              >
                {voices.map((voice) => (
                  <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
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
