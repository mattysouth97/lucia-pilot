// Re100ContractCard — RE100 PPA buyer contract summary.
// Surfaces 약정 매수량 (MWh), 누적 매수, 프리미엄 단가, 잔여 약정 기간.

import { Pill, fmt } from '@/components/atoms';

const CONTRACT = {
  buyer: 'SK하이닉스 ESG실',
  contractedMonthlyKwh: 180_000,
  ytdContractedKwh: 720_000,    // 4 months × 180,000
  ytdDeliveredKwh: 691_400,
  premiumKrwPerKwh: 20,
  remainingMonths: 32,
  startDate: '2026-01-01',
  endDate: '2028-12-31',
} as const;

const ytdFulfillmentPct = (CONTRACT.ytdDeliveredKwh / CONTRACT.ytdContractedKwh) * 100;

export function Re100ContractCard() {
  return (
    <section
      aria-labelledby="re100-contract-heading"
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Pill tone="indigo">FR-X-004</Pill>
            <span className="overline">RE100 PPA 매수 계약</span>
          </div>
          <h2
            id="re100-contract-heading"
            style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}
          >
            {CONTRACT.buyer} · {fmt.n(CONTRACT.contractedMonthlyKwh)} kWh/월
          </h2>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
            계약 {CONTRACT.startDate} ~ {CONTRACT.endDate} · 잔여{' '}
            <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>
              {CONTRACT.remainingMonths}
            </span>
            개월
          </div>
        </div>
        <Pill tone="green" dot>
          ✓ 이행 중
        </Pill>
      </header>

      {/* Stat strip */}
      <div
        style={{
          display: 'grid',
          gap: 0,
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-sm, 6px)',
          overflow: 'hidden',
        }}
      >
        <Stat label="이번 분기 약정" value={fmt.n(CONTRACT.contractedMonthlyKwh * 3)} unit="kWh" />
        <Stat label="누적 매수 (YTD)" value={fmt.n(CONTRACT.ytdDeliveredKwh)} unit="kWh" accent />
        <Stat label="이행률 (YTD)" value={`${ytdFulfillmentPct.toFixed(1)}`} unit="%" />
        <Stat label="프리미엄 단가" value={`+${CONTRACT.premiumKrwPerKwh}`} unit="원/kWh" />
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11.5,
            color: 'var(--muted)',
            marginBottom: 6,
          }}
        >
          <span>YTD 이행 진행률</span>
          <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>
            {fmt.n(CONTRACT.ytdDeliveredKwh)} / {fmt.n(CONTRACT.ytdContractedKwh)} kWh
          </span>
        </div>
        <div
          style={{
            height: 8,
            background: 'var(--panel)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, ytdFulfillmentPct)}%`,
              height: '100%',
              background: 'var(--accent)',
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        background: accent ? 'var(--accent-soft, #ECFDF5)' : 'var(--panel)',
        borderRight: '1px solid var(--line)',
      }}
    >
      <div className="overline" style={{ marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span
          className="kpi-metric num"
          style={{
            fontSize: 22,
            letterSpacing: '-0.025em',
            color: accent ? 'var(--accent-ink, #047857)' : 'var(--ink)',
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 11.5, color: 'var(--muted-2)', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
