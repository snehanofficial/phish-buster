import { useEffect, useState } from "react";

const CIRCUMFERENCE = 2 * Math.PI * 52; // radius = 52

function getColor(label) {
  if (label === "Safe") return "var(--safe)";
  if (label === "Phishing") return "var(--phishing)";
  return "var(--suspicious)";
}

export function ScoreRing({ score, label }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 50);
    return () => clearTimeout(t);
  }, [score]);

  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;
  const color = getColor(label);

  return (
    <div className="score-ring">
      <svg viewBox="0 0 120 120">
        <circle className="score-ring__bg" cx="60" cy="60" r="52" />
        <circle
          className="score-ring__fill"
          cx="60" cy="60" r="52"
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring__label">
        <span className="score-ring__num" style={{ color }}>{score}</span>
        <span className="score-ring__sub">RISK SCORE</span>
      </div>
    </div>
  );
}

export function RiskBadge({ label }) {
  const cls = label === "Safe" ? "safe" : label === "Phishing" ? "phishing" : "suspicious";
  const emoji = label === "Safe" ? "✅" : label === "Phishing" ? "🚨" : "⚠️";
  return (
    <span className={`badge badge--${cls}`}>
      {emoji} {label}
    </span>
  );
}

export function ProgressBar({ value, label }) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 50);
    return () => clearTimeout(t);
  }, [value]);

  const cls = label === "Safe" ? "safe" : label === "Phishing" ? "phishing" : "suspicious";

  return (
    <div className="progress-bar">
      <div
        className={`progress-bar__fill progress-bar__fill--${cls}`}
        style={{ width: `${animated}%` }}
      />
    </div>
  );
}
