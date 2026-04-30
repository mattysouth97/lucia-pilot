import type { CSSProperties, ReactNode } from 'react';

// Pill — status chip. 4px radius, not 999. Three tones in active rotation
// (neutral, accent, rose); legacy tones kept for callers that still pass them
// but mapped onto the same restrained palette.
//
// See DESIGN.md "Components > Pill".

type Tone =
  | 'neutral'
  | 'green'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'sky'
  | 'ink';

interface PillProps {
  tone?: Tone;
  dot?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}

interface ToneSpec {
  bg: string;
  fg: string;
  bd: string;
  dot: string;
}

const tones: Record<Tone, ToneSpec> = {
  neutral: { bg: 'var(--chip)',        fg: 'var(--ink-2)',     bd: 'transparent',     dot: 'var(--muted-2)' },
  green:   { bg: 'var(--accent-soft)', fg: 'var(--accent-ink)', bd: 'transparent',    dot: 'var(--accent)' },
  amber:   { bg: 'var(--amber-soft)',  fg: 'var(--amber)',      bd: 'transparent',    dot: 'var(--amber)' },
  rose:    { bg: 'var(--rose-soft)',   fg: 'var(--rose)',       bd: 'transparent',    dot: 'var(--rose)' },
  // Legacy tones — collapsed to neutral so existing callers don't introduce
  // new color noise. See DESIGN.md anti-references.
  indigo:  { bg: 'var(--chip)',        fg: 'var(--ink-2)',      bd: 'transparent',    dot: 'var(--muted-2)' },
  sky:     { bg: 'var(--chip)',        fg: 'var(--ink-2)',      bd: 'transparent',    dot: 'var(--muted-2)' },
  ink:     { bg: 'var(--ink)',         fg: '#fff',              bd: 'var(--ink)',     dot: 'var(--accent)' },
};

export function Pill({ tone = 'neutral', children, dot, style }: PillProps) {
  const t = tones[tone] ?? tones.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: t.bg,
        color: t.fg,
        border: t.bd === 'transparent' ? 'none' : `1px solid ${t.bd}`,
        padding: '2px 8px',
        borderRadius: 'var(--r-sm)',
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: '0.01em',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: t.dot,
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
}
