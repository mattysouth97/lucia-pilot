import { Icons } from '@/components/Icons';

interface TopbarProps {
  tab: string;
  setTab: (t: string) => void;
}

const TABS = ['개요', '정산 원장', '동별 모니터', '감사·보고', '후보지 지도', '투자 시뮬레이터', '관리자'];

// Topbar — Lucia 정산 dark horizon line.
// See DESIGN.md "Topbar" section. Black surface, white type, underline tab indicator,
// no pill chrome, no gradient logo, no gradient avatar.
export function Topbar({ tab, setTab }: TopbarProps) {
  const unreadAnomalies = 3; // Hardcoded for now; will wire to real data later

  return (
    <div
      className="topbar-shell"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo — single white wedge mark, no gradient, no glow. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Lucia
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'var(--bar-ink-2)',
              letterSpacing: '-0.005em',
            }}
            className="show-md+"
          >
            가상공유거래 정산
          </span>
        </div>
      </div>

      {/* Tabs — text + underline indicator. Hidden on mobile (<768px) — bottom nav takes over. */}
      <div className="topbar-tabs" style={{ marginLeft: 12 }}>
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '0 14px',
                height: '100%',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--bar-ink)' : 'var(--bar-ink-2)',
                letterSpacing: '-0.005em',
                position: 'relative',
                transition: 'color .15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--bar-ink)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = 'var(--bar-ink-2)';
              }}
            >
              {t}
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    right: 14,
                    bottom: 0,
                    height: 2,
                    background: 'var(--accent)',
                    borderRadius: 0,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Search — flat field on the dark bar. */}
      <div
        className="topbar-search"
        style={{
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: '1px solid var(--bar-line)',
          padding: '7px 12px',
          borderRadius: 'var(--r-sm)',
          width: 280,
          color: 'var(--bar-ink-2)',
        }}
      >
        {Icons.Search}
        <span style={{ fontSize: 12.5 }}>동·정산ID·트랜잭션 검색</span>
        <span
          className="mono"
          style={{
            marginLeft: 'auto',
            fontSize: 10.5,
            color: 'var(--bar-ink-2)',
            border: '1px solid var(--bar-line)',
            padding: '1px 5px',
            borderRadius: 3,
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Status — single dot + monospace version. */}
      <div
        className="topbar-status"
        style={{
          alignItems: 'center',
          gap: 8,
          paddingLeft: 8,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: 'var(--accent)',
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--bar-ink)' }}>
          정산엔진 정상
        </span>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--bar-ink-2)' }}>
          v1.0.4
        </span>
      </div>

      {/* Bell — flat icon button, numeric badge indicator when unread. */}
      <button
        aria-label={`알림 ${unreadAnomalies}건`}
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--r-sm)',
          background: 'transparent',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--bar-ink-2)',
          position: 'relative',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bar-line)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {Icons.Bell}
        {unreadAnomalies > 0 && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 6,
              right: 7,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 999,
              background: 'var(--rose)',
              border: '1.5px solid var(--bar)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9.5,
              fontWeight: 700,
              lineHeight: 1,
              color: 'white',
            }}
          >
            {unreadAnomalies > 9 ? '9+' : unreadAnomalies}
          </span>
        )}
      </button>

      {/* User — flat square initial, plain text. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          paddingLeft: 12,
          borderLeft: '1px solid var(--bar-line)',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--r-sm)',
            background: 'var(--bar-line)',
            color: 'var(--bar-ink)',
            fontWeight: 600,
            fontSize: 11,
            display: 'grid',
            placeItems: 'center',
            letterSpacing: '-0.01em',
          }}
        >
          김
        </div>
        <div className="topbar-user-meta">
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              color: 'var(--bar-ink)',
              lineHeight: 1.2,
            }}
          >
            김지호 처장
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--bar-ink-2)',
              marginTop: 1,
              letterSpacing: '-0.005em',
            }}
          >
            LH ESG 경영실
          </div>
        </div>
        <span style={{ color: 'var(--bar-ink-2)' }}>{Icons.Caret}</span>
      </div>
    </div>
  );
}
