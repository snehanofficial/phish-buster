/**
 * DonutChart.jsx
 * Pure SVG donut chart — no external dependencies.
 *
 * Props:
 *   segments: [{ label, value, color }]
 *   size: diameter in px (default 160)
 */

const SVG_SIZE = 160;
const RADIUS  = 58;
const CENTER  = SVG_SIZE / 2;
const CIRC    = 2 * Math.PI * RADIUS;
const GAP     = 3; // degrees gap between segments

function degreesToRadians(deg) { return (deg * Math.PI) / 180; }

function polarToCart(cx, cy, r, angle) {
  const rad = degreesToRadians(angle - 90); // start from top
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCart(cx, cy, r, endAngle);
  const end   = polarToCart(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export default function DonutChart({ segments = [], size = SVG_SIZE }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <div style={{ width: size, height: size, display: "grid", placeItems: "center" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
          No data yet
        </p>
      </div>
    );
  }

  const scale  = size / SVG_SIZE;
  let cursor   = 0; // running angle

  const arcs = segments
    .filter((seg) => seg.value > 0)
    .map((seg) => {
      const fraction   = seg.value / total;
      const angleDeg   = fraction * 360;
      const gapDeg     = segments.filter((s) => s.value > 0).length > 1 ? GAP : 0;
      const startAngle = cursor + gapDeg / 2;
      const endAngle   = cursor + angleDeg - gapDeg / 2;
      cursor += angleDeg;
      return { ...seg, startAngle, endAngle, fraction };
    });

  const cx = CENTER * scale;
  const cy = CENTER * scale;
  const r  = RADIUS * scale;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={12 * scale} />

        {/* Segments */}
        {arcs.map((arc) => (
          <path
            key={arc.label}
            d={describeArc(cx, cy, r, arc.startAngle, arc.endAngle)}
            fill="none"
            stroke={arc.color}
            strokeWidth={12 * scale}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${arc.color}55)` }}
          />
        ))}
      </svg>

      {/* Center text */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: size * 0.2, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
          {total}
        </span>
        <span style={{ fontSize: size * 0.1, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
          LOGGED
        </span>
      </div>
    </div>
  );
}
