// Hero — full-bleed rooftop image as backdrop, light text overlay, monumental
// AUM number, interactive 116-building constellation in the bottom-right.
// Image lives at /hero-rooftop.jpg (apps/web/public/hero-rooftop.jpg). If
// missing, a sunset CSS gradient stands in so the section never looks broken.

import { useEffect, useState } from 'react';

import {
  CTA_PRIMARY, CTA_SECONDARY, HERO_OVERLINE, HERO_SUB, HERO_TITLE, HERO_TRUST_BADGES,
} from '../copy';
import { aumStats } from '../data';

import { CustomerReviews } from './CustomerReviews';

const FORMAT_KRW = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

const HERO_IMAGE_URL = '/hero-rooftop.jpg';
// Sunset → solar-blue → ink fallback gradient if the image is missing.
const HERO_FALLBACK_GRADIENT =
  'linear-gradient(110deg, #F4A261 0%, #E76F51 22%, #2A4060 58%, #0A0C0F 100%)';

function useCountUp(target: number, durationMs = 1400): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return v;
}

export function Hero() {
  const aumStat = aumStats[0]!;
  const yieldStat = aumStats[1]!;
  const opsStat = aumStats[2]!;
  const aumValue = useCountUp(aumStat.value);

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: 'clamp(620px, 88vh, 880px)',
        background: HERO_FALLBACK_GRADIENT,
        backgroundImage: `url(${HERO_IMAGE_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFFFFF',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {/* Layered overlays for legibility:
            1. Side-fade — darkens the left where text sits, leaves panels visible right
            2. Bottom-fade — blends into the next section's background */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(95deg,
              rgba(10,12,15,0.86) 0%,
              rgba(10,12,15,0.62) 38%,
              rgba(10,12,15,0.28) 64%,
              rgba(10,12,15,0.10) 100%),
            linear-gradient(to bottom,
              transparent 62%,
              rgba(10,12,15,0.35) 84%,
              var(--bg) 100%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Foreground container */}
      <div
        className="landing-container"
        style={{
          position: 'relative',
          zIndex: 1,
          paddingTop: 56,
          paddingBottom: 96,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          minHeight: 'inherit',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p
            className="overline"
            style={{
              color: 'rgba(255,255,255,0.78)',
              letterSpacing: '0.08em',
              margin: 0,
            }}
          >
            {HERO_OVERLINE}
          </p>

          {/* Simplified tagline — the editorial promise */}
          <h1
            style={{
              fontSize: 'clamp(40px, 6.4vw, 80px)',
              fontWeight: 700,
              letterSpacing: '-0.045em',
              lineHeight: 1.04,
              margin: '8px 0 0',
              color: '#FFFFFF',
              maxWidth: '14ch',
              textShadow: '0 1px 2px rgba(0,0,0,0.25)',
            }}
          >
            {HERO_TITLE}
          </h1>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.82)',
              maxWidth: '54ch',
              margin: '4px 0 0',
              textShadow: '0 1px 2px rgba(0,0,0,0.20)',
            }}
          >
            {HERO_SUB}
          </p>
        </div>

        <div style={{ display: 'grid', gap: 28 }}>
          {/* Monumental AUM — the brand's hero number */}
          <div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 6,
              }}
            >
              {aumStat.label} · 운영 누적
            </div>
            <div
              className="kpi-metric"
              style={{
                fontSize: 'clamp(48px, 7.6vw, 88px)',
                letterSpacing: '-0.04em',
                color: '#FFFFFF',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.25)',
              }}
            >
              ₩{FORMAT_KRW.format(Math.round(aumValue))}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.68)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{aumStat.helper}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 8px' }}>·</span>
              지난 12개월 모든 분배 정시 집행
            </div>
          </div>

          {/* Two-column row: CTAs + sub-stats on left, constellation on right */}
          <div
            style={{
              display: 'grid',
              gap: 24,
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
              alignItems: 'end',
            }}
            className="hero-row"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
                <a
                  href="/invest/onboarding"
                  style={{
                    background: 'var(--accent)',
                    color: '#FFFFFF',
                    padding: '14px 28px',
                    borderRadius: 6,
                    fontSize: 14.5,
                    fontWeight: 700,
                    letterSpacing: '-0.005em',
                  }}
                >
                  {CTA_PRIMARY} →
                </a>
                <a
                  href="/invest/projects"
                  style={{
                    fontSize: 13.5,
                    color: '#FFFFFF',
                    fontWeight: 600,
                    borderBottom: '1px solid rgba(255,255,255,0.5)',
                    paddingBottom: 1,
                  }}
                >
                  {CTA_SECONDARY} →
                </a>
              </div>

              {/* Sub-stat duo — yield + ops */}
              <div
                style={{
                  display: 'grid',
                  gap: 12,
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  maxWidth: 460,
                }}
              >
                <SubStat
                  label={yieldStat.label}
                  value={`${yieldStat.value.toFixed(2)}%`}
                  helper={yieldStat.helper}
                />
                <SubStat
                  label={opsStat.label}
                  value={`${FORMAT_KRW.format(opsStat.value)}동`}
                  helper={opsStat.helper}
                />
              </div>
            </div>

            {/* Customer review cards — 3 stacked over the rooftop image with dark glass backdrop */}
            <div className="hero-diagram">
              <CustomerReviews variant="hero" />
            </div>
          </div>

          {/* Trust ribbon */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px 22px',
              alignItems: 'center',
              paddingTop: 18,
              borderTop: '1px solid rgba(255,255,255,0.18)',
            }}
          >
            {HERO_TRUST_BADGES.map((b) => (
              <span
                key={b}
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.78)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  letterSpacing: '-0.005em',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: 'var(--accent)',
                    flexShrink: 0,
                  }}
                />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile fallback — stack the constellation under the hero text instead of side-by-side */}
      <style>{`
        @media (max-width: 900px) {
          #hero .hero-row {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          #hero .hero-diagram {
            margin-top: 8px;
          }
        }
      `}</style>
    </section>
  );
}

function SubStat({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div style={{ paddingLeft: 14, borderLeft: '2px solid rgba(255,255,255,0.28)' }}>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        className="kpi-metric"
        style={{
          fontSize: 26,
          letterSpacing: '-0.025em',
          color: '#FFFFFF',
          textShadow: '0 1px 2px rgba(0,0,0,0.22)',
        }}
      >
        {value}
      </div>
      {helper && (
        <div style={{ marginTop: 4, fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>
          {helper}
        </div>
      )}
    </div>
  );
}
