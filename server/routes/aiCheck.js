/**
 * routes/aiCheck.js
 * POST /ai-check — calls AI service, returns label + confidence + reason.
 */

import { Router } from "express";
import { z } from "zod";
import { classifyWithAI } from "../services/ai.service.js";

const router = Router();

const AiCheckSchema = z.object({
  url: z.string().url({ message: "Invalid URL. Include the scheme (https://...)" }),
});

// POST /ai-check
router.post("/", async (req, res) => {
  // 1. Validate
  const parsed = AiCheckSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { url } = parsed.data;

  // 2. Call AI
  try {
    const result = await classifyWithAI(url);
    return res.json({ url, ai: result });
  } catch (err) {
    console.error("[/ai-check] AI call failed:", err.message);
    return res.status(502).json({
      error: "AI classification failed",
      detail: err.message,
    });
  }
});

export default router;
