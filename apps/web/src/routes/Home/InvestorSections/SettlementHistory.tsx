// apps/web/src/routes/Home/InvestorSections/SettlementHistory.tsx
import { investorSettlements } from '../investorFixtures';

const FORMAT_KRW = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

export function SettlementHistory() {
  return (
    <section aria-labelledby="settle-heading" className="card" style={{ padding: '24px 0' }}>
      <h2 id="settle-heading" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 24px 16px', letterSpacing: '-0.015em' }}>
        정산 내역
      </h2>
      <div role="list">
        {investorSettlements.map(s => (
          <div key={s.txId} role="listitem" style={{
            display: 'grid', gridTemplateColumns: '120px 1fr auto auto',
            alignItems: 'center', gap: 16, padding: '12px 24px',
            borderBottom: '1px solid var(--line)', fontSize: 13,
          }}>
            <span className="num" style={{ color: 'var(--muted)' }}>{s.date}</span>
            <span className="num" style={{ color: 'var(--muted)', fontSize: 12 }}>{s.txId}</span>
            <span className="num" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>✓ block-{s.blockHeight}</span>
            <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>₩{FORMAT_KRW.format(s.amountKrw)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
