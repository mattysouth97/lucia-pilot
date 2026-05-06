// apps/lucia-energy/src/sections/Hero.tsx
// Editorial two-tier hero: top split (huge headline left, ABOUT pill + body right),
// then a full-bleed rounded photo card. CSS-rendered solar grid is a robust
// fallback when /hero-solar.jpg is absent — the photo still wins if present.
import type { CSSProperties } from 'react';

import { HERO } from '../copy';

interface HeroProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

export function Hero({ onPrimaryClick, onSecondaryClick }: HeroProps) {
  return (
    <section
      aria-label="hero"
      style={{ background: 'var(--bg)' }}
    >
      <div className="page-shell" style={{ paddingTop: 28, paddingBottom: 28 }}>
        {/* Top tier — text split */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 32,
            alignItems: 'end',
            paddingTop: 24,
            paddingBottom: 32,
          }}
        >
          <div style={twoColRow}>
            <h1
              style={{
                margin: 0,
                fontSize: 'var(--hero-display)',
                fontWeight: 800,
                letterSpacing: '-0.045em',
                color: 'var(--ink)',
                lineHeight: 0.96,
              }}
            >
              {HERO.headlineLine1}
              <br />
              {HERO.headlineLine2}
            </h1>

            <aside
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                maxWidth: 320,
                paddingBottom: 8,
                marginLeft: 'auto',
              }}
            >
              <span className="about-pill">{HERO.pillLabel}</span>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--ink-2)',
                }}
              >
                {HERO.sub}
              </p>
            </aside>
          </div>
        </div>

        {/* Bottom tier — full-bleed photo card with CSS solar-grid fallback */}
        <div
          aria-hidden="false"
          role="img"
          aria-label="solar farm aerial"
          className="photo-card solar-grid-bg"
          style={{
            backgroundImage: "url('/hero-solar.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: 'clamp(360px, 56vh, 580px)',
            width: '100%',
          }}
        />

        {/* CTAs sit below the photo so the text/photo split stays clean */}
        <div
          style={{
            marginTop: 24,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={onPrimaryClick}
            style={{
              background: 'var(--accent)',
              color: '#FFFFFF',
              padding: '12px 22px',
              borderRadius: 'var(--r-pill)',
              fontSize: 13.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background-color 120ms ease-out',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-ink)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            {HERO.ctaPrimary}
            <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden>
              <path
                d="M2 7h9.5M8 3.5L11.5 7 8 10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onSecondaryClick}
            style={{
              background: 'transparent',
              color: 'var(--ink)',
              border: 'none',
              padding: '12px 6px',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'underline',
              textUnderlineOffset: 4,
              textDecorationColor: 'var(--ink-3)',
            }}
          >
            {HERO.ctaSecondary} →
          </button>
        </div>
      </div>
    </section>
  );
}

const twoColRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 320px)',
  gap: 32,
  alignItems: 'end',
};
