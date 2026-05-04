// apps/web/src/routes/Invest/index.tsx
import { LandingHeader } from './LandingHeader';
import { Hero } from './sections/Hero';
import { ImpactStrip } from './sections/ImpactStrip';

export function Landing() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <ImpactStrip />
      </main>
    </>
  );
}
