// NOTE(wk2): demo prop shape is BuildingLike (prototype demo data), not the FRD-spec Building.
// Phase 2 will replace this with @lucia/contracts Building once real engine endpoints land
// and the dashboard rows derive from generation_events + buildings join (FR-M-002 backend wiring).
import { Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Modal } from './Modal.js';

import { Pill, Btn, fmt } from '@/components/atoms';
import type { BuildingLike } from '@/lib/modals';

interface BuildingDetailModalProps {
  building: BuildingLike;
  onClose: () => void;
}

// Inline SVG icons (subset needed here)
const CrossIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 6 12 12M6 18 18 6" />
  </svg>
);

const DocIcon = (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6" />
  </svg>
);

const STATUS_COLOR: Record<string, string> = {
  ok: '#1264D3',
  warn: '#F59E0B',
  alert: '#F43F5E',
  maintenance: '#9AA0AB',
};

const STATUS_LABEL: Record<string, string> = {
  ok: '정상 가동',
  warn: '주의 — 효율 저하',
  alert: '긴급 — 인버터 오류',
  maintenance: '점검 중',
};

const STATUS_TONE: Record<string, 'green' | 'amber' | 'rose' | 'neutral'> = {
  ok: 'green',
  warn: 'amber',
  alert: 'rose',
  maintenance: 'neutral',
};

// 24-hour generation curve — rises from sunrise (06h), peaks ~12–13h, fades by sunset.
const HOURLY_GENERATION: { hour: number; kwh: number }[] = [
  { hour: 6,  kwh: 0.4 },
  { hour: 7,  kwh: 1.8 },
  { hour: 8,  kwh: 4.5 },
  { hour: 9,  kwh: 8.2 },
  { hour: 10, kwh: 12.1 },
  { hour: 11, kwh: 14.6 },
  { hour: 12, kwh: 15.8 },
  { hour: 13, kwh: 15.5 },
  { hour: 14, kwh: 14.2 },
  { hour: 15, kwh: 12.8 },
  { hour: 16, kwh: 9.4 },
  { hour: 17, kwh: 5.7 },
  { hour: 18, kwh: 2.1 },
  { hour: 19, kwh: 0.5 },
];

// 30-day trend — deterministic, drifts around 138 kWh/day with mild day-of-month variance.
const MONTHLY_TREND: { day: number; kwh: number }[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  // Slight upward drift + sinusoidal weekly wobble
  const base = 130 + i * 0.4;
  const wobble = Math.sin(i * 0.9) * 8;
  return { day, kwh: Math.round((base + wobble) * 10) / 10 };
});

const RECENT_SETTLEMENTS = [
  { ts: '13:24:18', kwh: 1.23, smp: 119, won: 146.4 },
  { ts: '13:23:18', kwh: 1.18, smp: 119, won: 140.4 },
  { ts: '13:22:18', kwh: 1.21, smp: 118, won: 142.8 },
  { ts: '13:21:18', kwh: 1.15, smp: 118, won: 135.7 },
  { ts: '13:20:18', kwh: 1.09, smp: 117, won: 127.5 },
  { ts: '13:19:18', kwh: 1.14, smp: 117, won: 133.4 },
  { ts: '13:18:18', kwh: 1.20, smp: 116, won: 139.2 },
  { ts: '13:17:18', kwh: 1.08, smp: 116, won: 125.3 },
  { ts: '13:16:18', kwh: 1.17, smp: 115, won: 134.6 },
  { ts: '13:15:18', kwh: 1.11, smp: 115, won: 127.7 },
];

const HOUSEHOLD_BREAKDOWN = [
  { label: 'LH 매입임대', count: 1643, perHousehold: 6420, tone: 'indigo' as const },
  { label: '국민임대',     count: 280,  perHousehold: 7420, tone: 'sky' as const },
  { label: '에너지소외',   count: 916,  perHousehold: 18195, tone: 'amber' as const },
];

