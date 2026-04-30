import type { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  icon?: ReactNode;
  accent?: string;
}

export function Stat({
  label,
  value,
  unit,
  delta,
  deltaLabel = '전일',
  icon,
  accent,
}: StatProps) {
  const positive = delta != null && delta >= 0;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      {icon && (
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: accent ?? '#F1F3F5',
          color: accent ? '#fff' : '#374151',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, color: '#6B7280', fontWeight: 500,
          marginBottom: 4, letterSpacing: '-0.01em',
        }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
          <div className="num" style={{
            fontSize: 26, fontWeight: 700,
            letterSpacing: '-0.025em', color: '#0E1116',
          }}>
            {value}
          </div>
          {unit && (
            <div style={{ fontSize: 12, color: '#9AA0AB', fontWeight: 500 }}>{unit}</div>
          )}
        </div>
        {delta != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{
              color: positive ? '#059669' : '#BE123C',
              fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 2,
            }}>
              {positive ? '▲' : '▼'} {Math.abs(delta)}%
            </span>
            <span style={{ color: '#9AA0AB' }}>{deltaLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
