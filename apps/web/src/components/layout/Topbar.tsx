import { UserMenu } from './UserMenu';

import { useAuth } from '@/auth/AuthProvider';
import type { Role } from '@/auth/types';
import { Icons } from '@/components/Icons';

interface TopbarProps {
  tab: string;
  setTab: (t: string) => void;
}

// Short display labels to prevent overflow. Values (keys) are unchanged so all
// tab-switch logic in App.tsx/Dashboard continues to work without modification.
// Tabs are filtered per-role: analyst sees the read-only set; operator adds 관리자;
// resident and investor see no tabs (their UIs live elsewhere).
const ROLE_TABS: Record<Role, ReadonlyArray<{ value: string; label: string }>> = {
  analyst: [
    { value: '개요',           label: '개요'   },
    { value: '정산 원장',      label: '원장'   },
    { value: '동별 모니터',    label: '모니터' },
    { value: '감사·보고',      label: '보고'   },
    { value: '후보지 지도',    label: '지도'   },
    { value: '투자 시뮬레이터', label: '시뮬'  },
  ],
  operator: [
    { value: '개요',           label: '개요'   },
    { value: '정산 원장',      label: '원장'   },
    { value: '동별 모니터',    label: '모니터' },
    { value: '감사·보고',      label: '보고'   },
    { value: '후보지 지도',    label: '지도'   },
    { value: '투자 시뮬레이터', label: '시뮬'  },
    { value: '관리자',         label: '관리'   },
  ],
  resident: [],
  investor: [],
};

// Topbar — Lucia 정산 dark horizon line.
// Reference: miawmiaw invoice dashboard nav pattern — pill highlight on active,
// compact logo, icon-only actions on the right.
export function Topbar({ tab, setTab }: TopbarProps) {
  const unreadAnomalies = 3;
  const { user } = useAuth();
  if (!user) return null;
  const tabsForRole = ROLE_TABS[user.role];

  return (
    <div
      className="topbar-shell"
      style={{ position: 'sticky', top: 0, zIndex: 50 }}
    >
      {/* Logo — wedge mark + wordmark only, no subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Lucia
        </span>
      </div>

      {/* Tabs — pill highlight on active, no underline chrome */}
      <div className="topbar-tabs" style={{ marginLeft: 12 }}>
        {tabsForRole.map(({ value, label }) => {
          const active = tab === value;
          return (
            <button
              key={value}
              onClick={() => setTab(value)}
              style={{
                padding: '5px 9px',
                height: 'auto',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--bar-ink)' : 'var(--bar-ink-2)',
                letterSpacing: '-0.01em',
                borderRadius: 6,
                background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
                whiteSpace: 'nowrap',
                transition: 'color .15s, background .15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right-side cluster — tightly grouped */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        {/* Live status dot */}
        <span
          title="정산엔진 정상 v1.0.4"
          style={{
            width: 7, height: 7,
            borderRadius: 999,
            background: 'var(--accent)',
            display: 'inline-block',
            marginRight: 6,
          }}
        />

        {/* Search */}
        <button
          aria-label="검색 열기 (⌘K)"
          style={{
            width: 30, height: 30,
            borderRadius: 'var(--r-sm)',
            background: 'transparent',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--bar-ink-2)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bar-line)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {Icons.Search}
        </button>

        {/* Bell */}
        <button
          aria-label={`알림 ${unreadAnomalies}건`}
          style={{
            width: 30, height: 30,
            borderRadius: 'var(--r-sm)',
            background: 'transparent',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--bar-ink-2)',
            position: 'relative',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bar-line)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {Icons.Bell}
          {unreadAnomalies > 0 && (
            <span aria-hidden style={{
              position: 'absolute', top: 5, right: 6,
              minWidth: 16, height: 16, padding: '0 4px',
              borderRadius: 999,
              background: 'var(--rose)',
              border: '1.5px solid var(--bar)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9.5, fontWeight: 700, lineHeight: 1, color: 'white',
            }}>
              {unreadAnomalies > 9 ? '9+' : unreadAnomalies}
            </span>
          )}
        </button>

        {/* User menu — avatar + role-aware dropdown with logout */}
        <div style={{ marginLeft: 4 }}>
          <UserMenu />
        </div>
      </div>
    </div>
  );
}
