import type { ReactNode } from 'react';

import { Icons } from '@/components/Icons';

interface BottomNavProps {
  tab: string;
  setTab: (t: string) => void;
}

interface NavItem {
  // Routing key — must match the corresponding Topbar tab value exactly.
  value: string;
  // Short display label — keeps each item narrow enough for a 7-up flex row on small viewports.
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { value: '개요',           label: '개요',   icon: Icons['Home'] },
  { value: '정산 원장',      label: '원장',   icon: Icons['Coin'] },
  { value: '동별 모니터',    label: '모니터', icon: Icons['Map'] },
  { value: '후보지 지도',    label: '지도',   icon: Icons['Search'] },
  { value: '투자 시뮬레이터', label: '시뮬',   icon: Icons['Chart'] },
  { value: '관리자',         label: '관리',   icon: Icons['Settings'] },
];

// BottomNav — fixed bottom navigation bar for <768 px viewports.
// Visibility is controlled purely by CSS media query (display:none at >=768px)
// so there is no hydration jank from a JS useMediaQuery hook.
// Calls the same setTab callback used by the Topbar — values must match Topbar TABS exactly.
export function BottomNav({ tab, setTab }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="하단 내비게이션">
      {NAV_ITEMS.map((item) => {
        const active = tab === item.value;
        return (
          <button
            key={item.value}
            className={`bottom-nav-item${active ? ' is-active' : ''}`}
            onClick={() => setTab(item.value)}
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
