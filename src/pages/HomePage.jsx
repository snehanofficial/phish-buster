import { useState, useEffect } from "react";
import { useAnalyzer } from "../hooks/useAnalyzer";
import ResultCard from "../components/ResultCard";
import PhishingAlert from "../components/PhishingAlert";

const STEP_LABELS = {
  heuristic: "Running heuristic checks…",
  ai: "Consulting AI model…",
  combining: "Combining scores…",
};

const DEMO_URLS = [
  "http://secure-login.paypal.com.xyz/verify/account",
  "https://totally-safe-bank-login.tk/signin",
  "https://github.com",
];

export default function HomePage() {
  const [input, setInput]       = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const { status, step, result, error, analyze, reset } = useAnalyzer();

  /* Show alert modal when analysis completes with Phishing label */
  useEffect(() => {
    if (status === "done" && result?.risk?.label === "Phishing") {
      // Small delay so the result card renders first
      const t = setTimeout(() => setShowAlert(true), 400);
      return () => clearTimeout(t);
    }
  }, [status, result]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = input.trim();
    if (!url) return;
    setShowAlert(false);
    analyze(url);
  };

  const handleDemo = (url) => {
    setInput(url);
    setShowAlert(false);
    analyze(url);
  };

  const handleReset = () => {
    reset();
    setInput("");
    setShowAlert(false);
  };

  return (
    <div className="page">
      {/* ── Phishing Alert Modal ── */}
      {showAlert && result && (
        <PhishingAlert
          url={result.url}
          score={result.risk.finalScore}
          onClose={() => setShowAlert(false)}
        />
      )}

      <main style={{ padding: "4rem 0 6rem" }}>
        <div className="container">

          {/* ── Hero ── */}
          {status !== "done" && (
            <div className="text-center mb-10 animate-fadeUp">
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "var(--accent-glow)",
                border: "1px solid var(--border-glow)",
                borderRadius: 999,
                padding: "0.35rem 1rem",
                fontSize: "0.8rem",
                color: "var(--accent)",
                marginBottom: "1.5rem",
                fontWeight: 600,
              }}>
                🛡️ AI-Powered Phishing Detection
              </div>

              <h1 style={{ marginBottom: "1rem" }}>
                Is this URL{" "}
                <span style={{ backgroundImage: "linear-gradient(135deg,var(--accent),var(--accent-2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  safe?
                </span>
              </h1>
              <p className="text-secondary" style={{ fontSize: "1.1rem", maxWidth: 520, margin: "0 auto" }}>
                Paste any suspicious URL. Our heuristic engine + AI model will analyze it in seconds.
              </p>
            </div>
          )}

          {/* ── Input Form ── */}
          {status !== "done" && (
            <form onSubmit={handleSubmit} className="card card--glow mb-6 animate-fadeUp animate-delay-1">
              <label htmlFor="url-input" className="text-sm text-muted" style={{ display: "block", marginBottom: "0.75rem" }}>
                🔗 Enter URL to analyze
              </label>
              <div className="flex gap-3" style={{ flexWrap: "wrap" }}>
                <input
                  id="url-input"
                  type="url"
                  className="input input--lg"
                  style={{ flex: 1, minWidth: 200 }}
                  placeholder="https://example.com/login"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={status === "loading"}
                  autoFocus
                />
                <button
                  id="btn-analyze"
                  type="submit"
                  className="btn btn--primary"
                  disabled={status === "loading" || !input.trim()}
                >
                  {status === "loading" ? <span className="spinner" /> : "🔍"}
                  {status === "loading" ? STEP_LABELS[step] || "Analyzing…" : "Analyze"}
                </button>
              </div>

              {/* Error */}
              {status === "error" && (
                <div style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1rem",
                  background: "var(--phishing-bg)",
                  border: "1px solid var(--phishing)",
                  borderRadius: 8,
                  color: "var(--phishing)",
                  fontSize: "0.875rem",
                }}>
                  ⚠️ {error}
                </div>
              )}
            </form>
          )}

          {/* ── Loading Steps ── */}
          {status === "loading" && (
            <div className="card animate-fadeIn mb-6" style={{ textAlign: "center", padding: "2.5rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4, margin: "0 auto" }} />
              </div>
              <p style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "0.5rem" }}>
                {STEP_LABELS[step] || "Analyzing…"}
              </p>
              <div className="flex gap-2 items-center justify-center mt-4">
                {["heuristic", "ai", "combining"].map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: s === step ? "var(--accent)" : (["heuristic","ai","combining"].indexOf(step) > i ? "var(--safe)" : "var(--border)"),
                      transition: "background 0.3s ease",
                      boxShadow: s === step ? "0 0 8px var(--accent)" : "none",
                    }} />
                    {i < 2 && <div style={{ width: 24, height: 1, background: "var(--border)" }} />}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-3">
                {["Heuristic", "AI Model", "Combining"][["heuristic", "ai", "combining"].indexOf(step)] || ""} analysis in progress
              </p>
            </div>
          )}

          {/* ── Demo URLs ── */}
          {status === "idle" && (
            <div className="animate-fadeUp animate-delay-2">
              <p className="text-xs text-muted text-center mb-3">Try a demo URL</p>
              <div className="flex gap-2" style={{ flexWrap: "wrap", justifyContent: "center" }}>
                {DEMO_URLS.map((url) => (
                  <button
                    key={url}
                    onClick={() => handleDemo(url)}
                    className="btn btn--ghost btn--sm font-mono"
                    style={{ fontSize: "0.72rem" }}
                  >
                    {new URL(url).hostname}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Result ── */}
          {status === "done" && result && (
            <ResultCard result={result} onReset={handleReset} />
          )}

        </div>
      </main>
    </div>
  );
}
