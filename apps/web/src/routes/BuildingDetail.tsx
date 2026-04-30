// FR-M-002 — building detail page (Demo Step 2 satisfier).
//
// Per-building view: hourly/weekly/monthly chart, inverter status, recent settlements,
// household breakdown. P0 wires the layout + mock data; live engine queries (B9.x) replace
// the inline arrays once endpoints exist.

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Pill, Btn, fmt } from '@/components/atoms';
import { Icons } from '@/components/Icons';

const RANGES = ['시간', '주', '월'] as const;
type Range = (typeof RANGES)[number];

interface ChartPoint {
  t: string;
  gen: number;
  avg: number;
}

const CHART_DATA: Record<Range, ChartPoint[]> = {
  시간: [
    { t: '06', gen: 18, avg: 16 },
    { t: '07', gen: 142, avg: 128 },
    { t: '08', gen: 410, avg: 382 },
    { t: '09', gen: 760, avg: 720 },
    { t: '10', gen: 1180, avg: 1090 },
    { t: '11', gen: 1520, avg: 1440 },
    { t: '12', gen: 1680, avg: 1610 },
    { t: '13', gen: 1620, avg: 1580 },
    { t: '14', gen: 1480, avg: 1490 },
    { t: '15', gen: 1240, avg: 1280 },
    { t: '16', gen: 920, avg: 980 },
    { t: '17', gen: 540, avg: 610 },
    { t: '18', gen: 210, avg: 260 },
  ],
  주: Array.from({ length: 7 }, (_, i) => ({
    t: ['월', '화', '수', '목', '금', '토', '일'][i] ?? '',
    gen: 9800 + Math.floor(Math.sin(i) * 1200) + i * 200,
    avg: 9400 + i * 180,
  })),
  월: Array.from({ length: 30 }, (_, i) => ({
    t: String(i + 1),
    gen: 9800 + Math.floor(Math.sin(i / 2) * 1500) + (i % 6) * 220,
    avg: 9500 + (i % 5) * 200,
  })),
};

interface Inverter {
  id: string;
  status: 'ok' | 'warn' | 'alert';
  eff: number;
  temp: number;
  output: number;
}

const INVERTERS: Inverter[] = [
  { id: 'INV-01', status: 'ok', eff: 97.4, temp: 38.2, output: 412 },
  { id: 'INV-02', status: 'ok', eff: 96.8, temp: 39.1, output: 408 },
  { id: 'INV-03', status: 'warn', eff: 92.1, temp: 46.4, output: 376 },
  { id: 'INV-04', status: 'ok', eff: 97.0, temp: 37.6, output: 410 },
];

interface SettlementRow {
  date: string;
  txId: string;
  kwh: number;
  gross: number;
  reservation: number;
  spc: number;
}

const SETTLEMENTS: SettlementRow[] = Array.from({ length: 12 }, (_, i) => ({
  date: `2026-04-${String(30 - i).padStart(2, '0')}`,
  txId: `0x${(0x8a44d215abc + i).toString(16).slice(0, 8)}…${(0xd215 - i).toString(16)}`,
  kwh: 11820 - i * 184,
  gross: 1490210 - i * 22400,
  reservation: 610986 - i * 9184,
  spc: 879224 - i * 13216,
}));

const STATUS_TONE: Record<Inverter['status'], { color: string; label: string }> = {
  ok: { color: '#10B981', label: '정상' },
  warn: { color: '#F59E0B', label: '경고' },
  alert: { color: '#F43F5E', label: '오류' },
};

