// FR-M-001 main dashboard — prototype composition ported to production stack.
// See untitled/project/src/app.jsx for the original layout reference.

import { Btn } from '@/components/atoms';
import { Icons } from '@/components/Icons';
import { StatsRow } from '@/components/cards/StatsRow';
import { GenerationCard } from '@/components/cards/GenerationCard';
import { DistributionCard } from '@/components/cards/DistributionCard';
import { SankeyCard } from '@/components/cards/SankeyCard';
import { BuildingsCard } from '@/components/cards/BuildingsCard';
import { BlockchainCard } from '@/components/cards/BlockchainCard';
import { AnomalyCard } from '@/components/cards/AnomalyCard';
import { RE100Card } from '@/components/cards/RE100Card';
import { ResidentCard } from '@/components/cards/ResidentCard';
import { LoadTestCard } from '@/components/cards/LoadTestCard';
import { Sidebar } from '@/components/layout/Sidebar';
import { useLuciaModals } from '@/lib/modals';

export function Dashboard() {
  const { openTamper, openReport } = useLuciaModals();

  return (
    <>
      {/* Header — greeting, hero title, meta line, period chip + buttons */}
      <div className="hero-header">
        <div>
          <div
            style={{
              fontSize: 13,
              color: '#6B7280',
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            안녕하세요, 김지호 처장님
          </div>
          <div className="hero-title">
            LH옥상 사이트-A, 오늘도 잘 발전 중입니다
          </div>
          <div className="hero-meta">
            <span>2026년 4월 30일 (목) · 14:24 KST</span>
            <span style={{ color: '#E2E5EA' }}>·</span>
            <span>
              현재 발전 중{' '}
              <span className="num" style={{ color: '#047857', fontWeight: 700 }}>
                112동
              </span>
            </span>
            <span style={{ color: '#E2E5EA' }}>·</span>
            <span>일조 양호 · 25.4°C</span>
          </div>
        </div>

        <div className="hero-actions">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              border: '1px solid var(--line-2)',
              padding: '8px 14px',
              borderRadius: 999,
              height: 40,
            }}
          >
            {Icons.Clock}
            <span style={{ fontSize: 12.5, color: '#6B7280' }}>기간</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>2026년 4월</span>
            {Icons.Caret}
          </div>
          <Btn variant="secondary" icon={Icons.Lock} onClick={openTamper}>
            변조 시도 데모
          </Btn>
          <Btn variant="primary" icon={Icons.Doc} onClick={openReport}>
            감사 보고서 생성
          </Btn>
        </div>
      </div>

      {/* KPI row */}
      <StatsRow />

      {/* Two-column main grid */}
      <div className="grid-dashboard" style={{ marginTop: 16 }}>
        {/* Left column */}
        <div style={{ display: 'grid', gap: 16 }}>
          <GenerationCard />
          <div id="sankey-card">
            <SankeyCard />
          </div>
          <div className="grid-card-pair" id="distribution-blockchain-row">
            <div id="distribution-card">
              <DistributionCard />
            </div>
            <div id="blockchain-card" style={{ display: 'grid', gap: 16 }}>
              <BlockchainCard />
            </div>
          </div>
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

        {/* Right rail */}
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <Sidebar />
          <AnomalyCard />
          <ResidentCard />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 30,
          paddingTop: 18,
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px 16px',
          fontSize: 11.5,
          color: '#9AA0AB',
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <span>FRD-2026-001 v1.0 · MVP 22/22</span>
          <span>Hyperledger Fabric 2.5 · Local Network</span>
          <span>KIE-REMS Lite · TheKIE Digital Platform</span>
        </div>
        <div className="mono">build 1.0.4 · 2026-04-30 · M+3 demo-ready</div>
      </div>
    </>
  );
}
