import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `You are an expert fraud and scam detection analyst. Analyze the provided content and determine if it is REPORTING a scam or IS a scam itself.

Score these red flags (0-3 each):
1. URGENCY: Pressure to act immediately
2. IMPERSONATION: Claiming to be a bank, government agency, or brand
3. FINANCIAL REQUEST: Asking for money, gift cards, crypto, or payment details
4. PERSONAL INFO: Requesting SSN, passwords, PINs, or account numbers
5. TOO GOOD TO BE TRUE: Unrealistic offers or returns
6. SUSPICIOUS LINKS: Shortened URLs, lookalike domains
7. PLATFORM SHIFT: Trying to move conversation to WhatsApp/Telegram
8. AI-GENERATED SIGNS: Overly polished or unnatural language

Return STRICT JSON only.`;

export const AnalysisSchema = z.object({
  is_scam_report: z.boolean(),
  scam_type: z.string(),
  risk_level: z.enum(["low", "medium", "high", "critical"]),
  red_flags: z.array(z.string()),
  target_audience: z.string(),
  summary: z.string(),
  advice: z.array(z.string()),
  confidence: z.number(),
});

const parseInput = z.object({
  text: z.string().min(1).max(8000),
  context: z.string().max(4000).optional(),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "is_scam_report",
    "scam_type",
    "risk_level",
    "red_flags",
    "target_audience",
    "summary",
    "advice",
    "confidence",
  ],
  properties: {
    is_scam_report: { type: "boolean" },
    scam_type: {
      type: "string",
      enum: [
        "romance",
        "tech_support",
        "phishing",
        "investment",
        "impersonation",
        "prize",
        "crypto",
        "other",
        "none",
      ],
    },
    risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
    red_flags: { type: "array", items: { type: "string" } },
    target_audience: { type: "string" },
    summary: { type: "string" },
    advice: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
  },
} as const;

function buildFallbackAnalysis(text: string, context?: string): Analysis {
  const combined = [text, context].filter(Boolean).join(" ");
  const normalized = combined.toLowerCase();
  const redFlags: string[] = [];

  if (/urgent|immediately|act now|today only|expires soon|final notice|must respond/i.test(normalized)) {
    redFlags.push("Urgent pressure to act immediately.");
  }
  if (/bank|government|irs|paypal|apple support|microsoft support|police|amazon|fedex|ups/i.test(normalized)) {
    redFlags.push("Claims to be a trusted organization or brand.");
  }
  if (/gift card|bitcoin|crypto|wire transfer|zelle|venmo|cash app|paypal.*send|send.*money/i.test(normalized)) {
    redFlags.push("Requests payment or account funds through unusual channels.");
  }
  if (/password|pin|otp|ssn|social security|account number|login|verify.*account/i.test(normalized)) {
    redFlags.push("Requests sensitive personal or account details.");
  }
  if (/click here|bit.ly|tinyurl|shorturl|link.*verify|login.*link/i.test(normalized)) {
    redFlags.push("Includes suspicious links or a forced login step.");
  }
  if (/whatsapp|telegram|signal|text me|dm me|move this chat/i.test(normalized)) {
    redFlags.push("Attempts to move the conversation off trusted channels.");
  }

  const scamSignals = [
    /gift card|bitcoin|crypto|wire transfer|zelle|venmo|cash app|bank account/i,
    /urgent|act now|final notice|today only|immediately/i,
    /password|otp|pin|ssn|social security|verify account|login to secure/i,
    /whatsapp|telegram|signal|dm me|text me/i,
    /claim.*prize|winner|congratulations|free money/i,
  ].filter((pattern) => pattern.test(normalized)).length;

  const isScamReport = /report.*scam|warn.*scam|suspicious.*message|flag.*fraud|scam alert/i.test(normalized);
  const isPotentialScam = scamSignals >= 2 || redFlags.length >= 2;

  const scamType =
    /gift card|bitcoin|crypto|wallet|transfer/i.test(normalized)
      ? "crypto"
      : /romance|love|dating|relationship/i.test(normalized)
        ? "romance"
        : /support|tech|windows|microsoft|apple|google/i.test(normalized)
          ? "tech_support"
          : /bank|government|irs|paypal|amazon|fedex|ups/i.test(normalized)
            ? "impersonation"
            : /winner|prize|lottery|gift|claim/i.test(normalized)
              ? "prize"
              : isScamReport
                ? "none"
                : "other";

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  if (redFlags.length >= 4 || /life savings|arrest|warrant|bank account.*drain|wire transfer.*immediately/i.test(normalized)) {
    riskLevel = "critical";
  } else if (redFlags.length >= 3 || scamSignals >= 4) {
    riskLevel = "high";
  } else if (redFlags.length >= 2 || scamSignals >= 2) {
    riskLevel = "medium";
  }

  const confidence = Math.min(0.96, 0.58 + redFlags.length * 0.08 + scamSignals * 0.05);

  const summary =
    isScamReport
      ? "This message appears to be reporting a scam or suspicious activity rather than itself being the scam attempt."
      : isPotentialScam
        ? "This message contains multiple scam indicators and should be treated as high risk until verified independently."
        : "This message does not strongly resemble a scam pattern, but it still warrants careful verification before taking action.";

  const advice = [
    "Do not click links or reply immediately without verifying the sender through a trusted official channel.",
    "Never share passwords, one-time codes, account numbers, or payment details by message or email.",
    "If the message claims urgency, contact the company or institution directly using a known official phone number or website.",
  ];

  return AnalysisSchema.parse({
    is_scam_report: isScamReport,
    scam_type: isScamReport ? "none" : scamType,
    risk_level: riskLevel,
    red_flags: redFlags.length ? redFlags : ["No major scam patterns were detected from the supplied text."],
    target_audience: "general online users and students",
    summary,
    advice,
    confidence: Number(confidence.toFixed(2)),
  });
}

