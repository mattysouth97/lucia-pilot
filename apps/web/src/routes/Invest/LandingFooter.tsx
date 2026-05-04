// apps/web/src/routes/Invest/LandingFooter.tsx
import { FOOTER_COLUMNS, FOOTER_COPYRIGHT, FOOTER_REGULATORY } from './copy';

export function LandingFooter() {
  return (
    <footer role="contentinfo" style={{ borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
      <div className="landing-container" style={{ padding: '48px 24px 32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <svg role="img" aria-label="Lucia" width={16} height={16} viewBox="0 0 20 20">
            <path d="M2 16 L10 4 L18 16 Z" fill="var(--ink)" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.015em' }}>Lucia</span>
        </div>

        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 32 }}>
          {FOOTER_COLUMNS.map(col => (
            <div key={col.title}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px' }}>{col.title}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <a href={link.href} style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, fontSize: 11.5, color: 'var(--muted-2)', display: 'grid', gap: 6 }}>
          <p style={{ margin: 0 }}>{FOOTER_COPYRIGHT}</p>
          <p style={{ margin: 0 }}>{FOOTER_REGULATORY}</p>
        </div>
      </div>
    </footer>
  );
}
