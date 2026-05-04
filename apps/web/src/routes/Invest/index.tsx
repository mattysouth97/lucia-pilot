// apps/web/src/routes/Invest/index.tsx
import { LandingHeader } from './LandingHeader';
import { Hero } from './sections/Hero';

export function Landing() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
      </main>
    </>
  );
}
