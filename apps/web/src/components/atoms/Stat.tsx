import type { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  /** Deprecated — accent prop kept for back-compat; ignored in favor of monochrome. */
  accent?: string;
}

// Stat — KPI tile content. Drops the gradient icon-tile in favor of a small
// stroke icon at left. Monumental tabular numerals carry the visual weight.
//
// See DESIGN.md "Components > Stat".
export function Stat({
  label,
  value,
  unit,
  delta,
  deltaLabel = '전일',
  icon,
  // accent intentionally ignored — see DESIGN.md "anti-references > identical
  // colored card grids". The monochrome treatment unifies all five KPIs.
}: StatProps) {
  const positive = delta != null && delta >= 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      {/* Label row — overline + optional stroke icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)' }}>
        {icon && (
          <span style={{ display: 'inline-flex', color: 'var(--ink-2)' }}>
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          {label}
        </span>
      </div>

      {/* Value row — monumental tabular numeral + small unit */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
        <span
          className="kpi-metric"
          style={{
            fontSize: 'clamp(28px, 3.3vw, 38px)',
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 12, color: 'var(--muted-2)', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Delta row — text only, no pill background */}
      {delta != null && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11.5,
            color: 'var(--muted)',
            marginTop: -4,
          }}
        >
          <span
            className="num"
            style={{
              color: positive ? 'var(--accent-ink)' : 'var(--rose)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              fontSize: 11.5,
            }}
          >
            {positive ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
          </span>
          <span>{deltaLabel}</span>
        </div>
      )}
    </div>
  );
}
