// apps/web/src/routes/Home/AnalystHome.tsx
//
// FR-M-001 — analyst (LH ESG 경영실) audit-integrity dashboard.
// Composition: AuditIntegrityHero → DistributionAuditCard → ActivityZone (with
// integrity-timeline rail, analyst-tilted defaults) → audit footer.
//
// Stops wrapping <Dashboard /> (operator-only now). See
// docs/superpowers/specs/2026-05-06-analyst-dashboard-design.md for the 17
// design decisions this implements.

import { ActivityZone } from './ActivityZone';
import { AuditIntegrityHero } from './AuditIntegrityHero';
import { DistributionAuditCard } from './DistributionAuditCard';
import { IntegrityTimelineCard } from './IntegrityTimelineCard';
import { DISTRIBUTION_ROUND_2026_04, INTEGRITY_SUMMARY, INTEGRITY_TIMELINE_30D } from './analystFixtures';

import { useAuth } from '@/auth/AuthProvider';
import { useLuciaModals } from '@/lib/modals';
import { useRouteMeta } from '@/routes/Invest/meta';

export function AnalystHome() {
  useRouteMeta({
    title: 'Lucia — LH ESG 분석가 대시보드',
    description: 'LH ESG 분석가 대시보드 — 감사 무결성 및 환원 분배 검증',
    robots: 'noindex, nofollow',
  });

  const { user } = useAuth();
  const { openReport, openTx, openSankey } = useLuciaModals();

  const greeting = {
    displayName: user?.displayName ?? '분석가',
    honorific: user?.honorific,
  };

  return (
    <>
      <AuditIntegrityHero
        greeting={greeting}
        period={DISTRIBUTION_ROUND_2026_04.period}
        state="fresh"
        data={INTEGRITY_SUMMARY}
        onReportClick={openReport}
      />

      <DistributionAuditCard
        round={DISTRIBUTION_ROUND_2026_04}
        onSankeyClick={openSankey}
      />

      <div style={{ marginTop: 24 }}>
        <ActivityZone
          initialFilters={['주거비 환원', '가상공유거래']}
          rightRail={<IntegrityTimelineCard data={INTEGRITY_TIMELINE_30D} />}
          onRowClick={openTx}
        />
      </div>

      <footer
        style={{
          marginTop: 32,
          paddingTop: 16,
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px 16px',
          fontSize: 11,
          color: 'var(--muted-2)',
          letterSpacing: '-0.005em',
        }}
      >
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span>FRD-2026-001 · 2026.04 라운드</span>
          <span>Hyperledger Fabric 2.5 · LevelDB · 4-node</span>
        </div>
        <div className="mono" style={{ fontSize: 10.5 }}>build 1.0.5 · 2026-05-06</div>
      </footer>
    </>
  );
}
