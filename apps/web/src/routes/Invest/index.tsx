// apps/web/src/routes/Invest/index.tsx
import { LandingFooter } from './LandingFooter';
import { LandingHeader } from './LandingHeader';
import { NotificationRibbon } from './NotificationRibbon';
import { useRouteMeta } from './meta';
import { Disclosure } from './sections/Disclosure';
import { EditorialStatement } from './sections/EditorialStatement';
import { EnergyFlow } from './sections/EnergyFlow';
import { Hero } from './sections/Hero';
import { PreFooterCTA } from './sections/PreFooterCTA';
import { YieldHistory } from './sections/YieldHistory';

export function Landing() {
  useRouteMeta({
    title: 'Lucia — 햇빛으로 받는, 투명한 정기 수익',
    description:
      '한국토지주택공사 매입임대주택 옥상 발전소의 SMP/REC 정산 수익을 블록체인으로 검증하고 투자자에게 분배하는 햇빛 금융상품, Lucia.',
    robots: 'index, follow',
    canonical: '/invest',
  });

  return (
    <>
      <NotificationRibbon />
      <LandingHeader />
      <main id="main">
        <Hero />
        <EditorialStatement />
        <EnergyFlow />
        <YieldHistory />
        <Disclosure />
        <PreFooterCTA />
      </main>
      <LandingFooter />
    </>
  );
}
