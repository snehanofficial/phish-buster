/**
 * routes/log.js
 *
 * POST /log
 *   Accepts a completed analysis result, generates a SHA256 hash and a fake
 *   blockchain TX hash, then stores the entry in-memory.
 *   Returns the stored log entry (including hashes).
 *
 * GET /logs
 *   Returns all stored log entries, newest first.
 */

import { Router } from "express";
import { createHash, randomBytes } from "crypto";
import { z } from "zod";

const router = Router();

// ── In-memory "blockchain" log ────────────────────────────────────────────────
// Each entry is immutable once written (we never mutate the array items).
const threatLog = [];

// ── Zod schema ────────────────────────────────────────────────────────────────
const LogSchema = z.object({
  url: z.string().url(),
  heuristic: z.object({
    score: z.number(),
    label: z.string(),
    flags: z.array(z.string()),
  }),
  ai: z.object({
    label: z.string(),
    confidence: z.number(),
    reason: z.string(),
    source: z.string().optional(),
  }),
  risk: z.object({
    finalScore: z.number(),
    label: z.string(),
  }),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * SHA256 of  url + aiLabel + timestamp  (matches SRS §3.4)
 */
function generateHash(url, aiLabel, timestamp) {
  return createHash("sha256")
    .update(`${url}|${aiLabel}|${timestamp}`)
    .digest("hex");
}

/**
 * Fake "blockchain" TX hash — looks like a real Ethereum tx hash.
 * Prefix 0x + 64 random hex chars.
 */
function generateTxHash() {
  return "0x" + randomBytes(32).toString("hex");
}

/**
 * Every entry in the log links to the previous entry's hash (like a real chain).
 */
function getPrevHash() {
  if (threatLog.length === 0) return "0".repeat(64); // genesis block
  return threatLog[threatLog.length - 1].hash;
}

// ── POST /log ─────────────────────────────────────────────────────────────────
router.post("/", (req, res) => {
  const parsed = LogSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { url, heuristic, ai, risk } = parsed.data;
  const timestamp = new Date().toISOString();

  const hash = generateHash(url, ai.label, timestamp);
  const txHash = generateTxHash();
  const prevHash = getPrevHash();

  const entry = {
    id: threatLog.length + 1,
    url,
    domain: (() => { try { return new URL(url).hostname; } catch { return url; } })(),
    heuristic,
    ai,
    risk,
    hash,       // SHA256 of content
    txHash,     // fake blockchain TX
    prevHash,   // chain link to previous entry
    timestamp,
  };

  threatLog.push(entry);

  console.log(`[LOG] #${entry.id} logged — risk: ${risk.label} (${risk.finalScore}) — ${url}`);

  return res.status(201).json({ success: true, entry });
});

// ── GET /logs ─────────────────────────────────────────────────────────────────
router.get("/", (_req, res) => {
  // Return newest first
  return res.json({
    count: threatLog.length,
    logs: [...threatLog].reverse(),
  });
});

// ── GET /logs/:id ─────────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const entry = threatLog.find((e) => e.id === Number(req.params.id));
  if (!entry) return res.status(404).json({ error: "Log entry not found" });
  return res.json(entry);
});

export default router;
