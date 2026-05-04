// apps/web/src/routes/Home/InvestorHome.tsx
import { AumCard } from './InvestorSections/AumCard';
import { HoldingsTable } from './InvestorSections/HoldingsTable';
import { SettlementHistory } from './InvestorSections/SettlementHistory';
import { YieldChart } from './InvestorSections/YieldChart';

import { useRouteMeta } from '@/routes/Invest/meta';

export function InvestorHome() {
  useRouteMeta({
    title: 'Lucia — 투자 대시보드',
    description: '나의 햇빛 투자 대시보드',
    robots: 'noindex, nofollow',
  });

  return (
    <main style={{ display: 'grid', gap: 16, padding: '16px 0' }}>
      <AumCard />
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <HoldingsTable />
        <YieldChart />
      </div>
      <SettlementHistory />
    </main>
  );
}
