// apps/web/src/routes/Invest/placeholders/OnboardingPage.tsx
import { useRouteMeta } from '../meta';

export function OnboardingPage() {
  useRouteMeta({
    title: 'Lucia — 투자 시작 (준비 중)',
    description: '본인인증 및 투자 신청 페이지는 출시 준비 중입니다.',
    robots: 'index, follow',
  });
  return (
    <main className="landing-container" style={{ padding: '120px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>투자 시작</h1>
      <p style={{ color: 'var(--muted)', marginTop: 12 }}>본인인증 및 투자 신청은 출시 준비 중입니다.</p>
      <a href="/invest" style={{ marginTop: 24, display: 'inline-block', color: 'var(--accent-ink)', fontWeight: 600 }}>
        ← Lucia 홈으로
      </a>
    </main>
  );
}
