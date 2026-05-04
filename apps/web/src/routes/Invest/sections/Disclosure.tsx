// apps/web/src/routes/Invest/sections/Disclosure.tsx
import { FAQ_ITEMS, FAQ_TITLE, RISK_BULLETS, RISK_FULL_LINK, RISK_TITLE } from '../copy';

export function Disclosure() {
  return (
    <section aria-labelledby="disclosure-heading" className="landing-section">
      <div className="landing-container">
        <div className="disclosure-grid" style={{ display: 'grid', gap: 32 }}>
          <div>
            <h2 id="disclosure-heading" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px', letterSpacing: '-0.015em' }}>
              {RISK_TITLE}
            </h2>
            <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: 0, color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.7 }}>
              {RISK_BULLETS.map(bullet => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <a href="/invest/disclosures/risk" style={{ display: 'inline-block', marginTop: 18, fontSize: 12.5, color: 'var(--accent-ink)', fontWeight: 600 }}>
              → {RISK_FULL_LINK}
            </a>
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px', letterSpacing: '-0.015em' }}>
              {FAQ_TITLE}
            </h2>
            <div>
              {FAQ_ITEMS.map(item => (
                <details key={item.question} style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
                  <summary style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', listStyle: 'revert', letterSpacing: '-0.005em' }}>
                    {item.question}
                  </summary>
                  <p style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-2)' }}>
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
