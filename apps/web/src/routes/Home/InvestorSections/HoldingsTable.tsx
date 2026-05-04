// apps/web/src/routes/Home/InvestorSections/HoldingsTable.tsx
import { investorHoldings } from '../investorFixtures';

const FORMAT_KRW = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

export function HoldingsTable() {
  return (
    <section aria-labelledby="holdings-heading" className="card" style={{ padding: '24px 0' }}>
      <h2 id="holdings-heading" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 24px 16px', letterSpacing: '-0.015em' }}>
        보유 발전소 ({investorHoldings.length})
      </h2>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={{ textAlign: 'left',  padding: '10px 24px', fontWeight: 600, color: 'var(--muted)' }}>발전소</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, color: 'var(--muted)' }}>지분</th>
              <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, color: 'var(--muted)' }}>금월 수익</th>
              <th style={{ textAlign: 'right', padding: '10px 24px', fontWeight: 600, color: 'var(--muted)' }}>누적</th>
            </tr>
          </thead>
          <tbody>
            {investorHoldings.map(h => (
              <tr key={h.buildingId} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '12px 24px', color: 'var(--ink-2)' }}>{h.buildingName}</td>
                <td className="num" style={{ padding: '12px 12px', textAlign: 'right', color: 'var(--ink-2)' }}>{h.stakePct.toFixed(2)}%</td>
                <td className="num" style={{ padding: '12px 12px', textAlign: 'right', color: 'var(--ink)', fontWeight: 600 }}>₩{FORMAT_KRW.format(h.monthlyKrw)}</td>
                <td className="num" style={{ padding: '12px 24px', textAlign: 'right', color: 'var(--ink)' }}>₩{FORMAT_KRW.format(h.cumulativeKrw)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
