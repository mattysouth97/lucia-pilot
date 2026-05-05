// 원장 — settlement ledger page.
// Surfaces the Sankey energy-flow diagram (FR-M-006), the 28-item distribution
// breakdown (FR-S-004), and the live blockchain audit trail. Role-gated to
// analyst + operator at the route.

import { BlockchainCard } from '@/components/cards/BlockchainCard';
import { DistributionCard } from '@/components/cards/DistributionCard';
import { SankeyCard } from '@/components/cards/SankeyCard';

export function LedgerPage() {
  return (
    <>
      <header style={{ marginBottom: 22 }}>
        <div className="overline" style={{ marginBottom: 6 }}>LEDGER · FRD-2026-001</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>
          정산 원장
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 0' }}>
          발전수익 분배 흐름 · 28-item 정산 분해 · 블록체인 영구 기록
        </p>
      </header>

      <div
        id="sankey-card"
        style={{
          marginBottom: 16,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          minWidth: 0,
        }}
      >
        <SankeyCard />
      </div>

      <div className="grid-card-pair" id="distribution-blockchain-row">
        <div id="distribution-card">
          <DistributionCard />
        </div>
        <div id="blockchain-card" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <BlockchainCard />
        </div>
      </div>
    </>
  );
}
