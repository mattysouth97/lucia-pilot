// GenerationCard — hero generation chart, today vs 30-day avg + SMP.
// FR-M-001 · recharts ComposedChart.
//
// Per DESIGN.md "the number is the hero" — the daily-kWh figure is the
// monumental display metric on the dashboard. Time-range selector is a
// minimal underline group, not a pill switcher.

import { useState } from 'react';
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

import { Pill } from '@/components/atoms';

export interface HourlyDataPoint {
  h: string;
  today: number;
  avg: number;
  smp: number;
}

interface GenerationCardProps {
  hourlyData?: HourlyDataPoint[];
}

const DEFAULT_DATA: HourlyDataPoint[] = [
  { h: '06', today: 18,   avg: 16,   smp: 92  },
  { h: '07', today: 142,  avg: 128,  smp: 95  },
  { h: '08', today: 410,  avg: 382,  smp: 102 },
  { h: '09', today: 760,  avg: 720,  smp: 108 },
  { h: '10', today: 1180, avg: 1090, smp: 114 },
  { h: '11', today: 1520, avg: 1440, smp: 119 },
  { h: '12', today: 1680, avg: 1610, smp: 124 },
  { h: '13', today: 1620, avg: 1580, smp: 128 },
  { h: '14', today: 1480, avg: 1490, smp: 131 },
  { h: '15', today: 1240, avg: 1280, smp: 136 },
  { h: '16', today: 920,  avg: 980,  smp: 142 },
  { h: '17', today: 540,  avg: 610,  smp: 148 },
  { h: '18', today: 210,  avg: 260,  smp: 138 },
  { h: '19', today: 32,   avg: 48,   smp: 122 },
];

const RANGES = ['시간', '일', '주', '월', '연'] as const;
type Range = typeof RANGES[number];

export function GenerationCard({ hourlyData }: GenerationCardProps = {}) {
  const [range, setRange] = useState<Range>('일');
  const data = hourlyData ?? DEFAULT_DATA;

  const total = data.reduce((s, d) => s + d.today, 0);
  const yest  = data.reduce((s, d) => s + d.avg, 0);
  const delta = ((total - yest) / yest * 100).toFixed(1);

  return (
    <div className="card" style={{ padding: '24px 24px 20px' }}>
      {/* Top meta row — overline + range selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pill tone="green" dot>실시간</Pill>
          <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 500 }}>
            업데이트 26초 전 · MQTT 수신
          </span>
        </div>

        {/* Range selector — text + underline indicator, no pill */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--line)',
          }}
        >
          {RANGES.map((r) => {
            const active = range === r;
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--ink)' : 'var(--muted)',
                  letterSpacing: '-0.005em',
                  position: 'relative',
                  transition: 'color .12s',
                }}
              >
                {r}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: -1,
                      height: 2,
                      background: 'var(--ink)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Display block — overline + monumental number + supporting ledger row */}
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--muted)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          오늘 발전량 · Uljin 116동
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <span
            className="display-metric"
            style={{ fontSize: 'clamp(48px, 6vw, 72px)' }}
          >
            11,852.4
          </span>
          <span
            style={{
              fontSize: 16,
              color: 'var(--muted)',
              fontWeight: 500,
              letterSpacing: '-0.005em',
            }}
          >
            kWh
          </span>
          <span
            className="num"
            style={{
              marginLeft: 4,
              color: 'var(--accent-ink)',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ↑ {delta}%
            <span style={{ color: 'var(--muted)', fontWeight: 500, marginLeft: 6 }}>
              전일 평균
            </span>
          </span>
        </div>

        {/* Ledger row — three flat figures separated by hairline dots */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 16,
            flexWrap: 'wrap',
            alignItems: 'baseline',
          }}
        >
          <LedgerFigure label="총 SMP 매출" value="1,490,210" unit="원" />
          <span style={{ color: 'var(--line-2)' }}>·</span>
          <LedgerFigure label="REC 적립" value="14.22" unit="REC" />
          <span style={{ color: 'var(--line-2)' }}>·</span>
          <LedgerFigure label="CO₂ 감축" value="5,413" unit="kg" />
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="todayGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.16} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E8EAEE" vertical={false} />
            <XAxis
              dataKey="h"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              style={{ fontSize: 11, fill: '#8A93A0' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={6}
              width={40}
              style={{ fontSize: 11, fill: '#8A93A0' }}
            />
            <Tooltip
              cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                borderRadius: 4,
                border: '1px solid #D5D9DF',
                fontSize: 11.5,
                boxShadow: 'none',
              }}
              labelFormatter={(l: unknown) => `${l}:00`}
              formatter={(v: unknown, k: unknown) => [
                `${(v as number)?.toLocaleString()} ${k === 'smp' ? '원/kWh' : 'kWh'}`,
                k === 'today' ? '오늘' : k === 'avg' ? '30일 평균' : 'SMP',
              ]}
            />
            <Area
              type="monotone"
              dataKey="today"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#todayGrad)"
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#8A93A0"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: 18,
          marginTop: 10,
          fontSize: 11.5,
          color: 'var(--muted)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 10,
              height: 2,
              background: 'var(--accent)',
              display: 'inline-block',
            }}
          />
          오늘
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 12,
              height: 2,
              background: 'var(--muted-2)',
              display: 'inline-block',
              borderRadius: 1,
            }}
          />
          30일 평균
        </span>
        <span style={{ marginLeft: 'auto' }} className="num">
          피크 12:00 · 1,680 kWh
        </span>
      </div>
    </div>
  );
}

// LedgerFigure — small inline metric for the supporting row under the hero.
function LedgerFigure({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontSize: 10.5,
          color: 'var(--muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="num" style={{ fontSize: 16, color: 'var(--ink)', fontWeight: 700 }}>
          {value}
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>{unit}</span>
      </span>
    </div>
  );
}
