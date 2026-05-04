// apps/web/src/routes/Invest/LandingHeader.tsx
import { useEffect, useState } from 'react';

import { CTA_PRIMARY, NAV_ITEMS, NAV_LOGIN } from './copy';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      role="banner"
      style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--panel)',
        borderBottom: scrolled ? '1px solid var(--line)' : '1px solid transparent',
        transition: 'border-bottom-color 150ms',
        height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
      }}
    >
      <a href="/invest" aria-label="Lucia" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <svg role="img" aria-label="Lucia" width={20} height={20} viewBox="0 0 20 20">
          <path d="M2 16 L10 4 L18 16 Z" fill="var(--ink)" />
        </svg>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Lucia</span>
      </a>

      <nav className="show-md+" style={{ marginLeft: 32, display: 'flex', gap: 24 }}>
        {NAV_ITEMS.map(item => (
          <a key={item.href} href={item.href} style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
            {item.label}
          </a>
        ))}
      </nav>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/invest/onboarding" className="show-md+" style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
          {NAV_LOGIN}
        </a>
        <a
          href="/invest/onboarding"
          style={{
            background: 'var(--ink)', color: '#fff',
            padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600,
          }}
        >
          {CTA_PRIMARY}
        </a>
        <button
          aria-label={drawerOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(o => !o)}
          className="show-mobile"
          style={{ width: 32, height: 32, border: '1px solid var(--line)', borderRadius: 4 }}
          data-testid="landing-header-menu"
        >
          ☰
        </button>
      </div>

      {drawerOpen && (
        <div
          className="show-mobile"
          role="dialog"
          aria-label="모바일 메뉴"
          style={{
            position: 'absolute', top: 56, left: 0, right: 0,
            background: 'var(--panel)', borderTop: '1px solid var(--line)',
            padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12,
          }}
        >
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              style={{ fontSize: 14, color: 'var(--ink)', padding: '8px 0' }}
            >
              {item.label}
            </a>
          ))}
          <a href="/invest/onboarding" onClick={() => setDrawerOpen(false)} style={{ fontSize: 14, color: 'var(--ink-2)' }}>
            {NAV_LOGIN}
          </a>
        </div>
      )}
    </header>
  );
}
