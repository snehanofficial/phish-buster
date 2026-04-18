/**
 * services/risk.js
 * Combines heuristic score + AI result → final risk score + label.
 *
 * Formula (from implementation plan):
 *   finalScore = heuristicScore * 0.6 + aiContribution * 0.4
 *
 * AI contribution is derived from confidence weighted by label severity:
 *   Phishing    → full confidence value
 *   Suspicious  → half confidence value
 *   Safe        → 0
 *
 * Score → Label:
 *   0–29  → Safe
 *   30–69 → Suspicious
 *   70+   → Phishing 🚨
 */

const LABEL_WEIGHTS = { Phishing: 1.0, Suspicious: 0.5, Safe: 0.0 };

/**
 * @param {number} heuristicScore   0–100 from heuristic engine
 * @param {number} aiConfidence     0–100 from AI service
 * @param {string} aiLabel          "Safe" | "Suspicious" | "Phishing"
 * @returns {{ finalScore: number, label: string, breakdown: object }}
 */
export function combineScores(heuristicScore, aiConfidence, aiLabel) {
  const weight = LABEL_WEIGHTS[aiLabel] ?? 0.5;
  const aiContribution = aiConfidence * weight;

  // Weighted blend: heuristic carries 60%, AI carries 40%
  const finalScore = Math.round(heuristicScore * 0.6 + aiContribution * 0.4);
  const capped = Math.min(100, Math.max(0, finalScore));

  const label = capped >= 70 ? "Phishing" : capped >= 30 ? "Suspicious" : "Safe";

  return {
    finalScore: capped,
    label,
    breakdown: {
      heuristicContribution: Math.round(heuristicScore * 0.6),
      aiContribution: Math.round(aiContribution * 0.4),
    },
  };
}
