// apps/lucia-energy/src/sections/Hero.tsx
// Provocation-first hero (spec §4.3). Pure typography — no image, no animation.
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
        background: 'var(--bg)',
        padding: '80px 24px 96px',
      }}
    >
      <div
        className="overline"
        style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: 16,
        }}
      >
        {HERO.overline}
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--hero-display)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--ink)',
          lineHeight: 1.05,
        }}
      >
        {HERO.headlineLine1}
        <br />
        {HERO.headlineLine2}
      </h1>
      <p
        style={{
          marginTop: 24,
          maxWidth: 640,
          fontSize: 20,
          lineHeight: 1.5,
          color: 'var(--ink-2)',
        }}
      >
        {HERO.sub}
      </p>
      <div
        style={{
          marginTop: 40,
          display: 'flex',
          gap: 24,
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
            padding: '12px 24px',
            borderRadius: 'var(--r-md)',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {HERO.ctaPrimary}
        </button>
        <button
          type="button"
          onClick={onSecondaryClick}
          style={{
            background: 'transparent',
            color: 'var(--ink)',
            border: 'none',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {HERO.ctaSecondary} →
        </button>
      </div>
    </section>
  );
}
