/**
 * useAnalyzer.js
 * Custom hook that orchestrates the full analysis flow:
 *   1. POST /analyze  → heuristic
 *   2. POST /ai-check → AI
 *   3. combineScores  → finalScore + label
 */

import { useState, useCallback } from "react";
import { api } from "../api";

function combineScores(heuristicScore, aiConfidence, aiLabel) {
  const weights = { Phishing: 1.0, Suspicious: 0.5, Safe: 0.0 };
  const w = weights[aiLabel] ?? 0.5;
  const finalScore = Math.min(100, Math.round(heuristicScore * 0.6 + aiConfidence * w * 0.4));
  const label = finalScore >= 70 ? "Phishing" : finalScore >= 30 ? "Suspicious" : "Safe";
  return { finalScore, label };
}

export function useAnalyzer() {
  const [state, setState] = useState({
    status: "idle",    // idle | loading | done | error
    step: "",          // "heuristic" | "ai" | "combining"
    result: null,
    error: null,
  });

  const analyze = useCallback(async (url) => {
    setState({ status: "loading", step: "heuristic", result: null, error: null });

    try {
      // Step 1 — heuristic
      const hData = await api.analyze(url);

      setState((s) => ({ ...s, step: "ai" }));

      // Step 2 — AI
      const aiData = await api.aiCheck(url);

      setState((s) => ({ ...s, step: "combining" }));

      // Step 3 — combine
      const risk = combineScores(
        hData.heuristic.score,
        aiData.ai.confidence,
        aiData.ai.label
      );

      setState({
        status: "done",
        step: "",
        result: {
          url,
          domain: hData.domain,
          heuristic: hData.heuristic,
          ai: aiData.ai,
          risk,
        },
        error: null,
      });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.message ||
        "Unknown error";
      setState({ status: "error", step: "", result: null, error: msg });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle", step: "", result: null, error: null });
  }, []);

  return { ...state, analyze, reset };
}
