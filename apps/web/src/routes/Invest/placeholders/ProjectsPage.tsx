// apps/web/src/routes/Invest/placeholders/ProjectsPage.tsx
import { useRouteMeta } from '../meta';

export function ProjectsPage() {
  useRouteMeta({
    title: 'Lucia — 운영 발전소 (준비 중)',
    description: '전체 116동 발전소 페이지는 출시 준비 중입니다.',
    robots: 'index, follow',
  });
  return (
    <main className="landing-container" style={{ padding: '120px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>운영 발전소</h1>
      <p style={{ color: 'var(--muted)', marginTop: 12 }}>이 페이지는 출시 준비 중입니다.</p>
      <a href="/invest" style={{ marginTop: 24, display: 'inline-block', color: 'var(--accent-ink)', fontWeight: 600 }}>
        ← Lucia 홈으로
      </a>
    </main>
  );
}
