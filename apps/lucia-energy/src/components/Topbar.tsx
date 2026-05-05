// apps/lucia-energy/src/components/Topbar.tsx
// Black bar with cross-link tabs back to LH 햇빛발전소 + LuciaEnergy active.
// Right-hand `사업 문의` pill scrolls to inquiry section.
import type { CSSProperties } from 'react';

import { NAV } from '../copy';

interface TopbarProps {
  onInquiryClick: () => void;
}

export function Topbar({ onInquiryClick }: TopbarProps) {
  const investUrl = import.meta.env.VITE_LUCIA_INVEST_URL ?? '/invest';
  // Derive login URL from the invest URL host so subdomain / path-prefix
  // deployments work without a separate env var.
  const loginUrl = investUrl.replace(/\/invest\/?$/, '/login');

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--bar)',
        color: 'var(--bar-ink)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
      }}
    >
      <a
        href="/"
        aria-label="Lucia Energy"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--bar-ink)',
          flexShrink: 0,
        }}
      >
        <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden>
          <path d="M2 16 L10 4 L18 16 Z" fill="#FFFFFF" />
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
            onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.72)')}
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
          gap: 16,
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
            padding: 2,
            borderRadius: 6,
            background: 'rgba(255,255,255,0.06)',
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
          onMouseEnter={e => (e.currentTarget.style.color = '#FFFFFF')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.72)')}
        >
          {NAV.ctaLogin}
        </a>

        <button
          type="button"
          onClick={onInquiryClick}
          style={{
            background: 'var(--accent)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: 'var(--r-md)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {NAV.ctaInquiry}
        </button>
      </div>
    </header>
  );
}

function tabStyle(active: boolean): CSSProperties {
  return {
    padding: '5px 10px',
    fontSize: 12.5,
    fontWeight: active ? 600 : 400,
    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.72)',
    letterSpacing: '-0.01em',
    borderRadius: 4,
    background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  };
}

const menuLinkStyle: CSSProperties = {
  fontSize: 13.5,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.72)',
  letterSpacing: '-0.01em',
  whiteSpace: 'nowrap',
  transition: 'color 120ms ease-out',
};
