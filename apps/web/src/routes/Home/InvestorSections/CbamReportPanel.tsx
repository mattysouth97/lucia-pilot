// CbamReportPanel — quarterly CBAM (탄소국경조정제도) automated report download.
// Surfaces issuance dates, file-format compatibility, and download buttons.

import { Btn, Pill } from '@/components/atoms';

interface CbamReport {
  readonly id: string;
  readonly quarter: string;
  readonly periodFrom: string;
  readonly periodTo: string;
  readonly carbonAvoidedTons: number;
  readonly issuedAt: string | null;
  readonly status: 'issued' | 'preparing';
}

const REPORTS: CbamReport[] = [
  { id: 'cbam-26q2', quarter: '2026 Q2', periodFrom: '2026-04-01', periodTo: '2026-06-30', carbonAvoidedTons: 0,    issuedAt: null,         status: 'preparing' },
  { id: 'cbam-26q1', quarter: '2026 Q1', periodFrom: '2026-01-01', periodTo: '2026-03-31', carbonAvoidedTons: 268,  issuedAt: '2026-04-15', status: 'issued' },
  { id: 'cbam-25q4', quarter: '2025 Q4', periodFrom: '2025-10-01', periodTo: '2025-12-31', carbonAvoidedTons: 240,  issuedAt: '2026-01-15', status: 'issued' },
];

const DownIcon = (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v12m0 0-5-5m5 5 5-5M4 20h16" />
  </svg>
);

export function CbamReportPanel() {
  return (
    <section
      aria-labelledby="cbam-heading"
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Pill tone="indigo">CBAM</Pill>
            <span className="overline">탄소국경조정제도 자동 보고서</span>
          </div>
          <h3
            id="cbam-heading"
            style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}
          >
            EU 양식 호환 — 분기 발행
          </h3>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            EU CBAM Regulation (EU) 2023/956 양식 자동 채움 · XML/PDF 동시 발행
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {REPORTS.map((r) => (
          <article
            key={r.id}
            style={{
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-sm, 6px)',
              padding: '14px 16px',
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) auto',
              alignItems: 'center',
              background: r.status === 'issued' ? 'var(--bg)' : 'var(--panel)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{r.quarter}</span>
                {r.status === 'issued' ? (
                  <Pill tone="green" dot>발행 완료</Pill>
                ) : (
                  <Pill tone="amber" dot>준비 중</Pill>
                )}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }} className="num">
                {r.periodFrom} ~ {r.periodTo}
                {r.issuedAt && <> · 발행 {r.issuedAt}</>}
              </div>
            </div>
            <div>
              <div className="overline" style={{ marginBottom: 4 }}>탄소 회피량</div>
              <div className="num" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                {r.status === 'issued' ? `${r.carbonAvoidedTons.toLocaleString('ko-KR')} tCO₂eq` : '집계 중'}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 6,
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                opacity: r.status === 'issued' ? 1 : 0.45,
                pointerEvents: r.status === 'issued' ? 'auto' : 'none',
              }}
            >
              <Btn variant="secondary" size="sm" icon={DownIcon}>
                PDF
              </Btn>
              <Btn variant="ghost" size="sm" icon={DownIcon}>
                XML
              </Btn>
            </div>
          </article>
        ))}
      </div>

      <footer style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 4 }}>
        * 모든 보고서는 Hyperledger Fabric 원장 기록을 기반으로 자동 생성되며, EU CBAM 인증 위원회 검증을 통과한 양식을 따릅니다.
      </footer>
    </section>
  );
}
