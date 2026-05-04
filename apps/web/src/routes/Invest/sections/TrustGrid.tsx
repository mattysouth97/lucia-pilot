// apps/web/src/routes/Invest/sections/TrustGrid.tsx
import type { ReactNode } from 'react';

import { TRUST_TILES, TRUST_TITLE } from '../copy';

type IconKind = typeof TRUST_TILES[number]['iconKind'];

const ICON: Record<IconKind, ReactNode> = {
  hyperledger: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M8 1 L14 5 L14 11 L8 15 L2 11 L2 5 Z" />
    </svg>
  ),
  lh: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M2 14 L2 6 L8 2 L14 6 L14 14 Z" />
      <path d="M6 14 L6 9 L10 9 L10 14" />
    </svg>
  ),
  registration: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 2 L13 2 L13 14 L3 14 Z" />
      <path d="M5 6 L11 6 M5 9 L11 9 M5 12 L9 12" />
    </svg>
  ),
  audit: (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 8 L7 12 L13 4" />
    </svg>
  ),
};

export function TrustGrid() {
  return (
    <section id="trust" aria-labelledby="trust-heading" className="landing-section">
      <div className="landing-container">
        <h2 id="trust-heading" style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 24px', letterSpacing: '-0.025em' }}>
          {TRUST_TITLE}
        </h2>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {TRUST_TILES.map(tile => (
            <article key={tile.iconKind} className="card card-pad">
              <div style={{ color: 'var(--ink-2)', marginBottom: 14 }}>{ICON[tile.iconKind]}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.015em' }}>
                {tile.title}
              </h3>
              <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>
                {tile.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
