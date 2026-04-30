interface SparkProps {
  data: number[];
  /** Color override. Default `--ink-2` for neutral series, callers pass `--accent` only for the accent metric. */
  color?: string;
  w?: number;
  h?: number;
  /** Fill under the line. Defaults off — utilitarian style is stroke-only. */
  fill?: boolean;
}

// Spark — single-color line, no gradient, 1.5px stroke.
// See DESIGN.md "Components > Spark".

export function Spark({
  data,
  color,
  w = 80,
  h = 28,
  fill = false,
}: SparkProps) {
  if (!data?.length) return null;
  const stroke = color ?? 'var(--ink-2)';
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map(
    (v, i) =>
      [
        (i / (data.length - 1)) * w,
        h - ((v - min) / span) * h * 0.86 - 2,
      ] as [number, number],
  );
  const path = pts
    .map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1))
    .join(' ');
  const fillPath = fill ? `${path} L${w} ${h} L0 ${h} Z` : null;

  return (
    <svg width={w} height={h} style={{ display: 'block' }} aria-hidden>
      {fill && fillPath && (
        <path d={fillPath} fill={stroke} fillOpacity={0.08} />
      )}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
