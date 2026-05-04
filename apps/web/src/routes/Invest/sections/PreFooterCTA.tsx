// apps/web/src/routes/Invest/sections/PreFooterCTA.tsx
import { CTA_PRIMARY, PRE_FOOTER_HEADLINE, PRE_FOOTER_LOGIN_LINK } from '../copy';

export function PreFooterCTA() {
  return (
    <section aria-label="투자 시작" style={{ background: 'var(--ink)', color: '#fff' }}>
      <div className="landing-container" style={{ padding: '56px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 24px' }}>
          {PRE_FOOTER_HEADLINE}
        </p>
        <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
          <a
            href="/invest/onboarding"
            style={{
              background: '#fff', color: 'var(--ink)',
              padding: '12px 24px', borderRadius: 6, fontSize: 14, fontWeight: 600,
            }}
          >
            {CTA_PRIMARY} →
          </a>
          <a href="/invest/onboarding" style={{ fontSize: 13, color: '#A8B4CC' }}>
            {PRE_FOOTER_LOGIN_LINK}
          </a>
        </div>
      </div>
    </section>
  );
}
