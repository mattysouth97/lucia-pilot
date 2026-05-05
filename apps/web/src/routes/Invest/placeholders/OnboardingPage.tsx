// apps/web/src/routes/Invest/placeholders/OnboardingPage.tsx
//
// Public investor-facing simulator at /invest/onboarding.  Reuses the same
// simulation engine + UI as the analyst/operator surface at /simulator —
// single source of truth for the pro-forma model.

import { useRouteMeta } from '../meta';

import { InstallSimulator } from '@/routes/InstallSimulator';

export function OnboardingPage() {
  useRouteMeta({
    title: 'Lucia — 투자 시뮬레이션',
    description:
      '옥상·시스템·재무 파라미터를 조정하고 NPV·IRR·LCOE·25년 현금흐름을 실시간으로 확인하세요.',
    robots: 'index, follow',
    canonical: '/invest/onboarding',
  });

  return (
    <main
      className="landing-container"
      style={{ padding: '32px 24px 96px', display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <InstallSimulator />
    </main>
  );
}
