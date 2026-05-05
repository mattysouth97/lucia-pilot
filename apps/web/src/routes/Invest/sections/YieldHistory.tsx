import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { YIELD_NOTE, YIELD_OVERLINE, YIELD_STATS_LABELS, YIELD_TITLE } from '../copy';
import { yieldHistory } from '../data';

const FORMAT = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

export function YieldHistory() {
  const total = yieldHistory.reduce((s, m) => s + m.distributionKrw, 0);
  const avg = total / yieldHistory.length;
  const onTimeCount = yieldHistory.filter(m => m.onTime).length;

  const chartData = yieldHistory.map(m => ({
    month: m.month,
    distribution: m.distributionKrw / 1_000_000, // millions for axis brevity
    latest: m.latest === true,
  }));

  return (
    <section
      id="yield-history"
      aria-labelledby="yield-heading"
      className="landing-section"
      style={{ background: 'var(--panel)' }}
    >
      <div className="landing-container">
        <p id="yield-heading" className="overline">{YIELD_OVERLINE}</p>
        <h2
          style={{
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: 700,
            color: 'var(--ink)',
            margin: '8px 0 8px',
            letterSpacing: '-0.025em',
          }}
        >
          {YIELD_TITLE}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 24px', maxWidth: '64ch' }}>
          {YIELD_NOTE}
        </p>

        <div className="card card-pad" style={{ display: 'grid', gap: 20 }}>
          {/* Stat trio */}
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              borderBottom: '1px solid var(--line)',
              paddingBottom: 16,
            }}
          >
            <YieldStat
              label={YIELD_STATS_LABELS.total}
              value={`₩${FORMAT.format(total)}`}
            />
            <YieldStat
              label={YIELD_STATS_LABELS.avg}
              value={`₩${FORMAT.format(Math.round(avg))}`}
            />
            <YieldStat
              label={YIELD_STATS_LABELS.onTime}
              value={`${onTimeCount} / ${yieldHistory.length}`}
              accent
            />
          </div>

          {/* 12-month bar chart */}
          <div style={{ width: '100%', height: 220, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: 'var(--muted-2)' }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
                  contentStyle={{
                    borderRadius: 4,
                    border: '1px solid var(--line-2)',
                    fontSize: 11.5,
                    boxShadow: 'none',
                    padding: '8px 10px',
                    fontFamily: 'Geist Mono, monospace',
                  }}
                  formatter={(v: unknown) => [`${(v as number).toFixed(2)} M원`, '분배']}
                  labelFormatter={(label: unknown) => `${label}`}
                />
                <Bar dataKey="distribution" maxBarSize={36} radius={[3, 3, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.latest ? 'var(--accent)' : 'var(--ink)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 18px',
              fontSize: 11.5,
              color: 'var(--muted-2)',
              paddingTop: 4,
            }}
          >
            <LegendDot color="var(--ink)" label="과거 11개월" />
            <LegendDot color="var(--accent)" label="2026.04 (최신)" />
          </div>
        </div>
      </div>
    </section>
  );
}

function YieldStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="overline">{label}</span>
      <span
        className="kpi-metric"
        style={{
          fontSize: 24,
          letterSpacing: '-0.025em',
          color: accent ? 'var(--accent-ink)' : 'var(--ink)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }}
      />
      <span>{label}</span>
    </span>
  );
}
