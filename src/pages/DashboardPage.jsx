import { useState, useEffect, useCallback } from "react";
import { api } from "../api";
import { RiskBadge } from "../components/RiskIndicators";
import DonutChart from "../components/DonutChart";

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 150, textAlign: "center" }}>
      <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color: color || "var(--text-primary)" }}>
        {value}
      </div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getLogs();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const logs = data?.logs ?? [];

  const stats = {
    total:      logs.length,
    phishing:   logs.filter((l) => l.risk.label === "Phishing").length,
    suspicious: logs.filter((l) => l.risk.label === "Suspicious").length,
    safe:       logs.filter((l) => l.risk.label === "Safe").length,
  };

  return (
    <div className="page">
      <main style={{ padding: "3rem 0 6rem" }}>
        <div className="container container--wide">

          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-8 animate-fadeUp" style={{ flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ marginBottom: "0.25rem" }}>📊 Threat Dashboard</h2>
              <p className="text-sm text-muted">All logged threats — newest first</p>
            </div>
            <button
              id="btn-refresh-logs"
              className="btn btn--ghost btn--sm"
              onClick={fetchLogs}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "↻"}
              Refresh
            </button>
          </div>

          {/* ── Stats row ── */}
          <div className="flex gap-4 mb-6 animate-fadeUp animate-delay-1" style={{ flexWrap: "wrap" }}>
            <StatCard icon="🗂️" label="Total Logged"    value={stats.total}      />
            <StatCard icon="🚨" label="Phishing"        value={stats.phishing}    color="var(--phishing)"    />
            <StatCard icon="⚠️" label="Suspicious"      value={stats.suspicious}  color="var(--suspicious)"  />
            <StatCard icon="✅" label="Safe"             value={stats.safe}        color="var(--safe)"        />
          </div>

          {/* ── Chart row ── */}
          {stats.total > 0 && (
            <div className="card mb-8 animate-fadeUp animate-delay-2" style={{ display: "flex", alignItems: "center", gap: "3rem", flexWrap: "wrap" }}>
              <DonutChart
                size={160}
                segments={[
                  { label: "Phishing",   value: stats.phishing,   color: "var(--phishing)"   },
                  { label: "Suspicious", value: stats.suspicious, color: "var(--suspicious)" },
                  { label: "Safe",       value: stats.safe,       color: "var(--safe)"       },
                ]}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ marginBottom: "1rem" }}>Threat Distribution</h3>
                {[
                  { label: "Phishing",   value: stats.phishing,   color: "var(--phishing)"   },
                  { label: "Suspicious", value: stats.suspicious, color: "var(--suspicious)" },
                  { label: "Safe",       value: stats.safe,       color: "var(--safe)"       },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ marginBottom: "0.85rem" }}>
                    <div className="flex justify-between text-sm" style={{ marginBottom: "0.35rem" }}>
                      <span style={{ color, fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                        {label}
                      </span>
                      <span className="text-muted text-xs">
                        {value} ({stats.total > 0 ? Math.round((value/stats.total)*100) : 0}%)
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 999,
                        background: color,
                        width: `${stats.total > 0 ? (value/stats.total)*100 : 0}%`,
                        transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                        boxShadow: `0 0 6px ${color}88`,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Table ── */}
          {loading && !data && (
            <div className="card text-center" style={{ padding: "3rem" }}>
              <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto 1rem", borderWidth: 3 }} />
              <p className="text-secondary">Loading threat log…</p>
            </div>
          )}

          {error && (
            <div className="card" style={{ borderColor: "var(--phishing)", textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--phishing)" }}>⚠️ {error}</p>
              <button className="btn btn--ghost btn--sm mt-4" onClick={fetchLogs}>Retry</button>
            </div>
          )}

          {!loading && !error && logs.length === 0 && (
            <div className="card text-center animate-fadeIn" style={{ padding: "4rem 2rem" }}>
              <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛡️</p>
              <h3 style={{ marginBottom: "0.5rem" }}>No threats logged yet</h3>
              <p className="text-secondary text-sm">Analyze a suspicious URL and click "Log Threat" to record it here.</p>
            </div>
          )}

          {!loading && logs.length > 0 && (
            <div className="table-wrap animate-fadeUp animate-delay-2">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>URL</th>
                    <th>Risk</th>
                    <th>Score</th>
                    <th>Heuristic</th>
                    <th>AI</th>
                    <th>TX Hash</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>
                        #{log.id}
                      </td>
                      <td className="url-cell" title={log.url}>{log.url}</td>
                      <td><RiskBadge label={log.risk.label} /></td>
                      <td>
                        <span className="font-mono" style={{
                          color: log.risk.label === "Phishing" ? "var(--phishing)" :
                                 log.risk.label === "Suspicious" ? "var(--suspicious)" : "var(--safe)"
                        }}>
                          {log.risk.finalScore}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                          {log.heuristic.score}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                          {log.ai.confidence}%
                        </span>
                      </td>
                      <td>
                        <span
                          className="font-mono"
                          style={{ fontSize: "0.68rem", color: "var(--accent)", display: "block", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          title={log.txHash}
                        >
                          {log.txHash}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Chain info note ── */}
          {logs.length > 1 && (
            <div className="mt-4 animate-fadeIn" style={{
              padding: "0.75rem 1rem",
              background: "rgba(99,102,241,0.06)",
              border: "1px solid var(--border-glow)",
              borderRadius: 10,
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}>
              ⛓️ Each entry's <span className="font-mono" style={{ color: "var(--accent)" }}>prevHash</span> links to the previous entry's SHA-256 — forming an immutable chain.
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
