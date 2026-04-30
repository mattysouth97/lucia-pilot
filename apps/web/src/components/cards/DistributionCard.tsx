// DistributionCard — 1 kWh 발전 → 9개 화폐 흐름
// FR-S-004 가상공유거래 3-way split + 28-item settlement breakdown

import { Icons } from '@/components/Icons';
import { Pill, Btn, fmt } from '@/components/atoms';

interface SettlementItem {
  label: string;
  value: number;
  type: 'income' | 'out';
  code: string;
}

interface DistributionGroup {
  id: string;
  label: string;
  households: number;
  ratio: number;
  perHH: number;
  color: string;
}

export interface DistributionCardData {
  items?: SettlementItem[];
  groups?: DistributionGroup[];
}

interface DistributionCardProps {
  data?: DistributionCardData;
}

const DEFAULT_ITEMS: SettlementItem[] = [
  { label: 'SMP 매출',              value:  119,    type: 'income', code: 'S-002' },
  { label: 'REC 발급 (×1.2)',        value:  100.8,  type: 'income', code: 'S-003' },
  { label: 'PPA 프리미엄',           value:   20,    type: 'income', code: 'S-010' },
  { label: 'K-ETS 적립',             value:    8.2,  type: 'income', code: 'S-011' },
  { label: '주거비 환원 (LH)',        value:  -64.2,  type: 'out',    code: 'S-004' },
  { label: '주거비 환원 (국민임대)',  value:  -10.9,  type: 'out',    code: 'S-004' },
  { label: '주거비 환원 (소외)',      value:  -35.8,  type: 'out',    code: 'S-004' },
  { label: 'Lucia SaaS 수수료',      value:   -1.65, type: 'out',    code: 'S-005' },
  { label: '거래수수료',             value:   -2.1,  type: 'out',    code: 'S-006' },
];

const DEFAULT_GROUPS: DistributionGroup[] = [
  { id: 'lh',      label: 'LH 매입임대',    households: 1643, ratio: 0.642, perHH: 6420,  color: '#10B981' },
  { id: 'kookmin', label: '국민임대',        households: 280,  ratio: 0.109, perHH: 7420,  color: '#34D399' },
  { id: 'energy',  label: '에너지소외계층', households: 916,  ratio: 0.358, perHH: 18195, color: '#06B6A2' },
];

export function DistributionCard({ data }: DistributionCardProps) {
  const items  = data?.items  ?? DEFAULT_ITEMS;
  const groups = data?.groups ?? DEFAULT_GROUPS;

  const totalIn  = items.filter(x => x.type === 'income').reduce((s, x) => s + x.value, 0);
  const totalOut = -items.filter(x => x.type === 'out').reduce((s, x) => s + x.value, 0);

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Pill tone="indigo">FR-S-004</Pill>
            <Pill tone="neutral" dot>가상공유거래 ★</Pill>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>
            1 kWh 발전 → 9개 화폐 흐름
          </div>
          <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 3 }}>
            ULJN-001 · 1.20 kWh · 2026-04-30 13:24:18 · Block #184729
          </div>
        </div>
        <Btn variant="secondary" size="sm" icon={Icons.Share}>전체 28개</Btn>
      </div>

      {/* Revenue strip */}
      <div style={{
        background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
        border: '1px solid #D1FAE5',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11.5, color: '#047857', fontWeight: 600, marginBottom: 4 }}>총 발전수익</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em' }}>
            248.0<span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500, marginLeft: 4 }}>원</span>
          </div>
        </div>
        <div style={{ color: '#059669', fontSize: 22, fontWeight: 300 }}>→</div>
        <div>
          <div style={{ fontSize: 11.5, color: '#BE123C', fontWeight: 600, marginBottom: 4 }}>분배·수수료</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em' }}>
            -114.7<span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500, marginLeft: 4 }}>원</span>
          </div>
        </div>
        <div style={{ color: '#059669', fontSize: 22, fontWeight: 300 }}>=</div>
        <div>
          <div style={{ fontSize: 11.5, color: '#0E1116', fontWeight: 600, marginBottom: 4 }}>SPC 순적립</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em' }}>
            133.3<span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500, marginLeft: 4 }}>원</span>
          </div>
        </div>
      </div>

      {/* Breakdown rows — horizontal scroll on narrow widths so the
          fixed-px columns don't overflow the card. */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ display: 'grid', gap: 8, minWidth: 380 }}>
        {items.map((it, i) => {
          const pct = Math.abs(it.value) / Math.max(totalIn, totalOut) * 100;
          const pos = it.type === 'income';
          return (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr 110px 90px',
                alignItems: 'center', gap: 12,
                padding: '8px 0',
              }}
            >
              <span className="mono" style={{ fontSize: 10.5, color: '#9AA0AB', width: 38 }}>
                {it.code}
              </span>
              <span style={{ fontSize: 13, color: '#0E1116', fontWeight: 500, letterSpacing: '-0.01em' }}>
                {it.label}
              </span>
              <div style={{ height: 6, borderRadius: 999, background: '#F4F5F7', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: pos
                    ? 'linear-gradient(90deg, #34D399, #10B981)'
                    : 'linear-gradient(90deg, #FDA4AF, #F43F5E)',
                  borderRadius: 999,
                }} />
              </div>
              <span className="num" style={{
                fontSize: 13.5, fontWeight: 700, textAlign: 'right',
                color: pos ? '#047857' : '#BE123C',
              }}>
                {pos ? '+' : ''}{it.value.toFixed(2)}원
              </span>
            </div>
          );
        })}
      </div>
      </div>

      {/* Beneficiary breakdown */}
      <div style={{ marginTop: 18, padding: '16px 0 0 0', borderTop: '1px dashed var(--line-2)' }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>
          주거비 환원 41% — 2,839세대 분배
        </div>
        <div className="grid-three">
          {groups.map(g => (
            <div
              key={g.id}
              style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 12 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: g.color, display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{g.label}</span>
              </div>
              <div className="num" style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {fmt.n(g.households)}
                <span style={{ fontSize: 11, color: '#9AA0AB', fontWeight: 500, marginLeft: 3 }}>세대</span>
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                월{' '}
                <span className="num" style={{ color: '#0E1116', fontWeight: 600 }}>
                  {fmt.n(g.perHH)}원
                </span>
                /세대
              </div>
              <div style={{ marginTop: 8, height: 4, background: '#F4F5F7', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${g.ratio * 100}%`,
                  background: g.color,
                  borderRadius: 999,
                }} />
              </div>
              <div className="num" style={{ fontSize: 10.5, color: '#9AA0AB', marginTop: 4 }}>
                {(g.ratio * 100).toFixed(1)}% 비율
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
