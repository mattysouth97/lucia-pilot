// apps/lucia-energy/src/sections/Hero.tsx
// Photo-card hero — large rounded-corner hero "photo" with overlay text.
// Photo asset is a CSS gradient evoking solar farm at sunset; swap for a
// real photographic asset in production.
import { HERO } from '../copy';

interface HeroProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

export function Hero({ onPrimaryClick, onSecondaryClick }: HeroProps) {
  return (
    <section aria-label="hero" style={{ padding: '24px var(--page-pad) 0' }}>
      <div
        style={{
          position: 'relative',
          maxWidth: 1280,
          margin: '0 auto',
          minHeight: 'min(72vh, 640px)',
          borderRadius: 'var(--r-hero)',
          overflow: 'hidden',
          // Solar farm at golden hour — placeholder for a real photo.
          background:
            // top atmospheric glow → mid sky → warm horizon → desert
            'linear-gradient(180deg, #1F2937 0%, #2C3E5A 22%, #C97B3D 55%, #E8A05B 70%, #6B5B3E 100%)',
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-floating)',
        }}
      >
        {/* Subtle grid overlay to suggest solar panels in the foreground */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(105deg, rgba(0,0,0,0.0) 0px, rgba(0,0,0,0.0) 36px, rgba(0,0,0,0.18) 37px, rgba(0,0,0,0.0) 38px), repeating-linear-gradient(15deg, rgba(0,0,0,0.0) 0px, rgba(0,0,0,0.0) 64px, rgba(0,0,0,0.10) 65px, rgba(0,0,0,0.0) 66px)',
            mask: 'linear-gradient(180deg, transparent 0%, transparent 55%, #000 75%, #000 100%)',
            WebkitMask:
              'linear-gradient(180deg, transparent 0%, transparent 55%, #000 75%, #000 100%)',
          }}
        />
        {/* Dark gradient for text legibility */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.06) 35%, rgba(0,0,0,0.36) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            padding: 'clamp(40px, 6vw, 72px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            minHeight: 'inherit',
            maxWidth: 760,
          }}
        >
          <div
            className="overline"
            style={{
              color: '#FFFFFF',
              opacity: 0.85,
              marginBottom: 20,
              letterSpacing: '0.08em',
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
              textShadow: '0 2px 12px rgba(0,0,0,0.25)',
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
              color: 'rgba(255,255,255,0.92)',
              textShadow: '0 1px 6px rgba(0,0,0,0.20)',
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
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                transition: 'transform 120ms ease-out, box-shadow 120ms ease-out',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.18)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
              }}
            >
              {HERO.ctaPrimary}
              <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden fill="currentColor">
                <path d="M2 7h9.5M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onSecondaryClick}
              style={{
                background: 'transparent',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.32)',
                padding: '14px 22px',
                borderRadius: 'var(--r-md)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 120ms ease-out',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
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
