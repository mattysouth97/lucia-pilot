// EnvironmentalImpactCard — analyst-side single-card aggregate of this-month
// 환원 분배. Surfaces the audit-relevant numbers (116동 / 2,839세대 / ₩13.3M)
// alongside an FR-S-004 검증 배지 so an LH ESG 처장 can confirm the month's
// distribution at a glance without leaving their home.

import { Pill, fmt } from '@/components/atoms';

interface ImpactStat {
  readonly label: string;
  readonly value: string;
  readonly unit?: string;
  readonly accent?: boolean;
}

const IMPACT_STATS: ImpactStat[] = [
  { label: '운영 발전소', value: '116', unit: '동' },
  { label: '환원 대상',   value: fmt.n(2839), unit: '세대' },
  { label: '이번 달 환원', value: '₩13.27', unit: 'M', accent: true },
  { label: '검증 노드',   value: '4 / 4', unit: 'active' },
];

const COHORT_BREAKDOWN = [
  { code: 'lh',     label: 'LH 매입임대',     households: 1643, perHousehold: 6420,  tone: 'indigo' as const },
  { code: 'gukmin', label: '국민임대',         households: 280,  perHousehold: 7420,  tone: 'sky'    as const },
  { code: 'sowoe',  label: '에너지소외',       households: 916,  perHousehold: 18195, tone: 'amber'  as const },
];

export function EnvironmentalImpactCard() {
  return (
    <section
      aria-labelledby="impact-heading"
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Pill tone="indigo">FR-S-004</Pill>
            <span className="overline">2026.04 환원 분배</span>
          </div>
          <h3
            id="impact-heading"
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--ink)',
            }}
          >
            116동 → 2,839세대 환원 검증
          </h3>
        </div>
        <Pill tone="green" dot>
          ✓ 정산 무결성 확인
        </Pill>
      </header>

      {/* Stat strip */}
      <div
        style={{
          display: 'grid',
          gap: 0,
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-sm, 6px)',
          overflow: 'hidden',
        }}
      >
        {IMPACT_STATS.map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: '14px 16px',
              borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
              background: s.accent ? 'var(--accent-soft, #ECFDF5)' : 'var(--panel)',
            }}
          >
            <div className="overline" style={{ marginBottom: 6 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span
                className="kpi-metric num"
                style={{
                  fontSize: 22,
                  letterSpacing: '-0.025em',
                  color: s.accent ? 'var(--accent-ink, #047857)' : 'var(--ink)',
                }}
              >
                {s.value}
              </span>
              {s.unit && (
                <span style={{ fontSize: 11.5, color: 'var(--muted-2)', fontWeight: 500 }}>
                  {s.unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Cohort breakdown table */}
      <div>
        <div className="overline" style={{ marginBottom: 10 }}>
          코호트별 분배 — FR-S-004 anchors
        </div>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12.5,
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={thStyle}>코호트</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>세대</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>세대당 환원</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>합계</th>
            </tr>
          </thead>
          <tbody>
            {COHORT_BREAKDOWN.map((c) => (
              <tr key={c.code} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={tdStyle}>
                  <Pill tone={c.tone}>{c.label}</Pill>
                </td>
                <td className="num" style={{ ...tdStyle, textAlign: 'right' }}>
                  {fmt.n(c.households)}
                </td>
                <td className="num" style={{ ...tdStyle, textAlign: 'right' }}>
                  {fmt.won(c.perHousehold)}
                </td>
                <td
                  className="num"
                  style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: 'var(--ink)' }}
                >
                  {fmt.won(c.households * c.perHousehold)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          fontSize: 11,
          color: 'var(--muted-2)',
        }}
      >
        <span>모든 분배 거래는 Hyperledger Fabric 원장에 영구 기록 — 변조 시 자동 거부.</span>
        <span className="num">avg block-time 2.1s</span>
      </footer>
    </section>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--muted)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  paddingBottom: 8,
};

const tdStyle: React.CSSProperties = {
  padding: '10px 0',
  color: 'var(--ink-2)',
};
