// 모니터 — operations monitoring page.
// Surfaces the realtime generation chart, building-level ranking, anomaly queue,
// and capacity / RE100 PPA buyers. Role-gated to analyst + operator at the route.

import { AnomalyCard } from '@/components/cards/AnomalyCard';
import { BuildingsCard } from '@/components/cards/BuildingsCard';
import { GenerationCard } from '@/components/cards/GenerationCard';
import { LoadTestCard } from '@/components/cards/LoadTestCard';
import { RE100Card } from '@/components/cards/RE100Card';

export function MonitorPage() {
  return (
    <>
      <header style={{ marginBottom: 22 }}>
        <div className="overline" style={{ marginBottom: 6 }}>OPERATIONS · FRD-2026-001</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>
          모니터
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 0' }}>
          실시간 발전 · 이상 감지 · 동별 효율 랭킹
        </p>
      </header>

      <div className="grid-dashboard">
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <GenerationCard />
          <div id="buildings-card">
            <BuildingsCard />
          </div>
          <div className="grid-card-pair-eq">
            <RE100Card />
            <div id="load-test-card">
              <LoadTestCard />
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 16,
            alignContent: 'start',
            gridTemplateColumns: 'minmax(0, 1fr)',
          }}
        >
          <AnomalyCard />
        </div>
      </div>
    </>
  );
}
