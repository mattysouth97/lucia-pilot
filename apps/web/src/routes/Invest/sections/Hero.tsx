// apps/web/src/routes/Invest/sections/Hero.tsx
import {
  CTA_PRIMARY, CTA_SECONDARY, HERO_OVERLINE, HERO_SUB, HERO_TITLE,
} from '../copy';
import { aumStats } from '../data';

const FORMAT_KRW = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

function formatStat(value: number, format: 'krw' | 'pct' | 'count', unit?: string): string {
  if (format === 'krw') return `₩${FORMAT_KRW.format(value)}`;
  if (format === 'pct') return `${value.toFixed(2)}${unit ?? '%'}`;
  return `${FORMAT_KRW.format(value)}${unit ?? ''}`;
}

export function Hero() {
  return (
    <section id="hero" className="landing-section">
      <div className="landing-container">
        <p className="overline">{HERO_OVERLINE}</p>
        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 700, letterSpacing: '-0.04em',
            lineHeight: 1.1, margin: '14px 0 18px', color: 'var(--ink)', maxWidth: '20ch',
          }}
        >
          {HERO_TITLE}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: '60ch', marginBottom: 48 }}>
          {HERO_SUB}
        </p>

        <div className="grid-stats" style={{ marginBottom: 32 }}>
          {aumStats.map(stat => (
            <div key={stat.label} className="card-pad">
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 10 }}>
                {stat.label}
              </div>
              <div className="kpi-metric" style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}>
                {formatStat(stat.value, stat.format, stat.unit)}
              </div>
              {stat.helper && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted-2)' }}>{stat.helper}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <a
            href="/invest/onboarding"
            style={{
              background: 'var(--ink)', color: '#fff',
              padding: '12px 24px', borderRadius: 6, fontSize: 14, fontWeight: 600,
            }}
          >
            {CTA_PRIMARY}
          </a>
          <a href="#stations" style={{ fontSize: 13.5, color: 'var(--accent-ink)', fontWeight: 600 }}>
            {CTA_SECONDARY} →
          </a>
        </div>
      </div>
    </section>
  );
}
