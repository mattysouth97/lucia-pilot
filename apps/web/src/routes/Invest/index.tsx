// apps/web/src/routes/Invest/index.tsx
import { LandingFooter } from './LandingFooter';
import { LandingHeader } from './LandingHeader';
import { Disclosure } from './sections/Disclosure';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { ImpactStrip } from './sections/ImpactStrip';
import { LiveLedgerRibbon } from './sections/LiveLedgerRibbon';
import { PreFooterCTA } from './sections/PreFooterCTA';
import { StationGrid } from './sections/StationGrid';
import { TrustGrid } from './sections/TrustGrid';

export function Landing() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <ImpactStrip />
        <HowItWorks />
        <LiveLedgerRibbon />
        <StationGrid />
        <TrustGrid />
        <Disclosure />
        <PreFooterCTA />
      </main>
      <LandingFooter />
    </>
  );
}
