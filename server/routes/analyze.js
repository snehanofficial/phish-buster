/**
 * routes/analyze.js
 * POST /analyze — validates URL, runs heuristics, returns score + flags.
 */

import { Router } from "express";
import { z } from "zod";
import { runHeuristics } from "../services/heuristic.js";

const router = Router();

// ── Zod schema: only accept a valid URL string ──────────────────────────────
const AnalyzeSchema = z.object({
  url: z.string().url({ message: "Invalid URL. Include the scheme (https://...)" }),
});

// ── Derive a human-readable label from a numeric risk score ─────────────────
function getLabel(score) {
  if (score < 30) return "Safe";
  if (score < 70) return "Suspicious";
  return "Phishing";
}

// ── POST /analyze ────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  // 1. Validate request body
  const parsed = AnalyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { url } = parsed.data;

  // 2. Parse the URL (guaranteed valid after Zod check)
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: "Could not parse URL." });
  }

  // 3. Run heuristic engine
  const { score, flags } = runHeuristics(parsedUrl);

  // 4. Build + return response
  return res.json({
    url,
    domain: parsedUrl.hostname,
    protocol: parsedUrl.protocol,
    heuristic: {
      score,              // 0–100
      label: getLabel(score),
      flags,              // array of human-readable warnings
    },
  });
});

export default router;
