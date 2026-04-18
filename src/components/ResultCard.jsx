import { useState } from "react";
import { api } from "../api";
import { ScoreRing, RiskBadge, ProgressBar } from "./RiskIndicators";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: copied ? "var(--safe)" : "var(--text-muted)",
        fontSize: "0.8rem", padding: "0 0.25rem",
        transition: "color 0.2s",
        flexShrink: 0,
      }}
    >
      {copied ? "✓" : "⎘"}
    </button>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span style={{ fontSize: "1.1rem" }}>{icon}</span>
      <h3 style={{ color: "var(--text-primary)" }}>{title}</h3>
    </div>
  );
}

export default function ResultCard({ result, onReset }) {
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(null);
  const [logError, setLogError] = useState(null);

  const { url, domain, heuristic, ai, risk } = result;
  const isPhishing = risk.label === "Phishing";

  const handleLog = async () => {
    setLogging(true);
    setLogError(null);
    try {
      const res = await api.logThreat({ url, heuristic, ai, risk });
      setLogged(res.entry);
    } catch (err) {
      setLogError(err.response?.data?.error || err.message);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="animate-fadeUp">
      {/* ── Hero row: score ring + summary ── */}
      <div
        className="card card--glow mb-4"
        style={isPhishing ? { borderColor: "rgba(239,68,68,0.4)" } : {}}
      >
        <div className="flex gap-6 items-center" style={{ flexWrap: "wrap" }}>
          <div className={isPhishing ? "pulse-danger" : ""} style={{ borderRadius: "50%" }}>
            <ScoreRing score={risk.finalScore} label={risk.label} />
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="flex items-center gap-3 mb-2">
              <RiskBadge label={risk.label} />
              {isPhishing && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--phishing)",
                    background: "var(--phishing-bg)",
                    border: "1px solid var(--phishing)",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontWeight: 700,
                  }}
                >
                  HIGH THREAT
                </span>
              )}
            </div>

            <p className="text-sm text-muted mb-1">Domain analyzed</p>
            <p className="font-mono" style={{ color: "var(--text-primary)", wordBreak: "break-all", fontSize: "0.9rem" }}>
              {domain}
            </p>

            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted">Risk level</span>
                <span style={{ color: risk.label === "Safe" ? "var(--safe)" : risk.label === "Phishing" ? "var(--phishing)" : "var(--suspicious)" }}>
                  {risk.finalScore} / 100
                </span>
              </div>
              <ProgressBar value={risk.finalScore} label={risk.label} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column: heuristic + AI ── */}
      <div className="flex gap-4 mb-4" style={{ flexWrap: "wrap" }}>

        {/* Heuristic panel */}
        <div className="card animate-fadeUp animate-delay-1" style={{ flex: 1, minWidth: 260 }}>
          <SectionTitle icon="🔍" title="Heuristic Analysis" />

          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted">Score</span>
            <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
              {heuristic.score} / 100
            </span>
          </div>
          <ProgressBar value={heuristic.score} label={heuristic.label} />

          {heuristic.flags.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs text-muted mb-2">Triggered flags</p>
              {heuristic.flags.map((f, i) => (
                <div key={i} className="flag-item">
                  <span>⚠️</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted mt-4">✅ No suspicious patterns detected</p>
          )}
        </div>

        {/* AI panel */}
        <div className="card animate-fadeUp animate-delay-2" style={{ flex: 1, minWidth: 260 }}>
          <SectionTitle icon="🤖" title="AI Classification" />

          <div className="flex items-center gap-3 mb-3">
            <RiskBadge label={ai.label} />
            <span className="text-sm text-muted">{ai.confidence}% confidence</span>
          </div>
          <ProgressBar value={ai.confidence} label={ai.label} />

          <p className="text-sm text-secondary mt-4" style={{ lineHeight: 1.7 }}>
            {ai.reason}
          </p>

          {ai.source && (
            <p className="text-xs text-muted mt-3">
              Model: <span className="font-mono" style={{ color: "var(--accent)" }}>{ai.source}</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Log Threat / Result ── */}
      <div className="card animate-fadeUp animate-delay-3">
        {logged ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ fontSize: "1.3rem" }}>⛓️</span>
              <h3 style={{ color: "var(--safe)" }}>Threat Logged to Chain</h3>
            </div>
            <div className="flex gap-4" style={{ flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted">SHA-256 Content Hash</p>
                  <CopyButton text={logged.hash} />
                </div>
                <div className="hash-box">{logged.hash}</div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted">Blockchain TX Hash</p>
                  <CopyButton text={logged.txHash} />
                </div>
                <div className="hash-box" style={{ color: "var(--safe)" }}>{logged.txHash}</div>
              </div>
            </div>
            <div className="flex gap-3 mt-4" style={{ flexWrap: "wrap" }}>
              <span className="text-xs text-muted">
                Entry #{logged.id} · {new Date(logged.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4" style={{ flexWrap: "wrap" }}>
            <div>
              <h3 className="mb-1">Log this threat</h3>
              <p className="text-sm text-muted">
                Save an immutable SHA-256 hash + TX record to the threat chain.
              </p>
              {logError && (
                <p className="text-sm mt-2" style={{ color: "var(--phishing)" }}>⚠️ {logError}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                id="btn-log-threat"
                className="btn btn--danger"
                onClick={handleLog}
                disabled={logging}
              >
                {logging ? <span className="spinner" /> : "⛓️"}
                {logging ? "Logging…" : "Log Threat"}
              </button>
              <button id="btn-analyze-again" className="btn btn--ghost" onClick={onReset}>
                Analyze another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
