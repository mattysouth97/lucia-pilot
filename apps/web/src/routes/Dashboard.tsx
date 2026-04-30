// FR-M-001 main dashboard.
// Utilitarian refinement — see DESIGN.md "Hero header" and PRODUCT.md
// "strategic principles". Original prototype layout in untitled/project/src/app.jsx
// is preserved structurally; styling is rewritten for the audit-grade register.

import { Icons } from '@/components/Icons';
import { Btn } from '@/components/atoms';
import { AnomalyCard } from '@/components/cards/AnomalyCard';
import { BlockchainCard } from '@/components/cards/BlockchainCard';
import { BuildingsCard } from '@/components/cards/BuildingsCard';
import { DistributionCard } from '@/components/cards/DistributionCard';
import { GenerationCard } from '@/components/cards/GenerationCard';
import { LoadTestCard } from '@/components/cards/LoadTestCard';
import { RE100Card } from '@/components/cards/RE100Card';
import { ResidentCard } from '@/components/cards/ResidentCard';
import { SankeyCard } from '@/components/cards/SankeyCard';
import { StatsRow } from '@/components/cards/StatsRow';
import { Sidebar } from '@/components/layout/Sidebar';
import { useLuciaModals } from '@/lib/modals';

export function Dashboard() {
  const { openTamper, openReport } = useLuciaModals();

  return (
    <>
      {/* Hero header — greeting, title, period meta, primary actions */}
      <div className="hero-header">
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              marginBottom: 10,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            안녕하세요, 김지호 처장님
          </div>
          <div className="hero-title">
            LH옥상 사이트-A, 오늘도 잘 발전 중입니다
          </div>
          <div className="hero-meta">
            <span className="num" style={{ color: 'var(--ink-2)' }}>
              2026.04.30
            </span>
            <span style={{ color: 'var(--line-2)' }}>·</span>
            <span className="num" style={{ color: 'var(--ink-2)' }}>14:24 KST</span>
            <span style={{ color: 'var(--line-2)' }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="live-dot" />
              <span>현재 발전 중</span>
              <span
                className="num"
                style={{ color: 'var(--accent-ink)', fontWeight: 700 }}
              >
                112동
              </span>
              <span style={{ color: 'var(--muted-2)' }}>/ 116동</span>
            </span>
            <span style={{ color: 'var(--line-2)' }}>·</span>
            <span>일조 양호 · 25.4°C</span>
          </div>
        </div>

        <div className="hero-actions">
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--panel)',
              border: '1px solid var(--line-2)',
              padding: '8px 12px',
              borderRadius: 'var(--r-md)',
              height: 34,
              fontSize: 12.5,
              color: 'var(--ink-2)',
            }}
          >
            <span style={{ color: 'var(--muted)' }}>{Icons.Clock}</span>
            <span style={{ color: 'var(--muted)' }}>기간</span>
            <span className="num" style={{ fontWeight: 600, color: 'var(--ink)' }}>
              2026.04
            </span>
            <span style={{ color: 'var(--muted-2)' }}>{Icons.Caret}</span>
          </button>
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

      {/* Footer — terminal-ledger feel */}
      <div
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
          <span>FRD-2026-001 v1.0 · MVP 22/22</span>
          <span>Hyperledger Fabric 2.5 · Local Network</span>
          <span>KIE-REMS Lite · TheKIE Digital Platform</span>
        </div>
        <div className="mono" style={{ fontSize: 10.5 }}>
          build 1.0.4 · 2026-04-30 · M+3 demo-ready
        </div>
      </div>
    </>
  );
}
