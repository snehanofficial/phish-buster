/**
 * server.js — PhishBuster Express entry point
 *
 * Middleware stack:
 *  - helmet    : sets secure HTTP headers
 *  - cors      : allows the Vite dev server (port 5173) to call us
 *  - rateLimit : 60 requests / minute per IP
 *  - express.json : parses JSON body
 *
 * Routes (so far):
 *  POST /analyze  →  heuristic URL analysis
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import analyzeRouter from "./routes/analyze.js";
import aiCheckRouter from "./routes/aiCheck.js";
import logRouter from "./routes/log.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS: allow Vite dev server + production origin ─────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:5173", // Vite default
  "http://localhost:5174", // Vite fallback port
  "http://localhost:3000",
  "http://[IP_ADDRESS]",
  process.env.CLIENT_ORIGIN, // set in .env for prod
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, same-origin)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin "${origin}" not allowed`));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Rate limiting: 60 req / min per IP ──────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — slow down and try again in a minute." },
});
app.use(limiter);

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/analyze", analyzeRouter);
app.use("/ai-check", aiCheckRouter);
app.use("/log", logRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));


// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  PhishBuster API running on http://localhost:${PORT}`);
  console.log(`    POST http://localhost:${PORT}/analyze    — heuristic analysis`);
  console.log(`    POST http://localhost:${PORT}/ai-check   — AI classification`);
  console.log(`    POST http://localhost:${PORT}/log        — log a threat`);
  console.log(`    GET  http://localhost:${PORT}/logs       — dashboard data`);
  console.log(`    GET  http://localhost:${PORT}/health     — health check`);
});