export const analyzeMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => parseInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return buildFallbackAnalysis(data.text, data.context);

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          instructions: SYSTEM_PROMPT,
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: data.context
                    ? `Additional context:\n${data.context}\n\nAnalyze this content and return strict JSON:\n\n${data.text}`
                    : `Analyze this content and return strict JSON:\n\n${data.text}`,
                },
              ],
            },
          ],
          stream: true,
          store: false,
          reasoning: { effort: "low", summary: "auto" },
          include: ["reasoning.encrypted_content"],
          text: {
            format: {
              type: "json_schema",
              name: "scam_analysis",
              strict: true,
              schema: jsonSchema,
            },
          },
        }),
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        if (res.status === 402)
          throw new Error("AI credits are exhausted. Add credits to keep analyzing messages.");
        if (res.status === 429)
          throw new Error("Too many analyses right now — wait a moment and try again.");
        throw new Error(`Analysis failed (${res.status}). ${detail.slice(0, 200)}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        if (chunk.value) buffer += decoder.decode(chunk.value, { stream: true });
        let idx = buffer.indexOf("\n");
        while (idx !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (line.startsWith("data:")) {
            const payload = line.slice(5).trim();
            if (payload && payload !== "[DONE]") {
              try {
                const evt = JSON.parse(payload) as {
                  type?: string;
                  delta?: string;
                  response?: { output_text?: string };
                };
                if (evt.type === "response.output_text.delta" && evt.delta) text += evt.delta;
                if (evt.type === "response.completed" && evt.response?.output_text)
                  text = evt.response.output_text;
              } catch {
                /* ignore partial event */
              }
            }
          }
          idx = buffer.indexOf("\n");
        }
      }

      const cleaned = text.trim().replace(/^```json\s*|```$/g, "");
      if (!cleaned) throw new Error("The analyzer returned an empty result. Try again.");
      return AnalysisSchema.parse(JSON.parse(cleaned));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown AI error";
      if (message.includes("not configured") || message.includes("Analysis failed") || message.includes("AI credits")) {
        return buildFallbackAnalysis(data.text, data.context);
      }
      throw error;
    }
  });
