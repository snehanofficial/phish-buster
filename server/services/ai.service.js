/**
 * ai.service.js
 * Calls OpenRouter (Gemma 3 4B) to classify whether a URL is phishing.
 *
 * Returns: { label: "Safe"|"Suspicious"|"Phishing", confidence: 0-100, reason: string }
 */

import https from "https";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Free tier on OpenRouter — cycle through if one is down
const MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "qwen/qwen3-coder:free"
];

/**
 * Build the system + user prompt sent to the model.
 * We ask for strict JSON so parsing stays simple.
 */
function buildPrompt(url) {
  return {
    system: `You are a cybersecurity expert specializing in phishing detection.
Analyze the given URL and respond ONLY with a JSON object — no markdown, no prose.
The JSON must have exactly these fields:
{
  "label": "Safe" | "Suspicious" | "Phishing",
  "confidence": <integer 0-100>,
  "reason": "<one sentence explanation>"
}`,
    user: `Analyze this URL for phishing indicators: ${url}`,
  };
}

/**
 * Parse the model's text response into a structured object.
 * Falls back gracefully if the model returns garbled output.
 */
function parseAIResponse(text) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();

  // Find the first {...} block
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");

  const parsed = JSON.parse(match[0]);

  const VALID_LABELS = ["Safe", "Suspicious", "Phishing"];
  const label = VALID_LABELS.includes(parsed.label) ? parsed.label : "Suspicious";
  const confidence = Math.min(100, Math.max(0, Number(parsed.confidence) || 50));
  const reason = typeof parsed.reason === "string" ? parsed.reason : "No reason provided.";

  return { label, confidence, reason };
}

/**
 * Main exported function.
 * @param {string} url
 * @returns {Promise<{ label: string, confidence: number, reason: string }>}
 */
export async function classifyWithAI(url) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("[AI] OPENROUTER_API_KEY not set — returning mock response");
    return { ...mockClassify(url), source: "mock" };
  }

  const { system, user } = buildPrompt(url);

  // Try each free model in order — return first success
  for (const model of MODELS) {
    try {
      const payload = JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 150,
        temperature: 0.1,
      });

      const responseText = await httpPost(OPENROUTER_API_URL, payload, {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:4000",
        "X-Title": "PhishBuster",
      });

      const data = JSON.parse(responseText);
      if (data.error) {
        console.warn(`[AI] Model ${model} error:`, data.error.message ?? data.error);
        continue; // try next model
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content) { console.warn(`[AI] Model ${model} returned empty content`); continue; }

      const result = parseAIResponse(content);
      return { ...result, source: model };
    } catch (err) {
      console.warn(`[AI] Model ${model} threw:`, err.message);
    }
  }

  // All models failed — use intelligent mock so demo keeps working
  console.warn("[AI] All models failed — falling back to mock");
  return { ...mockClassify(url), source: "mock-fallback" };
}

// ── Lightweight HTTP POST using built-in https (no axios dep needed) ─────────
function httpPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });

    req.on("error", reject);
    req.setTimeout(15_000, () => {
      req.destroy(new Error("AI request timed out after 15s"));
    });
    req.write(body);
    req.end();
  });
}

// ── Mock fallback when no API key is configured ──────────────────────────────
function mockClassify(url) {
  const lower = url.toLowerCase();
  const phishingSignals = ["paypal", "signin", "login", "verify", "account", "secure"];
  const hitCount = phishingSignals.filter((kw) => lower.includes(kw)).length;

  if (hitCount >= 3) return { label: "Phishing", confidence: 88, reason: "[MOCK] Multiple phishing keywords detected in URL." };
  if (hitCount >= 1) return { label: "Suspicious", confidence: 55, reason: "[MOCK] Some phishing-related terms found in URL." };
  return { label: "Safe", confidence: 90, reason: "[MOCK] No obvious phishing indicators detected." };
}
