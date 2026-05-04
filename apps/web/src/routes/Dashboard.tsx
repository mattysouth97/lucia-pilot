// FR-M-001 main dashboard.
// Dark-hero / nested-KPI-tiles / ledger-on-light pattern. The hero band
// collapses greeting + KPI bar into one breathing block, freeing the page
// surface below for a single generous activity zone (recent settlements +
// income chart). Operational cards (FR-S-004, FR-S-007, FR-M-006, etc.) live
// in a secondary "operations" zone below the fold.

import { useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Icons } from '@/components/Icons';
import { AnomalyCard } from '@/components/cards/AnomalyCard';
import { BlockchainCard } from '@/components/cards/BlockchainCard';
import { BuildingsCard } from '@/components/cards/BuildingsCard';
import { DistributionCard } from '@/components/cards/DistributionCard';
import { GenerationCard } from '@/components/cards/GenerationCard';
import { LoadTestCard } from '@/components/cards/LoadTestCard';
import { RE100Card } from '@/components/cards/RE100Card';
import { ResidentCard } from '@/components/cards/ResidentCard';
import { SankeyCard } from '@/components/cards/SankeyCard';
import { Sidebar } from '@/components/layout/Sidebar';
import { useLuciaModals } from '@/lib/modals';

export function Dashboard() {
  const { openReport } = useLuciaModals();

  return (
    <>
      <HeroBand onReport={openReport} />

      <BlockchainIntegrityStrip />

      <ActivityZone />

      {/* Operations zone — secondary, denser cards retain their per-FR design */}
      <div className="ops-zone-head">
        <div className="ops-zone-title">Operations · FRD-2026-001</div>
        <div className="ops-zone-meta">7개 카드 · 실시간 동기화</div>
      </div>

      <div className="grid-dashboard">
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <GenerationCard />
          <div id="sankey-card" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', minWidth: 0 }}>
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

        <div style={{ display: 'grid', gap: 16, alignContent: 'start', gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <Sidebar />
          <AnomalyCard />
          <ResidentCard />
        </div>
      </div>

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

/* ===================================================================== *
 * Hero band — dark surface with net-profit hero number                   *
 * ===================================================================== */

/** Public boundary of the hero band — kept as a named interface for callsite clarity. */
interface HeroBandProps {
  onReport: () => void;
}

function HeroBand({ onReport }: HeroBandProps) {
  return (
    <section className="hero-band">
      {/* Top strip — timestamp + live status on the left, single CTA on the right */}
      <div className="hero-band-top">
        <div className="hero-band-meta">
          <span className="num">2026.04.30 · 14:24 KST</span>
          <span className="sep">·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="live-dot" />
            <span>현재 발전</span>
            <span className="num" style={{ color: '#4D91E8' }}>112동</span>
            <span style={{ color: '#6B7180' }}>/ 116동</span>
          </span>
        </div>

        <div className="hero-band-actions">
          <button type="button" className="hero-band-cta" onClick={onReport}>
            <span style={{ display: 'inline-flex' }}>{Icons.Doc}</span>
            감사 보고서 생성
          </button>
        </div>
      </div>

      {/* Headline figure — uncontested hero number */}
      <HeadlineFigure />
    </section>
  );
}

function HeadlineFigure() {
  return (
    <div className="hero-headline-figure">
      <div className="hero-headline-label">이달 정산 매출 · 2026.04 누적</div>
      <div className="hero-headline-value">
        <span>₩32,356,400</span>
        <span className="hero-headline-value-delta">↑ 6.1%</span>
      </div>
      <div className="hero-headline-meta">
        <span>
          <span className="num">412,400</span>
          <span style={{ marginLeft: 3 }}>원/세대</span>
        </span>
        <span className="sep">·</span>
        <span>
          주거비 환원 <span className="num">41%</span>
        </span>
        <span className="sep">·</span>
        <span>
          <span className="num">2,839</span>
          <span style={{ marginLeft: 3 }}>세대 분배</span>
        </span>
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Blockchain integrity strip — thin band below hero, above activity zone *
 * ===================================================================== */

function BlockchainIntegrityStrip() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
        padding: '10px 10px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--bg)',
        fontSize: 12,
        color: 'var(--ink-2)',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
        <span className="live-dot" />
        <span style={{ color: 'var(--accent-ink, #1264D3)' }}>블록체인 검증 완료</span>
      </span>

      <span style={{ color: 'var(--muted)' }}>·</span>

      <span className="mono" style={{ fontSize: 10.5, whiteSpace: 'nowrap' }}>Block #847,231</span>

      <span style={{ color: 'var(--muted)' }}>·</span>

      <span style={{ whiteSpace: 'nowrap' }}>0 변조 시도</span>

      <span style={{ color: 'var(--muted)' }}>·</span>

      <span className="mono" style={{ fontSize: 10.5, whiteSpace: 'nowrap' }}>Hyperledger Fabric 2.5 · LevelDB</span>

      <a
        href="#blockchain-card"
        style={{ marginLeft: 'auto', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--ink-2)', textDecoration: 'none' }}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('blockchain-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      >
        세부 검증 →
      </a>
    </div>
  );
}

/* ===================================================================== *
 * Activity zone — recent-settlement ledger + this-month income chart     *
 * ===================================================================== */

const FILTER_CHIPS = ['전체 정산', '일일 정산', 'REC 발급', 'PPA 정산', '가상공유거래', '주거비 환원'] as const;
type FilterChip = (typeof FILTER_CHIPS)[number];

type LedgerStatus = 'good' | 'warn' | 'bad';

interface LedgerRow {
  id: string;
  buildingName: string;
  buildingId: string;
  service: string;
  amount: string;
  status: LedgerStatus;
  statusLabel: string;
  city: string;
  district?: string;
}

const LEDGER_ROWS: LedgerRow[] = [
  { id: 'TX-89A2F1B', buildingName: '울진 옥상-A',  buildingId: 'ULJN-001', service: '일일 정산',   amount: '₩148,920',   status: 'good', statusLabel: '완료',   city: '울진군' },
  { id: 'TX-7C8E219', buildingName: '울진 옥상-B',  buildingId: 'ULJN-002', service: '일일 정산',   amount: '₩142,380',   status: 'good', statusLabel: '완료',   city: '울진군' },
  { id: 'TX-6F1A308', buildingName: '의정부 양주-D', buildingId: 'UJBU-018', service: 'REC 발급',    amount: '₩98,400',    status: 'good', statusLabel: '완료',   city: '의정부시', district: '양주동' },
  { id: 'TX-4D9B0E3', buildingName: '화성 방교-G',  buildingId: 'HSNG-027', service: '가상공유거래', amount: '₩61,520',    status: 'warn', statusLabel: '검증중', city: '화성시',   district: '방교동' },
  { id: 'TX-3A82C77', buildingName: '광명 철산-K',  buildingId: 'GMNG-041', service: '일일 정산',   amount: '₩151,210',   status: 'good', statusLabel: '완료',   city: '광명시',   district: '철산동' },
  { id: 'TX-2E1980D', buildingName: '평택 안중-N',  buildingId: 'PYTK-056', service: '주거비 환원',  amount: '₩1,489,000', status: 'good', statusLabel: '완료',   city: '평택시',   district: '안중동' },
  { id: 'TX-1B70F94', buildingName: '의왕 부곡-P',  buildingId: 'UWAW-072', service: '일일 정산',   amount: '₩7,820',     status: 'bad',  statusLabel: '거부',   city: '의왕시',   district: '부곡동' },
  { id: 'TX-0C5832B', buildingName: '시흥 대야-S',  buildingId: 'SHNG-088', service: '일일 정산',   amount: '₩142,860',   status: 'good', statusLabel: '완료',   city: '시흥시',   district: '대야동' },
  { id: 'TX-PPA-A12', buildingName: '울진 옥상-A',  buildingId: 'ULJN-001', service: 'PPA 정산',    amount: '₩412,800',   status: 'good', statusLabel: '완료',   city: '울진군' },
  { id: 'TX-PPA-B07', buildingName: '광명 철산-K',  buildingId: 'GMNG-041', service: 'PPA 정산',    amount: '₩398,150',   status: 'good', statusLabel: '완료',   city: '광명시',   district: '철산동' },
];

const REGIONS = ['전체 지역', ...Array.from(new Set(LEDGER_ROWS.map((r) => r.city)))] as const;
type Region = (typeof REGIONS)[number];

function ActivityZone() {
  const [activeChip, setActiveChip] = useState<FilterChip>('전체 정산');
  const [activeRegion, setActiveRegion] = useState<Region>('전체 지역');

  const filtered = LEDGER_ROWS
    .filter((r) => activeChip === '전체 정산' || r.service === activeChip)
    .filter((r) => activeRegion === '전체 지역' || r.city === activeRegion);

  return (
    <div className="dash-activity">
      {/* Left — toolbar + table */}
      <div style={{ minWidth: 0 }}>
        <div className="ledger-toolbar">
          <div className="ledger-chip-group">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`ledger-chip ${activeChip === chip ? 'is-active' : ''}`}
                onClick={() => setActiveChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          <select
            value={activeRegion}
            onChange={(e) => setActiveRegion(e.target.value as Region)}
            style={{
              border: '1px solid var(--line)',
              height: 30,
              padding: '0 12px',
              borderRadius: 999,
              fontSize: 12,
              background: 'var(--panel)',
              color: 'var(--ink)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <label className="ledger-search">
            <span style={{ display: 'inline-flex', color: 'var(--muted-2)' }}>{Icons.Search}</span>
            <input type="text" placeholder="동·거래 ID 검색…" />
          </label>
        </div>

        <div className="ledger-section-head">
          <div className="ledger-section-title">최근 정산 거래</div>
          <a
            href="#distribution-card"
            className="ledger-section-link"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById('distribution-card')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            전체 보기 {Icons.Arrow}
          </a>
        </div>

        <div className="ledger-table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: 130 }}>거래 ID</th>
                <th>동</th>
                <th>정산 항목</th>
                <th className="t-right">금액</th>
                <th>상태</th>
                <th className="t-right" style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <LedgerTableRow key={row.id} row={row} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted-2)' }}>
                    조건에 해당하는 거래가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right — income chart + generation total stacked */}
      <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
        <IncomeChartCard />
        <GenerationTotalCard />
      </div>
    </div>
  );
}

function GenerationTotalCard() {
  return (
    <aside className="income-card">
      <div className="income-card-head">
        <div className="income-card-title">이달 총 발전량</div>
        <span
          className="num"
          style={{ fontSize: 11, color: 'var(--muted)' }}
        >
          2026.04 누적
        </span>
      </div>

      <div className="income-card-balance-label">현재까지 발전량</div>
      <div className="income-card-balance-value">
        356,840
        <span
          style={{
            fontSize: 14,
            color: 'var(--muted)',
            fontWeight: 500,
            marginLeft: 6,
            fontFamily: 'inherit',
            letterSpacing: 0,
          }}
        >
          kWh
        </span>
      </div>
      <div className="income-card-balance-meta">↑ 8.7% 전월 대비</div>

      <div className="income-card-foot" style={{ marginTop: 16 }}>
        <span>
          <span className="num">112</span>
          <span style={{ color: 'var(--muted-2)' }}> / 116동 · 정상</span>
        </span>
        <a
          href="#"
          className="ledger-row-action"
          onClick={(e) => e.preventDefault()}
        >
          발전 추이 {Icons.Arrow}
        </a>
      </div>
    </aside>
  );
}

function LedgerTableRow({ row }: { row: LedgerRow }) {
  const dotClass =
    row.status === 'good' ? '' : row.status === 'warn' ? ' is-warn' : ' is-bad';
  const pillClass =
    row.status === 'good' ? 'status-pill-good' : row.status === 'warn' ? 'status-pill-warn' : 'status-pill-bad';
  return (
    <tr>
      <td>
        <span className="ledger-id">{row.id}</span>
      </td>
      <td>
        <span className="ledger-bldg">
          <span className={`ledger-bldg-dot${dotClass}`} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 1, lineHeight: 1.2 }}>
            <span style={{ fontWeight: 500 }}>{row.buildingName}</span>
            <span className="ledger-bldg-id">{row.buildingId}</span>
          </span>
        </span>
      </td>
      <td>{row.service}</td>
      <td className="t-right num" style={{ fontWeight: 600, color: 'var(--ink)' }}>
        {row.amount}
      </td>
      <td>
        <span className={pillClass}>{row.statusLabel}</span>
      </td>
      <td className="t-right">
        <a href="#" className="ledger-row-action" onClick={(e) => e.preventDefault()}>
          원장 {Icons.Arrow}
        </a>
      </td>
    </tr>
  );
}

/* ===================================================================== *
 * Income chart card — small bar chart in the right rail                  *
 * ===================================================================== */

interface BarDatum {
  d: string;
  label: string;
  revenue: number;
  today?: boolean;
}

const WEEK_DATA: BarDatum[] = [
  { d: '월', label: '04.24', revenue: 11.42 },
  { d: '화', label: '04.25', revenue: 10.84 },
  { d: '수', label: '04.26', revenue: 12.60 },
  { d: '목', label: '04.27', revenue: 13.12 },
  { d: '금', label: '04.28', revenue: 14.88 },
  { d: '토', label: '04.29', revenue: 14.01 },
  { d: '일', label: '04.30', revenue: 14.89, today: true },
];

const MONTH_DATA: BarDatum[] = [
  { d: 'W1', label: '4월 1주', revenue: 71.4 },
  { d: 'W2', label: '4월 2주', revenue: 78.2 },
  { d: 'W3', label: '4월 3주', revenue: 84.6 },
  { d: 'W4', label: '4월 4주', revenue: 91.7, today: true },
];

type TogglePos = '주' | '월';

function IncomeChartCard() {
  const [toggle, setToggle] = useState<TogglePos>('주');
  const data = toggle === '주' ? WEEK_DATA : MONTH_DATA;

  return (
    <aside className="income-card">
      <div className="income-card-head">
        <div className="income-card-title">정산 매출</div>
        <div className="income-card-toggle">
          <button
            type="button"
            className={toggle === '주' ? 'is-on' : ''}
            onClick={() => setToggle('주')}
          >
            주
          </button>
          <button
            type="button"
            className={toggle === '월' ? 'is-on' : ''}
            onClick={() => setToggle('월')}
          >
            월
          </button>
        </div>
      </div>

      <div className="income-card-balance-label">잔액 · {toggle === '주' ? '이번 주' : '이번 달'}</div>
      <div className="income-card-balance-value">₩32,356,400</div>
      <div className="income-card-balance-meta">↑ 8.7% 전 {toggle === '주' ? '주' : '월'} 대비</div>

      <div className="income-card-chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="d"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              style={{ fontSize: 10.5, fill: '#8A93A0' }}
            />
            <YAxis
              hide
              domain={[0, (max: number) => max * 1.15]}
            />
            <Tooltip
              cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
              contentStyle={{
                borderRadius: 4,
                border: '1px solid #D5D9DF',
                fontSize: 11,
                boxShadow: 'none',
                padding: '6px 8px',
              }}
              formatter={(v: unknown) => [`${(v as number).toFixed(2)} M원`, '매출']}
              labelFormatter={(_, payload) => {
                const p = payload?.[0]?.payload as { label?: string } | undefined;
                return p?.label ?? '';
              }}
            />
            <Bar dataKey="revenue" radius={[3, 3, 0, 0]} maxBarSize={20}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.today ? '#1264D3' : '#0A0C0F'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="income-card-foot">
        <span>피크 · <span className="num">04.28</span></span>
        <span className="num">14.88 M원</span>
      </div>
    </aside>
  );
}
