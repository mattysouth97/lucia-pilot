// apps/web/src/routes/Home/InvestorHome.tsx
//
// RE100 buyer dashboard. The 'investor' role is now an RE100 PPA 매수자
// (corporate ESG buyer like SK하이닉스 ESG실), not a retail investor.
// Surfaces: PPA contract summary, issued RE100 certificates, monthly
// delivery chart, and CBAM (탄소국경조정제도) report download panel.

import { CbamReportPanel } from './InvestorSections/CbamReportPanel';
import { MonthlyDeliveryChart } from './InvestorSections/MonthlyDeliveryChart';
import { Re100CertificateTable } from './InvestorSections/Re100CertificateTable';
import { Re100ContractCard } from './InvestorSections/Re100ContractCard';

import { useRouteMeta } from '@/routes/Invest/meta';

export function InvestorHome() {
  useRouteMeta({
    title: 'Lucia — RE100 ESG 대시보드',
    description: 'RE100 PPA 매수 · 인증서 발급 · CBAM 자동 보고',
    robots: 'noindex, nofollow',
  });

  return (
    <main style={{ display: 'grid', gap: 16, padding: '16px 0' }}>
      <Re100ContractCard />
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        <Re100CertificateTable />
        <MonthlyDeliveryChart />
      </div>
      <CbamReportPanel />
    </main>
  );
}
