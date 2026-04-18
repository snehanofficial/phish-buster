/**
 * api.js — thin Axios wrapper for the PhishBuster backend.
 * All calls go to http://localhost:4000
 */

import axios from "axios";

const BASE = "http://localhost:4000";

const http = axios.create({
  baseURL: BASE,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

export const api = {
  /** POST /analyze — heuristic score */
  analyze: (url) => http.post("/analyze", { url }).then((r) => r.data),

  /** POST /ai-check — AI label + confidence */
  aiCheck: (url) => http.post("/ai-check", { url }).then((r) => r.data),

  /** POST /log — save threat entry */
  logThreat: (payload) => http.post("/log", payload).then((r) => r.data),

  /** GET /log — fetch all logged threats */
  getLogs: () => http.get("/log").then((r) => r.data),
};
