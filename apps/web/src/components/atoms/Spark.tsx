interface SparkProps {
  data: number[];
  color?: string;
  w?: number;
  h?: number;
  fill?: boolean;
}

export function Spark({ data, color = '#10B981', w = 80, h = 32, fill = true }: SparkProps) {
  if (!data?.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / span) * h * 0.9 - 2,
  ] as [number, number]);
  const path = pts
    .map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1))
    .join(' ');
  const fillPath = fill
    ? `${path} L${w} ${h} L0 ${h} Z`
    : null;
  const gradId = 'spark-' + color.replace('#', '');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && fillPath && (
        <path d={fillPath} fill={`url(#${gradId})`} />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
