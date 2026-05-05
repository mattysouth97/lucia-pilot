// MonthlyDeliveryChart — RE100 delivery 계약이행률.
// Monthly contracted-kWh vs delivered-kWh as a paired bar chart.

import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Pill } from '@/components/atoms';

interface MonthlyRow {
  month: string;
  contracted: number;
  delivered: number;
}

const DATA: MonthlyRow[] = [
  { month: '25.11', contracted: 180_000, delivered: 175_200 },
  { month: '25.12', contracted: 180_000, delivered: 168_900 },
  { month: '26.01', contracted: 180_000, delivered: 170_280 },
  { month: '26.02', contracted: 180_000, delivered: 168_500 },
  { month: '26.03', contracted: 180_000, delivered: 174_220 },
  { month: '26.04', contracted: 180_000, delivered: 178_400 },
];

const FORMAT = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

export function MonthlyDeliveryChart() {
  const totalContracted = DATA.reduce((s, d) => s + d.contracted, 0);
  const totalDelivered = DATA.reduce((s, d) => s + d.delivered, 0);
  const fulfillment = (totalDelivered / totalContracted) * 100;

  return (
    <section
      aria-labelledby="re100-delivery-heading"
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="overline" style={{ marginBottom: 6 }}>월별 PPA 이행률</div>
          <h3
            id="re100-delivery-heading"
            style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}
          >
            6개월 이행 — 평균{' '}
            <span className="num" style={{ color: 'var(--accent-ink, #047857)' }}>
              {fulfillment.toFixed(1)}%
            </span>
          </h3>
        </div>
        <Pill tone="green" dot>SLA 95% 이상</Pill>
      </header>

      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-2)' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-2)' }}
              width={60}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              domain={[0, 200_000]}
            />
            <Tooltip
              cursor={{ fill: 'rgba(16,185,129,0.06)' }}
              contentStyle={{
                borderRadius: 4,
                border: '1px solid var(--line-2)',
                fontSize: 11.5,
                boxShadow: 'none',
                padding: '8px 10px',
                fontFamily: 'Geist Mono, monospace',
              }}
              formatter={(v: unknown, name: string) => [
                `${FORMAT.format(v as number)} kWh`,
                name === 'contracted' ? '약정' : '실제 매수',
              ]}
              labelFormatter={(label) => `20${label}`}
            />
            <Legend
              wrapperStyle={{ fontSize: 11.5, color: 'var(--muted)' }}
              formatter={(v) => (v === 'contracted' ? '약정 매수량' : '실제 매수량')}
            />
            <Bar dataKey="contracted" maxBarSize={20} radius={[3, 3, 0, 0]}>
              {DATA.map((_, i) => (
                <Cell key={i} fill="var(--line-2)" />
              ))}
            </Bar>
            <Bar dataKey="delivered" maxBarSize={20} radius={[3, 3, 0, 0]}>
              {DATA.map((_, i) => (
                <Cell key={i} fill="var(--accent)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
