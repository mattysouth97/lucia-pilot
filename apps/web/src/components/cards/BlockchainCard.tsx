// FR-M-008 / FR-S-008 — 블록체인 원장 라이브 card
// TPS counter auto-randomises every 1.5 s (range 140-160, matches prototype).
// Uses useLuciaStream hook (WebSocket stub, B7.3); falls back to hardcoded TX_STREAM.
// Tamper banner (FR-S-008) opens ULJN-042 building detail on click.

import { useState, useEffect } from 'react';

import { Icons } from '@/components/Icons';
import { Pill, Btn } from '@/components/atoms';
import { useLuciaModals } from '@/lib/modals';
import { useLuciaStream } from '@/lib/useLuciaStream';

// ── demo data (mirrors untitled/project/src/data.jsx TX_STREAM) ───────────────
type TxType   = 'settle' | 'rec' | 'tamper';
type TxStatus = 'confirmed' | 'rejected';

interface TxRow {
  ts:       string;
  id:       string;
  building: string;
  kwh:      number | null;
  type:     TxType;
  amount:   number | null;
  block:    number | null;
  status:   TxStatus;
}

const DEMO_TX_STREAM: TxRow[] = [
  { ts: '13:24:18', id: '0x7f3e…a92c', building: 'ULJN-001', kwh: 1.23, type: 'settle', amount: 146.4, block: 184729, status: 'confirmed' },
  { ts: '13:24:14', id: '0x9b21…f04d', building: 'ULJN-014', kwh: 1.18, type: 'rec',    amount:  99.1, block: 184728, status: 'confirmed' },
  { ts: '13:24:09', id: '0x2c8a…1e7b', building: 'ULJN-007', kwh: 1.34, type: 'settle', amount: 159.5, block: 184727, status: 'confirmed' },
  { ts: '13:24:03', id: '0x4d5f…b903', building: 'ULJN-031', kwh: 0.98, type: 'settle', amount: 116.6, block: 184726, status: 'confirmed' },
  { ts: '13:23:58', id: '0xe102…7c4a', building: 'ADMIN',    kwh: null, type: 'tamper', amount:  null, block:   null, status: 'rejected'  },
  { ts: '13:23:51', id: '0x8a44…d215', building: 'ULJN-023', kwh: 1.09, type: 'settle', amount: 129.7, block: 184725, status: 'confirmed' },
  { ts: '13:23:45', id: '0x1f9c…502e', building: 'ULJN-002', kwh: 1.21, type: 'rec',    amount: 101.6, block: 184724, status: 'confirmed' },
  { ts: '13:23:39', id: '0x5b7d…ab38', building: 'ULJN-104', kwh: 0.94, type: 'settle', amount: 111.9, block: 184723, status: 'confirmed' },
];

const TAMPER_BUILDING = {
  id: 'ULJN-042',
  region: '후포면 후포리',
  today: 38.2,
  capacity: 25.86,
  eff: 32.4,
  status: 'alert' as const,
  subsidy: 21,
};

// ── pill metadata ─────────────────────────────────────────────────────────────
type PillTone = 'green' | 'indigo' | 'rose';
const TYPE_META: Record<TxType, { label: string; tone: PillTone }> = {
  settle: { label: '정산',    tone: 'green'  },
  rec:    { label: 'REC',     tone: 'indigo' },
  tamper: { label: '변조시도', tone: 'rose'   },
};

// ── component ────────────────────────────────────────────────────────────────
export function BlockchainCard() {
  const { openBuilding } = useLuciaModals();

  // WebSocket hook — stub in P0; once B7.3 lands it pushes rows into query cache.
  useLuciaStream();

  const [tps, setTps] = useState(142);
  useEffect(() => {
    const t = setInterval(() => setTps(140 + Math.floor(Math.random() * 20)), 1500);
    return () => clearInterval(t);
  }, []);

  // Fall back to hardcoded rows until WebSocket stream is wired.
  const txs: TxRow[] = DEMO_TX_STREAM;

  return (
    <div className="card" style={{ padding: 24, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: 999, background: '#1264D3' }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#0D4AA0' }}>Hyperledger Fabric · LIVE</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>블록체인 원장 라이브</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>변조 불가 · 모든 정산 영구 기록</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {tps}
            <span style={{ fontSize: 11, color: '#9AA0AB', fontWeight: 500, marginLeft: 4 }}>TPS</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: '#9AA0AB' }}>blk #184,729</div>
        </div>
      </div>

      {/* tx list */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {txs.map((tx, i) => {
          const meta     = TYPE_META[tx.type];
          const rejected = tx.status === 'rejected';

          return (
            <div
              key={tx.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px auto 1fr auto auto',
                alignItems: 'center',
                gap: 10,
                padding: '10px 0',
                borderBottom: i < txs.length - 1 ? '1px solid #F4F5F7' : 'none',
              }}
              className={i === 0 ? 'flow-in' : undefined}
            >
              <span className="mono" style={{ fontSize: 10.5, color: '#9AA0AB' }}>{tx.ts}</span>

              <Pill tone={meta.tone} dot={!rejected}>
                {rejected ? `X ${meta.label}` : meta.label}
              </Pill>

              <div style={{ minWidth: 0 }}>
                <div className="mono" style={{
                  fontSize: 11,
                  color: rejected ? '#BE123C' : '#0E1116',
                  fontWeight: 600,
                }}>
                  {tx.id}
                </div>
                <div style={{ fontSize: 10.5, color: '#9AA0AB', marginTop: 1 }}>
                  {rejected
                    ? '어드민 변경 시도 · 해시 불일치 · 자동 거부'
                    : `${tx.building} · ${tx.kwh} kWh · block ${tx.block}`}
                </div>
              </div>

              <span className="num" style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: rejected ? '#BE123C' : '#0E1116',
                textAlign: 'right',
              }}>
                {rejected ? 'REJECTED' : `${tx.amount?.toFixed(1)}원`}
              </span>

              <span style={{ color: rejected ? '#BE123C' : '#1264D3', display: 'grid', placeItems: 'center' }}>
                {rejected ? Icons.Cross : Icons.Check}
              </span>
            </div>
          );
        })}
      </div>

      {/* FR-S-008 tamper alert banner */}
      <div
        onClick={() => openBuilding(TAMPER_BUILDING)}
        style={{
          marginTop: 12,
          padding: '10px 14px',
          background: '#FFF1F3',
          border: '1px solid #FFD9DF',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: '#FECDD3',
          color: '#BE123C',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}>
          {Icons.Lock}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#BE123C' }}>
            FR-S-008 · 변조 시도 1건 자동 거부
          </div>
          <div style={{ fontSize: 11, color: '#9F1239', marginTop: 1 }}>
            13:23:58 · admin@lucia · IP 10.0.4.21 · settlement_id 0x7c4a 변경 시도 → hash mismatch
          </div>
        </div>
        <Btn variant="secondary" size="sm">감사 로그</Btn>
      </div>
    </div>
  );
}
