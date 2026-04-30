import type { ReactNode } from 'react';

import { Icons } from '@/components/Icons';

interface BottomNavProps {
  tab: string;
  setTab: (t: string) => void;
}

interface NavItem {
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: '개요',       icon: Icons['Home'] },
  { label: '정산 원장',  icon: Icons['Coin'] },
  { label: '동별 모니터', icon: Icons['Map'] },
  { label: '감사·보고',  icon: Icons['Chain'] },
  { label: '후보지 지도', icon: Icons['Search'] },
  { label: '관리자',     icon: Icons['Settings'] },
];

// BottomNav — fixed bottom navigation bar for <768 px viewports.
// Visibility is controlled purely by CSS media query (display:none at >=768px)
// so there is no hydration jank from a JS useMediaQuery hook.
// Calls the same setTab callback used by the Topbar.
export function BottomNav({ tab, setTab }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="하단 내비게이션">
      {NAV_ITEMS.map((item) => {
        const active = tab === item.label;
        return (
          <button
            key={item.label}
            className={`bottom-nav-item${active ? ' is-active' : ''}`}
            onClick={() => setTab(item.label)}
            aria-current={active ? 'page' : undefined}
          >
            {item.icon}
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