export function BuildingDetail() {
  const { id } = useParams<{ id: string }>();
  const buildingId = id ?? 'ULJN-001';
  const [range, setRange] = useState<Range>('시간');
  const data = CHART_DATA[range];

  return (
    <>
      {/* Header — back link, building meta, action buttons */}
      <div className="hero-header">
        <div>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: '#6B7280',
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
              {Icons.Arrow}
            </span>
            대시보드로 돌아가기
          </Link>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            {buildingId} · 옥상 햇빛발전소
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 8,
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            <Pill tone="green" dot>
              발전 중
            </Pill>
            <span>경상북도 울진 · 매입임대 1,643세대</span>
            <span style={{ color: '#E2E5EA' }}>·</span>
            <span>설비 용량 240 kWp · 인버터 4기</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" size="md" icon={Icons.Chart}>
            정산 원장
          </Btn>
          <Btn variant="primary" size="md" icon={Icons.Doc}>
            동별 보고서
          </Btn>
        </div>
      </div>

      {/* Chart card */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 4, fontWeight: 500 }}>
              {buildingId} · 발전량
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span
                className="num"
                style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}
              >
                {fmt.n(data.reduce((s, d) => s + d.gen, 0))}
              </span>
              <span style={{ fontSize: 14, color: '#9AA0AB', fontWeight: 500 }}>kWh</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, background: '#F4F5F7', padding: 4, borderRadius: 999 }}>
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: range === r ? '#fff' : 'transparent',
                  color: range === r ? '#0E1116' : '#6B7280',
                  boxShadow: range === r ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bdGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F3F5" vertical={false} />
              <XAxis dataKey="t" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tickMargin={6} width={48} />
              <Tooltip
                cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E5EA', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="gen"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#bdGrad)"
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#9AA0AB"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inverter + household breakdown row */}
      <div className="grid-card-pair" style={{ marginBottom: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
                인버터 상태 · 4기
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                평균 효율{' '}
                <span className="num" style={{ color: '#0E1116', fontWeight: 700 }}>
                  95.8%
                </span>{' '}
                · 평균 온도{' '}
                <span className="num" style={{ color: '#0E1116', fontWeight: 700 }}>
                  40.3°C
                </span>
              </div>
            </div>
            <Pill tone="amber" dot>
              INV-03 경고
            </Pill>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {INVERTERS.map((inv) => {
              const tone = STATUS_TONE[inv.status];
              return (
                <div
                  key={inv.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 80px 70px 80px',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid var(--line)',
                  }}
                >
                  <span className="mono" style={{ fontSize: 11.5, color: '#374151', fontWeight: 600 }}>
                    {inv.id}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: tone.color,
                      }}
                    />
                    <span style={{ fontSize: 12.5, color: '#374151' }}>{tone.label}</span>
                  </div>
                  <span className="num" style={{ fontSize: 12.5, fontWeight: 600, textAlign: 'right' }}>
                    {inv.eff}%
                  </span>
                  <span className="num" style={{ fontSize: 12.5, color: '#6B7280', textAlign: 'right' }}>
                    {inv.temp}°C
                  </span>
                  <span className="num" style={{ fontSize: 12.5, fontWeight: 700, textAlign: 'right' }}>
                    {inv.output} kW
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            세대 분배 — 1,643세대
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 14 }}>
            {buildingId} 발전수익 41% 환원
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6B7280' }}>발전수익 (4월)</span>
              <span className="num" style={{ fontWeight: 700 }}>
                {fmt.won(16432180)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6B7280' }}>주거비 환원 (41%)</span>
              <span className="num" style={{ fontWeight: 700 }}>
                {fmt.won(6737194)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6B7280' }}>LH 매입임대 (64.2%)</span>
              <span className="num" style={{ fontWeight: 700 }}>
                {fmt.won(4325278)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                paddingTop: 8,
                borderTop: '1px dashed var(--line-2)',
              }}
            >
              <span style={{ color: '#6B7280' }}>1,643세대 균등</span>
              <span className="num" style={{ fontWeight: 700, color: '#047857' }}>
                {fmt.won(6420)}/세대
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent settlements table */}
      <div className="card card-pad">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
            최근 정산 · 50건
          </div>
          <Btn variant="ghost" size="sm" icon={Icons.Filter}>
            필터
          </Btn>
        </div>

        <div className="scroll-x">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ color: '#9AA0AB', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>날짜</th>
                <th style={{ padding: '8px 10px', fontWeight: 600 }}>tx_id</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>발전</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>SMP 매출</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>주거비 환원</th>
                <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>SPC 적립</th>
              </tr>
            </thead>
            <tbody>
              {SETTLEMENTS.map((row) => (
                <tr key={row.txId} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '10px' }}>{row.date}</td>
                  <td className="mono" style={{ padding: '10px', color: '#4F46E5', fontWeight: 600 }}>
                    {row.txId}
                  </td>
                  <td className="num" style={{ padding: '10px', textAlign: 'right' }}>
                    {fmt.kwh(row.kwh, 0)} kWh
                  </td>
                  <td className="num" style={{ padding: '10px', textAlign: 'right' }}>
                    {fmt.won(row.gross)}
                  </td>
                  <td className="num" style={{ padding: '10px', textAlign: 'right' }}>
                    {fmt.won(row.reservation)}
                  </td>
                  <td
                    className="num"
                    style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#047857' }}
                  >
                    {fmt.won(row.spc)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
