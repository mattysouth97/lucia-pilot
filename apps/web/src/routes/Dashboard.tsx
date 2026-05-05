// FR-M-001 main dashboard.
// Dark-hero / nested-KPI-tiles / ledger-on-light pattern. The hero band
// collapses greeting + KPI bar into one breathing block, freeing the page
// surface below for a single generous activity zone (recent settlements +
// income chart). Operational cards (FR-S-004, FR-S-007, FR-M-006, etc.) live
// in a secondary "operations" zone below the fold.

import { useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Icons } from '@/components/Icons';
import { useLuciaModals } from '@/lib/modals';
import { ActivityZone } from '@/routes/Home/ActivityZone';

export function Dashboard() {
  const { openReport } = useLuciaModals();

  return (
    <>
      <HeroBand onReport={openReport} />

      <ActivityZone
        initialFilters={['전체 정산']}
        rightRail={
          <>
            <IncomeChartCard />
            <GenerationTotalCard />
          </>
        }
      />

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
        <div className="mono" style={{ fontSize: 10.5 }}>build 1.0.4 · 2026-04-30</div>
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
