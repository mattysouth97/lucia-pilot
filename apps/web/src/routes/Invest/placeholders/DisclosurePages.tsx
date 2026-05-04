// apps/web/src/routes/Invest/placeholders/DisclosurePages.tsx
import { useRouteMeta } from '../meta';

export function DisclosurePages() {
  useRouteMeta({
    title: 'Lucia — 자료실 (준비 중)',
    description: '약관 / 개인정보처리방침 / 위험 고지 문서는 출시 준비 중입니다.',
    robots: 'index, follow',
  });
  return (
    <main className="landing-container" style={{ padding: '120px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>자료실</h1>
      <p style={{ color: 'var(--muted)', marginTop: 12 }}>약관 · 개인정보처리방침 · 위험 고지 문서는 출시 준비 중입니다.</p>
      <a href="/invest" style={{ marginTop: 24, display: 'inline-block', color: 'var(--accent-ink)', fontWeight: 600 }}>
        ← Lucia 홈으로
      </a>
    </main>
  );
}
