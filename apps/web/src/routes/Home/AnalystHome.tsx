// apps/web/src/routes/Home/AnalystHome.tsx
import { Dashboard } from '@/routes/Dashboard';
import { useRouteMeta } from '@/routes/Invest/meta';

export function AnalystHome() {
  useRouteMeta({
    title: 'Lucia — 분석가 대시보드',
    description: 'LH ESG 분석가 대시보드',
    robots: 'noindex, nofollow',
  });
  return <Dashboard />;
}
