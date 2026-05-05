// apps/lucia-energy/src/sections/Hero.tsx
// Full-bleed photo hero — 100vh height, edge-to-edge width. The floating Topbar
// (sticky, top: 16) overlays the hero's top portion via z-index. Photo asset
// at apps/lucia-energy/public/hero-solar.jpg (Vite serves public/ from root).
import { HERO } from '../copy';

interface HeroProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

export function Hero({ onPrimaryClick, onSecondaryClick }: HeroProps) {
  return (
    <section
      aria-label="hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: "url('/hero-solar.jpg') center/cover no-repeat, #1F2937",
        color: '#FFFFFF',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Dark vignette for text legibility — concentrated at the bottom-left
          where the headline sits, with a subtle top wash so the overline pops
          against any bright cloud zone. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.0) 28%, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.55) 100%), linear-gradient(90deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.0) 55%)',
        }}
      />

      {/* Inner content — bottom-left text block, constrained to a max-width
          container so the headline doesn't sprawl across ultra-wide displays. */}
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(40px, 6vw, 72px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <div
            className="overline"
            style={{
              color: '#FFFFFF',
              opacity: 0.92,
              marginBottom: 20,
              letterSpacing: '0.08em',
              textShadow: '0 1px 6px rgba(0,0,0,0.35)',
            }}
          >
            {HERO.overline}
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--hero-display)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#FFFFFF',
              lineHeight: 1.08,
              textShadow: '0 2px 14px rgba(0,0,0,0.32)',
            }}
          >
            {HERO.headlineLine1}
            <br />
            {HERO.headlineLine2}
          </h1>
          <p
            style={{
              marginTop: 24,
              maxWidth: 560,
              fontSize: 18,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.94)',
              textShadow: '0 1px 8px rgba(0,0,0,0.30)',
            }}
          >
            {HERO.sub}
          </p>
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={onPrimaryClick}
              style={{
                background: '#FFFFFF',
                color: 'var(--ink)',
                padding: '14px 26px',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 6px rgba(0,0,0,0.16)',
                transition: 'box-shadow 120ms ease-out',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.24)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.16)';
              }}
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
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.42)',
                padding: '14px 22px',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 120ms ease-out',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')
              }
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {HERO.ctaSecondary} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
