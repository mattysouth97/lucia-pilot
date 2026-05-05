// apps/lucia-energy/src/App.tsx
// LuciaEnergy landing — 13-section IA per spec §4.2.
import { useCallback, useRef } from 'react';

import { Footer } from './components/Footer';
import { Topbar } from './components/Topbar';
import { AutomationMatrix } from './sections/AutomationMatrix';
import { BlockchainSettlement } from './sections/BlockchainSettlement';
import { ComparisonMatrix } from './sections/ComparisonMatrix';
import { Hero } from './sections/Hero';
import { InquirySplit } from './sections/InquirySplit';
import { MultiAssetDER } from './sections/MultiAssetDER';
import { PublicCitizen } from './sections/PublicCitizen';
import { Roadmap } from './sections/Roadmap';
import { SecurityCertifications } from './sections/SecurityCertifications';
import { StandardsStrip } from './sections/StandardsStrip';

// Maps the chip-displayed Korean label to the PersonaEnum key used in the inquiry form.
// Kept inline (rather than in copy.ts) to keep the runtime ↔ schema link explicit.
const PERSONA_LABEL_TO_KEY: Record<string, string> = {
  '발전사업자': 'generator',
  '자산관리자·EPC': 'asset_manager',
  '주민조합원': 'resident',
  '중개사업자': 'broker',
  '공공발주처': 'public_procurer',
  '기업 RE100': 'corporate_re100',
};

export default function App() {
  const inquiryRef = useRef<HTMLDivElement | null>(null);
  const automationRef = useRef<HTMLDivElement | null>(null);

  const scrollToInquiry = useCallback(() => {
    inquiryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const scrollToAutomation = useCallback(() => {
    automationRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const onPersonaClick = useCallback(
    (label: string) => {
      const key = PERSONA_LABEL_TO_KEY[label] ?? 'other';
      window.history.replaceState(null, '', `#persona=${key}`);
      scrollToInquiry();
    },
    [scrollToInquiry],
  );

  return (
    <>
      <Topbar onInquiryClick={scrollToInquiry} />
      <main>
        <Hero onPrimaryClick={scrollToInquiry} onSecondaryClick={scrollToAutomation} />
        <div ref={automationRef}>
          <AutomationMatrix />
        </div>
        <MultiAssetDER onPersonaClick={onPersonaClick} />
        <BlockchainSettlement onPersonaClick={onPersonaClick} />
        <PublicCitizen onPersonaClick={onPersonaClick} />
        <StandardsStrip onPersonaClick={onPersonaClick} />
        <Roadmap />
        <ComparisonMatrix />
        <SecurityCertifications />
        <div ref={inquiryRef}>
          <InquirySplit />
        </div>
      </main>
      <Footer />
    </>
  );
}
