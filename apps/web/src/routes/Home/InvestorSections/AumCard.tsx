// apps/web/src/routes/Home/InvestorSections/AumCard.tsx
import { investorAum } from '../investorFixtures';

const FORMAT_KRW = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

export function AumCard() {
  return (
    <section aria-labelledby="aum-heading" className="card card-pad" style={{ padding: 24 }}>
      <p id="aum-heading" className="overline" style={{ marginBottom: 8 }}>누적 투자금</p>
      <div className="display-metric" style={{ fontSize: 'clamp(36px, 5vw, 48px)' }}>
        ₩{FORMAT_KRW.format(investorAum.cumulativeKrw)}
      </div>
      <div style={{ marginTop: 14, display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--muted)' }}>
        <span>예상 연 수익률 <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>{investorAum.expectedYieldPct}%</span></span>
        <span>다음 정산 <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>{investorAum.nextSettlementDate}</span></span>
      </div>
    </section>
  );
}
