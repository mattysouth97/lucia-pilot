// apps/web/src/routes/Home/InvestorSections/YieldChart.tsx
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { investorYield } from '../investorFixtures';

export function YieldChart() {
  return (
    <section aria-labelledby="yield-heading" className="card card-pad" style={{ padding: 24 }}>
      <h2 id="yield-heading" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px', letterSpacing: '-0.015em' }}>
        월별 수익 추이
      </h2>
      <div style={{ height: 220, width: '100%' }}>
        <ResponsiveContainer>
          <LineChart data={investorYield.slice()}>
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-2)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-2)' }} axisLine={false} tickLine={false} width={48} />
            <Tooltip />
            <Line type="monotone" dataKey="yieldKrw" stroke="var(--accent)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
