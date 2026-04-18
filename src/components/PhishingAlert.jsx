import { useEffect, useRef } from "react";

const STYLES = `
@keyframes alertIn {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes scanline {
  0%   { background-position: 0 0; }
  100% { background-position: 0 100%; }
}
@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.6; }
}
`;

export default function PhishingAlert({ url, score, onClose }) {
  const dialogRef = useRef(null);

  /* close on Escape */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  /* auto-close after 12 s */
  useEffect(() => {
    const t = setTimeout(onClose, 12_000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <>
      <style>{STYLES}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          animation: "fadeIn 0.25s ease",
        }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1.5rem",
          pointerEvents: "none",
        }}
      >
        <div style={{
          pointerEvents: "auto",
          width: "100%", maxWidth: 520,
          background: "#0d0608",
          border: "1.5px solid rgba(239,68,68,0.6)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(239,68,68,0.2), 0 30px 80px rgba(239,68,68,0.3), 0 0 60px rgba(239,68,68,0.15)",
          animation: "alertIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
        }}>

          {/* Red header bar */}
          <div style={{
            background: "linear-gradient(135deg, #7f1d1d, #991b1b)",
            padding: "1.5rem 2rem",
            borderBottom: "1px solid rgba(239,68,68,0.3)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Scanline effect */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, transparent 1px, transparent 3px)",
              backgroundSize: "100% 4px",
              animation: "scanline 4s linear infinite",
              pointerEvents: "none",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", position: "relative" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "rgba(239,68,68,0.2)",
                border: "2px solid rgba(239,68,68,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem",
                animation: "shimmer 1.5s ease infinite",
              }}>
                🚨
              </div>
              <div>
                <div style={{
                  fontSize: "0.7rem", letterSpacing: "0.15em",
                  color: "rgba(239,68,68,0.8)", fontWeight: 700,
                  marginBottom: "0.2rem",
                }}>
                  ⚠ THREAT DETECTED
                </div>
                <div id="alert-title" style={{
                  fontSize: "1.4rem", fontWeight: 800,
                  color: "#fca5a5",
                }}>
                  Phishing URL Identified
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "1.75rem 2rem" }}>
            {/* Score banner */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: "0.85rem 1.25rem",
              marginBottom: "1.25rem",
            }}>
              <span style={{ fontSize: "0.85rem", color: "#fca5a5" }}>Risk Score</span>
              <span style={{
                fontSize: "2rem", fontWeight: 800,
                color: "#ef4444",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {score} <span style={{ fontSize: "1rem", color: "#fca5a5" }}>/ 100</span>
              </span>
            </div>

            {/* URL display */}
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.4rem" }}>Flagged URL</p>
            <div style={{
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              padding: "0.7rem 1rem",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.78rem",
              color: "#fca5a5",
              wordBreak: "break-all",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}>
              {url}
            </div>

            {/* Warning notes */}
            {[
              "Never enter credentials on this page",
              "Do not click any links within this site",
              "Report this URL to your IT security team",
            ].map((tip, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "0.6rem",
                marginBottom: "0.5rem",
                fontSize: "0.83rem", color: "#9ca3af",
              }}>
                <span style={{ color: "#ef4444", flexShrink: 0 }}>›</span>
                {tip}
              </div>
            ))}

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
              <button
                id="alert-dismiss"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  borderRadius: 10,
                  color: "#fca5a5",
                  fontSize: "0.9rem", fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.25)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
              >
                Dismiss
              </button>
              <button
                id="alert-understood"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: "0.9rem", fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(239,68,68,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(239,68,68,0.4)"; }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
