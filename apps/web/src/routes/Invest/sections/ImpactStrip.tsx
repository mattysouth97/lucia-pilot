// apps/web/src/routes/Invest/sections/ImpactStrip.tsx
import {
  IMPACT_DETAIL_LINK, IMPACT_HEADLINE_LINE_1, IMPACT_HEADLINE_LINE_2, IMPACT_OVERLINE,
} from '../copy';
import { impactSplit } from '../data';

export function ImpactStrip() {
  return (
    <section
      aria-labelledby="impact-heading"
      className="landing-section--tight"
      style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
    >
      <div className="landing-container">
        <p id="impact-heading" className="overline">{IMPACT_OVERLINE}</p>
        <p style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--ink)', margin: '12px 0 20px', fontWeight: 600 }}>
          {IMPACT_HEADLINE_LINE_1}
          <br />
          {IMPACT_HEADLINE_LINE_2}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', alignItems: 'baseline', fontSize: 13, color: 'var(--ink-2)' }}>
          {impactSplit.groups.map((g, idx) => (
            <span key={g.code}>
              {g.label} <span className="num" style={{ fontWeight: 700 }}>{g.pct}%</span>
              {idx < impactSplit.groups.length - 1 && <span style={{ color: 'var(--muted-2)', marginLeft: 16 }}>·</span>}
            </span>
          ))}
        </div>
        <a
          href="/invest/disclosures/distribution"
          style={{ display: 'inline-block', marginTop: 18, fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}
        >
          → {IMPACT_DETAIL_LINK}
        </a>
      </div>
    </section>
  );
}
