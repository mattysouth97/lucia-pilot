// GenerationSnapshotCard — orange-accented snapshot tile
// Mirrors the right-rail "Generation Snapshot" card in the Figma reference:
//   • 3 small KPIs (POWER GENERATED · EFFICIENCY · PROFIT/DAY)
//   • Hero revenue total (₩)
//   • 7-row heatmap grid of orange tiles
//   • Bottom half-circle radial bar fan

import { useMemo } from 'react';

interface GenerationSnapshotCardProps {
  power?: string;
  efficiency?: string;
  profitPerDay?: string;
  revenue?: string;
  /** 7×N heatmap intensities, 0–1 */
  heatmap?: number[][];
}

const COLS = 28;
const ROWS = 7;

function buildHeatmap(): number[][] {
  // Stable pseudo-random pattern reminiscent of weekly solar yield.
  const seed = (i: number) =>
    Math.abs(Math.sin((i + 1) * 12.9898 + (i + 1) * 78.233)) % 1;
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      const base = seed(r * COLS + c);
      // Mid-day rows (rows 2-4) trend higher, edges lower
      const rowBoost = 1 - Math.abs(r - 3) / 4;
      return Math.min(1, base * 0.35 + rowBoost * 0.6 + (c % 7 === 6 ? 0.15 : 0));
    })
  );
}

export function GenerationSnapshotCard({
  power = '9,842',
  efficiency = '83.1',
  profitPerDay = '4.18',
  revenue = '4,182,300',
  heatmap,
}: GenerationSnapshotCardProps) {
  const grid = useMemo(() => heatmap ?? buildHeatmap(), [heatmap]);

  return (
    <div className="card card-pad gen-snapshot">
      <div className="gen-snapshot-header">
        <span className="gen-snapshot-title">Generation Snapshot</span>
        <span className="gen-snapshot-pill">Live · 1m</span>
      </div>

      <div className="gen-snapshot-kpis">
        <SnapshotKpi label="POWER GENERATED" value={power} unit="kWh" />
        <SnapshotKpi label="EFFICIENCY" value={efficiency} unit="%" />
        <SnapshotKpi label="PROFIT / DAY" value={profitPerDay} unit="M" />
      </div>

      <div className="gen-snapshot-revenue">
        <span className="gen-snapshot-revenue-symbol">₩</span>
        <span className="num">{revenue}</span>
      </div>

      <div className="gen-snapshot-heatmap" aria-hidden="true">
        {grid.map((row, r) => (
          <div key={r} className="gen-snapshot-heatmap-row">
            {row.map((v, c) => (
              <span
                key={c}
                className="gen-snapshot-heatmap-cell"
                style={{
                  backgroundColor: tileColor(v),
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <HalfCircleFan />
    </div>
  );
}

function SnapshotKpi({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="gen-snapshot-kpi">
      <div className="gen-snapshot-kpi-label">{label}</div>
      <div className="gen-snapshot-kpi-row">
        <span className="num gen-snapshot-kpi-value">{value}</span>
        <span className="gen-snapshot-kpi-unit">{unit}</span>
      </div>
    </div>
  );
}

function tileColor(v: number): string {
  // Orange ramp; <0.18 turns into faint background tone
  if (v < 0.16) return '#FFF5EC';
  if (v < 0.32) return '#FFE2C2';
  if (v < 0.5) return '#FCC18A';
  if (v < 0.7) return '#F89A4D';
  if (v < 0.86) return '#F47E1E';
  return '#D8531A';
}

function HalfCircleFan() {
  // Render N vertical-ish bars arranged across the bottom of a half-circle.
  // SVG width is fluid; the viewBox is the source of truth.
  const W = 320;
  const H = 110;
  const cx = W / 2;
  const cy = H + 4; // anchor below the box so we get a half disc
  const inner = 28;
  const outer = 96;
  const N = 36;

  const bars = Array.from({ length: N }, (_, i) => {
    const t = i / (N - 1);
    // Fan from -90° to +90°
    const angle = (-Math.PI / 2) + t * Math.PI;
    // Bar length follows a soft bell curve; emphasized middle.
    const bell = 0.35 + 0.65 * Math.sin(t * Math.PI);
    const len = inner + (outer - inner) * bell;
    const x1 = cx + Math.cos(angle) * inner;
    const y1 = cy + Math.sin(angle) * inner;
    const x2 = cx + Math.cos(angle) * len;
    const y2 = cy + Math.sin(angle) * len;
    return { x1, y1, x2, y2, t };
  });

  return (
    <svg
      className="gen-snapshot-fan"
      viewBox={`0 0 ${W} ${H + 4}`}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fan-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FCC18A" />
          <stop offset="100%" stopColor="#F47E1E" />
        </linearGradient>
      </defs>
      {bars.map((b, i) => (
        <line
          key={i}
          x1={b.x1}
          y1={b.y1}
          x2={b.x2}
          y2={b.y2}
          stroke="url(#fan-grad)"
          strokeWidth={3.4}
          strokeLinecap="round"
        />
      ))}
      {/* Endpoint dots */}
      <circle cx={cx - outer + 2} cy={cy - 2} r={3.5} fill="#F47E1E" />
      <circle cx={cx + outer - 2} cy={cy - 2} r={3.5} fill="#F47E1E" />
    </svg>
  );
}
