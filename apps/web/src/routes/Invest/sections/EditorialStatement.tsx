// Editorial statement section — borrows the inline-highlighted-phrase pattern
// from large editorial landing pages (Pentagram-style typesetting).
// Each highlighted phrase is prefixed by a 20×20 mint glyph square + dark pill
// containing the phrase. Translates the pattern into Korean within the
// committed neutral-+-mint palette.

import type { ReactNode } from 'react';

const ICONS: Record<'split' | 'shield' | 'flow', ReactNode> = {
  split: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4 L3 8 L8 12 L13 8 L13 4" />
      <path d="M8 4 L8 12" />
      <path d="M3 4 L13 4" />
    </svg>
  ),
  shield: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2 L13 4 L13 9 C13 12 8 14 8 14 C8 14 3 12 3 9 L3 4 Z" />
      <path d="M5.5 8.2 L7.4 10 L10.5 6.5" />
    </svg>
  ),
  flow: (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="3.5" cy="8" r="1.6" />
      <circle cx="12.5" cy="4.5" r="1.6" />
      <circle cx="12.5" cy="11.5" r="1.6" />
      <path d="M5 7 L11 5" />
      <path d="M5 9 L11 11" />
    </svg>
  ),
};

function HighlightedPhrase({
  icon,
  children,
}: {
  icon: keyof typeof ICONS;
  children: ReactNode;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        verticalAlign: 'baseline',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        aria-hidden
        style={{
          width: '0.85em',
          height: '0.85em',
          minWidth: 18,
          minHeight: 18,
          background: 'var(--accent)',
          borderRadius: 3,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ display: 'inline-flex', width: '70%', height: '70%' }}>
          {ICONS[icon]}
        </span>
      </span>
      <span
        style={{
          background: 'var(--ink)',
          color: '#FFFFFF',
          padding: '0.04em 0.18em',
          borderRadius: 3,
          fontWeight: 700,
        }}
      >
        {children}
      </span>
    </span>
  );
}

export function EditorialStatement() {
  return (
    <section
      aria-labelledby="statement-heading"
      className="landing-section"
      style={{ background: 'var(--bg)' }}
    >
      <div className="landing-container">
        <p
          className="overline"
          style={{
            fontFamily: 'Geist Mono, monospace',
            color: 'var(--ink-2)',
            background: 'var(--chip)',
            padding: '4px 10px',
            display: 'inline-block',
            borderRadius: 2,
            marginBottom: 28,
            letterSpacing: '0.04em',
            textTransform: 'none',
          }}
        >
          햇빛, 정직하게 분배되다.
        </p>

        <h2
          id="statement-heading"
          style={{
            fontSize: 'clamp(28px, 4.6vw, 56px)',
            fontWeight: 600,
            letterSpacing: '-0.035em',
            lineHeight: 1.22,
            color: 'var(--ink)',
            margin: 0,
            maxWidth: '24ch',
          }}
        >
          Lucia는 발전된 모든 kWh가{' '}
          <HighlightedPhrase icon="split">정산 원장</HighlightedPhrase>에 기록되고,{' '}
          <HighlightedPhrase icon="shield">입주민에게 환원</HighlightedPhrase>되며,{' '}
          <HighlightedPhrase icon="flow">투자자에게 분배</HighlightedPhrase>되는 유일한 플랫폼입니다.
        </h2>

        <p
          style={{
            marginTop: 28,
            fontSize: 14,
            color: 'var(--muted)',
            lineHeight: 1.6,
            maxWidth: '52ch',
          }}
        >
          추출이 아닌 공유의 햇빛 금융 — 발전 수익의 41%는 자동으로 공익 분배되고,
          나머지는 투명한 정산엔진을 거쳐 투자자에게 매월 정시에 입금됩니다.
        </p>
      </div>
    </section>
  );
}
