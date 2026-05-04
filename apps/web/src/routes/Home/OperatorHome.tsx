// apps/web/src/routes/Home/OperatorHome.tsx
import { Dashboard } from '@/routes/Dashboard';

export function OperatorHome() {
  return (
    <>
      <OpsToolPanel />
      <Dashboard />
    </>
  );
}

function OpsToolPanel() {
  return (
    <section
      aria-label="운영 도구"
      className="card card-pad"
      style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>운영 도구</div>
      <a href="/admin" style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}>관리자 콘솔 →</a>
      <a href="/admin#anomalies" style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}>이상 큐 →</a>
      <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--muted)' }}>
        이번 주 이상 처리: <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>3</span>건
      </span>
    </section>
  );
}
