// apps/web/src/routes/Invest/LandingHeader.tsx
// Full-bleed black header — matches the dashboard AppShell Topbar so the
// public landing and authenticated app feel like the same product.
// Plain-text nav with "+" affordance for items that *could* surface a
// dropdown later. Mint CTA pill on the right.

import { useEffect, useState } from 'react';

import { CTA_PRIMARY, NAV_ITEMS, NAV_LOGIN } from './copy';

// Cross-link to apps/lucia-energy. Env-driven so subdomain vs path-prefix
// stays an ops decision; defaults to dev port 3002.
const LUCIA_ENERGY_URL =
  import.meta.env.VITE_LUCIA_ENERGY_URL ?? 'http://localhost:3002';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll, { passive: true } as never);
  }, []);

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--ink)',
        color: '#FFFFFF',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
        transition: 'border-bottom-color 150ms',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
      }}
    >
      <a
        href="/invest"
        aria-label="Lucia"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: '#FFFFFF',
          flexShrink: 0,
        }}
      >
        <svg role="img" aria-label="Lucia" width={20} height={20} viewBox="0 0 20 20">
          <path d="M2 16 L10 4 L18 16 Z" fill="#FFFFFF" />
        </svg>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Lucia</span>
      </a>

      <nav className="show-md+" style={{ marginLeft: 32, display: 'flex', gap: 22 }}>
        {NAV_ITEMS.map(item => (
          <a
            key={item.href}
            href={item.href}
            style={{
              fontSize: 13.5,
              color: 'rgba(255,255,255,0.78)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              transition: 'color 120ms ease-out',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.78)')}
          >
            {item.label}
            <span aria-hidden style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)' }}>
              +
            </span>
          </a>
        ))}
      </nav>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          role="tablist"
          aria-label="사이트 선택"
          className="show-md+"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            padding: 2,
            borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          <a
            href="/invest"
            role="tab"
            aria-selected
            style={{
              padding: '5px 10px',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.13)',
              whiteSpace: 'nowrap',
            }}
          >
            LH햇빛발전소
          </a>
          <a
            href={LUCIA_ENERGY_URL}
            role="tab"
            aria-selected={false}
            style={{
              padding: '5px 10px',
              fontSize: 12.5,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.72)',
              letterSpacing: '-0.01em',
              borderRadius: 4,
              background: 'transparent',
              whiteSpace: 'nowrap',
              transition: 'color 120ms ease-out, background-color 120ms ease-out',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            LuciaEnergy
          </a>
        </div>
        <a
          href="/login"
          className="show-md+"
          style={{
            fontSize: 13.5,
            color: 'rgba(255,255,255,0.78)',
            transition: 'color 120ms ease-out',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.78)')}
        >
          {NAV_LOGIN}
        </a>
        <a
          href="/invest/onboarding"
          style={{
            background: 'var(--accent)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            transition: 'background-color 120ms ease-out, transform 120ms ease-out',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--accent-ink)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--accent)';
          }}
        >
          {CTA_PRIMARY}
        </a>
        <button
          aria-label={drawerOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(o => !o)}
          className="show-mobile"
          style={{
            width: 32,
            height: 32,
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 4,
            background: 'transparent',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
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
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            background: 'var(--ink)',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 39,
          }}
        >
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              style={{ fontSize: 14, color: '#FFFFFF', padding: '8px 0' }}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/login"
            onClick={() => setDrawerOpen(false)}
            style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}
          >
            {NAV_LOGIN}
          </a>
        </div>
      )}
    </header>
  );
}
