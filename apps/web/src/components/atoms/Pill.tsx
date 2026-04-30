import type { CSSProperties, ReactNode } from 'react';

type Tone = 'neutral' | 'green' | 'amber' | 'rose' | 'indigo' | 'sky' | 'ink';

interface PillProps {
  tone?: Tone;
  dot?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}

const tones: Record<Tone, { bg: string; fg: string; dot: string }> = {
  neutral: { bg: '#F1F3F5', fg: '#374151', dot: '#9AA0AB' },
  green:   { bg: '#ECFDF5', fg: '#047857', dot: '#10B981' },
  amber:   { bg: '#FFF7E6', fg: '#B45309', dot: '#F59E0B' },
  rose:    { bg: '#FFF1F3', fg: '#BE123C', dot: '#F43F5E' },
  indigo:  { bg: '#EEF0FF', fg: '#3730A3', dot: '#4F46E5' },
  sky:     { bg: '#E0F2FE', fg: '#075985', dot: '#0284C7' },
  ink:     { bg: '#0E1116', fg: '#fff',    dot: '#34D399' },
};

export function Pill({ tone = 'neutral', children, dot, style }: PillProps) {
  const t = tones[tone] ?? tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: t.bg, color: t.fg,
      padding: '3px 9px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 600, lineHeight: 1.4,
      letterSpacing: '-0.01em',
      ...style,
    }}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: 999,
          background: t.dot, display: 'inline-block',
        }} />
      )}
      {children}
    </span>
  );
}
