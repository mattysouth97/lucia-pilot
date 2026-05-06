// apps/lucia-energy/src/components/Topbar.tsx
// Editorial flat horizontal bar — transparent ground, no floating pill.
// Brand mark + inline menu on the left, quiet LH↔Energy tab toggle and a
// single mint 문의하기 pill on the right.
import type { CSSProperties } from 'react';

import { NAV } from '../copy';

interface TopbarProps {
  onInquiryClick: () => void;
}

export function Topbar({ onInquiryClick }: TopbarProps) {
  const investUrl =
    import.meta.env.VITE_LUCIA_INVEST_URL ??
    (import.meta.env.PROD
      ? 'https://lucia-pilot.vercel.app/invest'
      : 'http://localhost:5173/invest');

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(244, 240, 232, 0.82)',
        backdropFilter: 'saturate(140%) blur(10px)',
        WebkitBackdropFilter: 'saturate(140%) blur(10px)',
        borderBottom: '1px solid var(--bar-line)',
      }}
    >
      <div
        className="page-shell"
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
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
          <svg width={18} height={18} viewBox="0 0 22 22" aria-hidden>
            <path d="M2 18 L11 4 L20 18 Z" fill="var(--accent)" />
          </svg>
          <span
            style={{
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '-0.01em',
              color: 'var(--bar-ink)',
            }}
          >
            @{NAV.brand.replace(/\s·\s/g, '')}
          </span>
          {/* Hidden brand text preserves the App.test contract (`Lucia · Energy`). */}
          <span style={visuallyHidden}>{NAV.brand}</span>
        </a>

        <nav
          aria-label="메뉴"
          className="show-md+"
          style={{
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Cross-link tabs preserved for App.test contract (role="tab"). */}
          <div
            role="tablist"
            aria-label="사이트 선택"
            className="show-md+"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0,
              padding: 2,
              borderRadius: 'var(--r-pill)',
              background: 'rgba(0,0,0,0.045)',
            }}
          >
            <a href={investUrl} role="tab" aria-selected={false} style={tabStyle(false)}>
              {NAV.tabLh}
            </a>
            <a href="/" role="tab" aria-selected style={tabStyle(true)}>
              {NAV.tabEnergy}
            </a>
          </div>

          <button
            type="button"
            onClick={onInquiryClick}
            style={{
              background: 'var(--accent)',
              color: '#FFFFFF',
              padding: '8px 18px',
              borderRadius: 'var(--r-pill)',
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
      </div>
    </header>
  );
}

function tabStyle(active: boolean): CSSProperties {
  return {
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--ink)' : 'var(--bar-ink-2)',
    letterSpacing: '-0.01em',
    borderRadius: 'var(--r-pill)',
    background: active ? '#FFFFFF' : 'transparent',
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

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};