export function BuildingDetailModal({ building, onClose }: BuildingDetailModalProps) {
  const b = building;
  const sevColor = STATUS_COLOR[b.status] ?? '#9AA0AB';
  const statusLabel = STATUS_LABEL[b.status] ?? b.status;
  const statusTone = STATUS_TONE[b.status] ?? 'neutral';

  // Coalesce prototype-extended demo fields from the trimmed BuildingLike shape
  // when not provided. See lib/modals.tsx — these become required once FR-M-002
  // backend wiring lands.
  const buildingId   = b.building_id ?? b.id;
  const city         = b.city ?? b.region ?? '';
  const district     = b.district ?? '';
  const installedKw  = b.installed_kw ?? b.capacity;
  const inverterCnt  = b.inverter_count ?? Math.max(1, Math.round(installedKw / 12));
  const lat          = b.lat ?? 0;
  const lng          = b.lng ?? 0;

  const inverterRows = [
    { lbl: '효율',       val: '94.8%',      color: sevColor },
    { lbl: '온도',       val: b.status === 'alert' ? '84.2°C' : '42.1°C', color: b.status === 'alert' ? '#F43F5E' : '#0E1116' },
    { lbl: 'DC 전압',   val: '612 V',       color: '#0E1116' },
    { lbl: 'AC 전류',   val: '38.4 A',      color: '#0E1116' },
    { lbl: '마지막 점검', val: '2026-03-12', color: '#6B7280' },
  ];

  return (
    <Modal open={true} onClose={onClose} width={1080}>
      {/* Header */}
      <div style={{
        padding: '22px 28px 18px',
        borderBottom: '1px solid #E2E5EA',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Pill tone={statusTone} dot>{statusLabel}</Pill>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#9AA0AB' }}>
              FR-M-002 · /buildings/{buildingId}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em' }}>{buildingId}</span>
            <span style={{ fontSize: 14, color: '#6B7280' }}>{city} {district}</span>
          </div>
          <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 4 }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{installedKw} kW</span>
            {' '}설치 · 옥상 태양광 ·{' '}
            <span style={{ marginLeft: 6, fontVariantNumeric: 'tabular-nums' }}>
              {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="sm" icon={DocIcon}>이력 PDF</Btn>
          <Btn variant="ghost" size="sm" onClick={onClose} icon={CrossIcon} />
        </div>
      </div>

      {/* Body — scrollable */}
      <div style={{ overflow: 'auto', padding: 24, background: '#FAFBFC' }}>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
          {[
            {
              lbl: '오늘 발전량',
              val: fmt.kwh(installedKw * 4.2),
              unit: 'kWh',
              color: sevColor,
              delta: b.status === 'alert' ? '▼ 67.6%' : '▲ 4.2%',
              deltaC: b.status === 'alert' ? '#BE123C' : '#0D4AA0',
            },
            { lbl: '현재 효율', val: b.status === 'alert' ? '28.4' : '94.8', unit: '%', color: sevColor },
            { lbl: '환원 세대', val: fmt.n(inverterCnt * 24), unit: '세대', color: '#1264D3' },
            { lbl: '누적 매출 (4월)', val: '16,432', unit: '천원', color: '#0E1116' },
          ].map((k, i) => (
            <div key={i} style={{
              background: '#fff', border: '1px solid #E2E5EA', borderRadius: 14,
              padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 500, marginBottom: 6 }}>{k.lbl}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: k.color, fontVariantNumeric: 'tabular-nums' }}>
                  {k.val}
                </span>
                <span style={{ fontSize: 11, color: '#9AA0AB', fontWeight: 500 }}>{k.unit}</span>
              </div>
              {'delta' in k && k.delta && (
                <div style={{ fontSize: 11, fontWeight: 600, color: k.deltaC, marginTop: 4 }}>{k.delta}</div>
              )}
            </div>
          ))}
        </div>

        {/* Charts row — 24-hour generation curve + 30-day daily trend */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
          {/* 24-hour area chart */}
          <div style={{ background: '#fff', border: '1px solid #E2E5EA', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>24시간 발전량</div>
              <span className="num" style={{ fontSize: 11, color: '#9AA0AB' }}>2026-04-30</span>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_GENERATION} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bd-hourly-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => String(v).padStart(2, '0')}
                    tick={{ fontSize: 10.5, fill: '#9AA0AB' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    tick={{ fontSize: 10.5, fill: '#9AA0AB' }}
                    domain={[0, 16]}
                    ticks={[0, 4, 8, 12, 16]}
                  />
                  <Tooltip
                    cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '3 3' }}
                    contentStyle={{
                      borderRadius: 6,
                      border: '1px solid #D5D9DF',
                      fontSize: 11.5,
                      boxShadow: 'none',
                      padding: '6px 10px',
                      fontFamily: 'Geist Mono, monospace',
                    }}
                    formatter={(v: unknown) => [`${(v as number).toFixed(1)} kWh`, '발전량']}
                    labelFormatter={(h: unknown) => `${String(h).padStart(2, '0')}시`}
                  />
                  <Area
                    type="monotone"
                    dataKey="kwh"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fill="url(#bd-hourly-fill)"
                    dot={false}
                    activeDot={{ r: 3, fill: 'var(--accent)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 30-day bar chart */}
          <div style={{ background: '#fff', border: '1px solid #E2E5EA', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>30일 추이</div>
              <span style={{
                fontSize: 11, color: '#0E1116', fontWeight: 600,
                background: '#F4F5F7', padding: '3px 10px', borderRadius: 999,
              }}>
                일별
              </span>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_TREND} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    interval={1}
                    tick={{ fontSize: 10, fill: '#9AA0AB' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    tick={{ fontSize: 10.5, fill: '#9AA0AB' }}
                    domain={[0, 160]}
                    ticks={[0, 40, 80, 120, 160]}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(16,185,129,0.06)' }}
                    contentStyle={{
                      borderRadius: 6,
                      border: '1px solid #D5D9DF',
                      fontSize: 11.5,
                      boxShadow: 'none',
                      padding: '6px 10px',
                      fontFamily: 'Geist Mono, monospace',
                    }}
                    formatter={(v: unknown) => [`${(v as number).toFixed(1)} kWh`, '발전량']}
                    labelFormatter={(d: unknown) => `4월 ${d}일`}
                  />
                  <Bar dataKey="kwh" radius={[3, 3, 0, 0]} maxBarSize={14}>
                    {MONTHLY_TREND.map((d) => (
                      <Cell key={d.day} fill="var(--accent)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Two-column: inverter + recent settlements */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12, marginBottom: 18 }}>
          {/* Inverter status */}
          <div style={{ background: '#fff', border: '1px solid #E2E5EA', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>인버터 상태</div>
            {inverterRows.map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i < inverterRows.length - 1 ? '1px solid #F4F5F7' : 'none',
                fontSize: 12.5,
              }}>
                <span style={{ color: '#6B7280' }}>{row.lbl}</span>
                <span style={{ fontWeight: 700, color: row.color, fontVariantNumeric: 'tabular-nums' }}>{row.val}</span>
              </div>
            ))}
          </div>

          {/* Recent settlements */}
          <div style={{ background: '#fff', border: '1px solid #E2E5EA', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>최근 정산 이력</div>
              <span style={{ fontSize: 11, color: '#9AA0AB' }}>최근 10건 / 14,247건</span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr 60px 80px 60px',
              padding: '0 0 8px',
              fontSize: 10.5, color: '#9AA0AB', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.04em',
              borderBottom: '1px solid #E2E5EA',
            }}>
              <span>시각</span>
              <span>kWh</span>
              <span style={{ textAlign: 'right' }}>SMP</span>
              <span style={{ textAlign: 'right' }}>매출</span>
              <span style={{ textAlign: 'right' }}>상태</span>
            </div>
            {RECENT_SETTLEMENTS.map((r, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr 60px 80px 60px',
                padding: '8px 0',
                borderBottom: i < RECENT_SETTLEMENTS.length - 1 ? '1px solid #F4F5F7' : 'none',
                fontSize: 12, alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'monospace', color: '#9AA0AB', marginRight: 14 }}>{r.ts}</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.kwh.toFixed(2)} kWh</span>
                <span style={{ textAlign: 'right', color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>{r.smp}원</span>
                <span style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{r.won.toFixed(1)}원</span>
                <span style={{ textAlign: 'right' }}><Pill tone="green" dot>확정</Pill></span>
              </div>
            ))}
          </div>
        </div>

        {/* Household breakdown */}
        <div style={{ background: '#fff', border: '1px solid #E2E5EA', borderRadius: 14, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>세대별 환원 내역 (41% 유보금)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {HOUSEHOLD_BREAKDOWN.map((hh) => (
              <div key={hh.label} style={{
                background: '#FAFBFC', border: '1px solid #F1F3F5', borderRadius: 10,
                padding: '14px 16px',
              }}>
                <div style={{ marginBottom: 8 }}>
                  <Pill tone={hh.tone}>{hh.label}</Pill>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {fmt.n(hh.count)}
                  </span>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>세대</span>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  세대당{' '}
                  <span style={{ fontWeight: 700, color: '#0E1116', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt.won(hh.perHousehold)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
