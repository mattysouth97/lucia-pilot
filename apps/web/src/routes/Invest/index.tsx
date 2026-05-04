// apps/web/src/routes/Invest/index.tsx
import { LandingHeader } from './LandingHeader';
import { Hero } from './sections/Hero';
import { HowItWorks } from './sections/HowItWorks';
import { ImpactStrip } from './sections/ImpactStrip';
import { LiveLedgerRibbon } from './sections/LiveLedgerRibbon';
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
      </main>
    </>
  );
}
