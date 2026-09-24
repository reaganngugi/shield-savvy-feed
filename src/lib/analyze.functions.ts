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

export const analyzeMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ text: z.string().min(1).max(8000) }).parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured.");

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
                text: `Analyze this content and return strict JSON:\n\n${data.text}`,
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
  });
