// GenerationCard — Hero generation chart, today vs 30-day avg + SMP
// FR-M-001 · recharts ComposedChart

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

export function GenerationCard({ hourlyData }: GenerationCardProps) {
  const [range, setRange] = useState<Range>('일');
  const data = hourlyData ?? DEFAULT_DATA;

  const total = data.reduce((s, d) => s + d.today, 0);
  const yest  = data.reduce((s, d) => s + d.avg, 0);
  const delta = ((total - yest) / yest * 100).toFixed(1);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Pill tone="green" dot>실시간</Pill>
            <span style={{ fontSize: 12, color: '#9AA0AB', fontWeight: 500 }}>
              업데이트 26초 전 · MQTT 수신
            </span>
          </div>
          <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 6, fontWeight: 500 }}>
            오늘 발전량 · Uljin 116동
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              className="num"
              style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}
            >
              11,852.4
            </span>
            <span style={{ fontSize: 16, color: '#9AA0AB', fontWeight: 500 }}>kWh</span>
            <span style={{
              marginLeft: 8, color: '#059669', fontWeight: 700, fontSize: 13,
              background: '#ECFDF5', padding: '4px 10px', borderRadius: 999,
            }}>
              ▲ {delta}% 전일 평균
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 10 }}>
            총 SMP 매출{' '}
            <span className="num" style={{ color: '#0E1116', fontWeight: 700 }}>1,490,210원</span>
            <span style={{ margin: '0 8px', color: '#E2E5EA' }}>·</span>
            REC 적립{' '}
            <span className="num" style={{ color: '#0E1116', fontWeight: 700 }}>14.22 REC</span>
            <span style={{ margin: '0 8px', color: '#E2E5EA' }}>·</span>
            CO₂ 감축{' '}
            <span className="num" style={{ color: '#0E1116', fontWeight: 700 }}>5,413 kg</span>
          </div>
        </div>

        {/* Time-range pills */}
        <div style={{ display: 'flex', gap: 6, background: '#F4F5F7', padding: 4, borderRadius: 999 }}>
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '6px 14px', borderRadius: 999,
                fontSize: 12.5, fontWeight: 600,
                background: range === r ? '#fff' : 'transparent',
                color: range === r ? '#0E1116' : '#6B7280',
                boxShadow: range === r ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                border: 'none', cursor: 'pointer',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="todayGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#F1F3F5" vertical={false} />
            <XAxis
              dataKey="h"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              style={{ fontSize: 12, fill: '#9AA0AB' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={6}
              width={40}
              style={{ fontSize: 12, fill: '#9AA0AB' }}
            />
            <Tooltip
              cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ borderRadius: 12, border: '1px solid #E2E5EA', fontSize: 12 }}
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
              strokeWidth={2.5}
              fill="url(#todayGrad)"
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

      {/* Legend */}
      <div style={{ display: 'flex', gap: 18, marginTop: 8, fontSize: 12, color: '#6B7280' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#10B981', display: 'inline-block' }} />
          오늘
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 2, background: '#9AA0AB', display: 'inline-block' }} />
          30일 평균
        </span>
        <span style={{ marginLeft: 'auto' }} className="num">
          피크 12:00 · 1,680 kWh
        </span>
      </div>
    </div>
  );
}
