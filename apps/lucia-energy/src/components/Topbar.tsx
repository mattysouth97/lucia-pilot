// apps/lucia-energy/src/components/Topbar.tsx
// Floating white rounded navbar — service-style register, away from the page edges.
import type { CSSProperties } from 'react';

import { NAV } from '../copy';

interface TopbarProps {
  onInquiryClick: () => void;
}

export function Topbar({ onInquiryClick }: TopbarProps) {
  const investUrl =
    import.meta.env.VITE_LUCIA_INVEST_URL ?? 'http://localhost:5173/invest';
  const loginUrl = investUrl.replace(/\/invest\/?$/, '/login');

  return (
    <div
      style={{
        position: 'sticky',
        top: 16,
        zIndex: 40,
        padding: '0 var(--page-pad)',
      }}
    >
      <header
        role="banner"
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          background: 'var(--bar)',
          color: 'var(--bar-ink)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-floating)',
          border: '1px solid var(--bar-line)',
        }}
      >
        <a
          href="/"
          aria-label="Lucia Energy"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--bar-ink)',
            flexShrink: 0,
          }}
        >
          <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden>
            <path d="M2 18 L11 4 L20 18 Z" fill="var(--accent)" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
            {NAV.brand}
          </span>
        </a>

        <nav
          aria-label="메뉴"
          className="show-md+"
          style={{
            marginLeft: 32,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 22,
          }}
        >
          {NAV.menuItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={menuLinkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--bar-ink-2)')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            role="tablist"
            aria-label="사이트 선택"
            className="show-md+"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              padding: 3,
              borderRadius: 'var(--r-md)',
              background: 'rgba(0,0,0,0.04)',
            }}
          >
            <a href={investUrl} role="tab" aria-selected={false} style={tabStyle(false)}>
              {NAV.tabLh}
            </a>
            <a href="/" role="tab" aria-selected style={tabStyle(true)}>
              {NAV.tabEnergy}
            </a>
          </div>

          <a
            href={loginUrl}
            className="show-md+"
            style={menuLinkStyle}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--bar-ink-2)')}
          >
            {NAV.ctaLogin}
          </a>

          <button
            type="button"
            onClick={onInquiryClick}
            style={{
              background: 'var(--accent)',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '-0.005em',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 120ms ease-out',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-ink)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            {NAV.ctaInquiry}
          </button>
        </div>
      </header>
    </div>
  );
}

function tabStyle(active: boolean): CSSProperties {
  return {
    padding: '6px 12px',
    fontSize: 12.5,
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--ink)' : 'var(--bar-ink-2)',
    letterSpacing: '-0.01em',
    borderRadius: 'var(--r-sm)',
    background: active ? 'var(--bg-elevated)' : 'transparent',
    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  };
}

const menuLinkStyle: CSSProperties = {
  fontSize: 13.5,
  fontWeight: 500,
  color: 'var(--bar-ink-2)',
  letterSpacing: '-0.01em',
  whiteSpace: 'nowrap',
  transition: 'color 120ms ease-out',
};
