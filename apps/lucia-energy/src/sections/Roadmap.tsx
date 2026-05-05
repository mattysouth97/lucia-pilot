// apps/lucia-energy/src/sections/Roadmap.tsx
// Horizontal roadmap cards. Aspirational KPIs get *목표치 footnote; Phase 0 (internal PoC)
// is non-aspirational and renders without the asterisk.
import { ROADMAP } from '../copy';

export function Roadmap() {
  return (
    <section
      aria-labelledby="roadmap-heading"
      style={{ padding: '64px 24px', background: 'var(--bg)' }}
    >
      <h2
        id="roadmap-heading"
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {ROADMAP.heading}
      </h2>
      <div
        style={{
          marginTop: 32,
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 16,
        }}
      >
        {ROADMAP.phases.map(p => (
          <div
            key={p.phase}
            className="card card-pad"
            style={{ minWidth: 280, flexShrink: 0 }}
          >
            <div className="overline" style={{ color: 'var(--ink-3)' }}>{p.phase}</div>
            <div className="num" style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-2)' }}>
              {p.period}
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {p.focus}
            </div>
            <div
              className="num"
              style={{
                marginTop: 16,
                fontSize: 'var(--kpi-display)',
                fontWeight: 700,
                color: 'var(--accent)',
                lineHeight: 1.05,
              }}
            >
              {p.kpi}
            </div>
            {p.aspirational ? (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--ink-3)' }}>
                {ROADMAP.asteriskLabel}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p style={{ marginTop: 16, fontSize: 11, color: 'var(--ink-3)' }}>{ROADMAP.asteriskNote}</p>
    </section>
  );
}
