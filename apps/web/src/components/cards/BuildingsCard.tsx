// FR-M-001 / FR-D-001 — 동별 발전 랭킹 card
// Hardcoded demo rows from prototype BUILDINGS array.
// Accept optional `buildings` prop for future engine integration via TanStack Query.

import { useState } from 'react';

import { Icons } from '@/components/Icons';
import { Pill, SectionTitle, fmt } from '@/components/atoms';
import { useLuciaModals } from '@/lib/modals';
import type { BuildingLike } from '@/lib/modals';

// ── demo data (mirrors untitled/project/src/data.jsx BUILDINGS) ──────────────
const DEMO_BUILDINGS: BuildingLike[] = [
  { id: 'ULJN-001', region: '울진읍 읍남리',   today: 142.6, capacity: 25.86, eff: 98.2, status: 'ok',    subsidy: 1643 },
  { id: 'ULJN-002', region: '울진읍 읍남리',   today: 138.1, capacity: 25.86, eff: 96.8, status: 'ok',    subsidy: 14   },
  { id: 'ULJN-007', region: '근남면 행곡리',   today: 136.4, capacity: 25.86, eff: 95.9, status: 'ok',    subsidy: 22   },
  { id: 'ULJN-014', region: '근남면 산포리',   today: 132.9, capacity: 25.86, eff: 94.1, status: 'ok',    subsidy: 19   },
  { id: 'ULJN-023', region: '기성면 정명리',   today: 128.7, capacity: 25.86, eff: 92.3, status: 'ok',    subsidy: 17   },
  { id: 'ULJN-031', region: '온정면 외선미리', today: 124.0, capacity: 25.86, eff: 90.7, status: 'ok',    subsidy: 15   },
  { id: 'ULJN-042', region: '후포면 후포리',   today:  38.2, capacity: 25.86, eff: 32.4, status: 'alert', subsidy: 21   },
  { id: 'ULJN-058', region: '북면 부구리',     today:  92.1, capacity: 25.86, eff: 78.6, status: 'warn',  subsidy: 18   },
  { id: 'ULJN-073', region: '평해읍 평해리',   today: 121.3, capacity: 25.86, eff: 89.4, status: 'ok',    subsidy: 16   },
  { id: 'ULJN-089', region: '죽변면 죽변리',   today: 116.8, capacity: 25.86, eff: 87.2, status: 'ok',    subsidy: 13   },
  { id: 'ULJN-104', region: '원남면 매화리',   today: 110.5, capacity: 25.86, eff: 84.0, status: 'ok',    subsidy: 12   },
  { id: 'ULJN-116', region: '서면 광회리',     today: 108.2, capacity: 25.86, eff: 82.1, status: 'ok',    subsidy: 11   },
];

// ── types ────────────────────────────────────────────────────────────────────
type FilterLabel = '전체' | '정상' | '주의' | '이상';
type StatusKey   = 'ok' | 'warn' | 'alert';

const STATUS_TONE: Record<StatusKey, 'green' | 'amber' | 'rose'> = {
  ok:    'green',
  warn:  'amber',
  alert: 'rose',
};
const STATUS_LABEL: Record<StatusKey, string> = {
  ok:    '정상',
  warn:  '주의',
  alert: '이상',
};
const FILTER_MAP: Record<FilterLabel, StatusKey | null> = {
  전체: null,
  정상: 'ok',
  주의: 'warn',
  이상: 'alert',
};
const FILTERS: FilterLabel[] = ['전체', '정상', '주의', '이상'];

// ── component ────────────────────────────────────────────────────────────────
interface BuildingsCardProps {
  buildings?: BuildingLike[];
}

export function BuildingsCard({ buildings }: BuildingsCardProps) {
  const rows = buildings ?? DEMO_BUILDINGS;
  const { openBuilding } = useLuciaModals();
  const [filter, setFilter] = useState<FilterLabel>('전체');

  const statusKey = FILTER_MAP[filter];
  const filtered  = statusKey ? rows.filter(b => b.status === statusKey) : rows;
  const maxToday  = Math.max(...rows.map(b => b.today));

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 0 }}>
        <SectionTitle
          title="동별 발전 랭킹"
          subtitle="116동 중 상위/하위 12동 · 실시간 효율 기반"
        />
        {/* filter pills */}
        <div style={{ display: 'flex', gap: 6, background: '#F4F5F7', padding: 4, borderRadius: 999 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: filter === f ? '#fff' : 'transparent',
                color: filter === f ? '#0E1116' : '#6B7280',
                boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* scrollable table wrapper */}
      <div className="card-scroll-x">

      {/* column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '100px 1fr 80px 90px 80px 80px 28px',
        padding: '0 4px 8px',
        fontSize: 11,
        fontWeight: 600,
        color: '#9AA0AB',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        borderBottom: '1px solid var(--line)',
      }}>
        <span>동 ID</span>
        <span>지역 · 발전량</span>
        <span style={{ textAlign: 'right' }}>오늘 kWh</span>
        <span style={{ textAlign: 'right' }}>효율</span>
        <span style={{ textAlign: 'right' }}>세대</span>
        <span style={{ textAlign: 'right' }}>상태</span>
        <span />
      </div>

      {/* rows */}
      <div>
        {filtered.map((b, i) => {
          const barColor =
            b.status === 'alert'
              ? '#F43F5E'
              : b.status === 'warn'
              ? '#F59E0B'
              : 'linear-gradient(90deg, #4D91E8, #1264D3)';

          const effColor =
            b.eff < 50 ? '#BE123C' : b.eff < 85 ? '#B45309' : '#0D4AA0';

          return (
            <div
              key={b.id}
              onClick={() => openBuilding(b)}
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 80px 90px 80px 80px 28px',
                alignItems: 'center',
                padding: '12px 4px',
                borderBottom: i < filtered.length - 1 ? '1px solid #F4F5F7' : 'none',
                transition: 'background .12s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FAFBFC'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: '#0E1116' }}>
                {b.id}
              </span>

              <div>
                <div style={{ fontSize: 12.5, color: '#0E1116', marginBottom: 4, fontWeight: 500 }}>
                  {b.region}
                </div>
                <div style={{ height: 4, background: '#F4F5F7', borderRadius: 999, overflow: 'hidden', maxWidth: 280 }}>
                  <div style={{
                    height: '100%',
                    width: `${(b.today / maxToday) * 100}%`,
                    background: barColor,
                    borderRadius: 999,
                  }} />
                </div>
              </div>

              <span className="num" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
                {fmt.kwh(b.today)}
              </span>

              <span className="num" style={{ fontSize: 12.5, textAlign: 'right', color: effColor, fontWeight: 600 }}>
                {b.eff.toFixed(1)}%
              </span>

              <span className="num" style={{ fontSize: 12.5, textAlign: 'right', color: '#6B7280' }}>
                {b.subsidy}
              </span>

              <span style={{ textAlign: 'right' }}>
                <Pill tone={(b.status === 'maintenance' ? 'neutral' : STATUS_TONE[b.status])} dot>
                  {b.status === 'maintenance' ? '점검' : STATUS_LABEL[b.status]}
                </Pill>
              </span>

              <span style={{ color: '#9AA0AB', display: 'grid', placeItems: 'end' }}>
                {Icons.Caret}
              </span>
            </div>
          );
        })}
      </div>

      </div>{/* end card-scroll-x */}

      {/* footer */}
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid var(--line)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 12,
        color: '#6B7280',
      }}>
        <span>전체 116동 보기 →</span>
        <span className="num">총 12동 표시 · 평균 효율 84.3%</span>
      </div>
    </div>
  );
}
