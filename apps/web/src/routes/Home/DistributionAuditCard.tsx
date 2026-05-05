// apps/web/src/routes/Home/DistributionAuditCard.tsx
//
// FR-S-004 — analyst audit card for monthly 환원 분배 round.
// Replaces EnvironmentalImpactCard. Shows the FR-S-004 rule explicitly
// (formula strip + 비중 % column) and self-verifies the cohort sum.

import type { CSSProperties, ReactNode } from 'react';

import { Pill } from '@/components/atoms';

import type { DistributionRound, DistributionRoundStatus } from './analystFixtures';

export interface DistributionAuditCardProps {
  readonly round: DistributionRound;
  readonly onSankeyClick?: () => void;
}

/** Format a KRW amount with ₩ prefix — distinct from fmt.won() which appends 원. */
function fmtWon(n: number): string {
  return '₩' + Math.round(n).toLocaleString('ko-KR');
}

/** Format integer with Korean locale grouping. */
function fmtN(n: number): string {
  return n.toLocaleString('ko-KR');
}

export function DistributionAuditCard({ round, onSankeyClick }: DistributionAuditCardProps) {
  const sumActual = round.cohorts.reduce((acc, c) => acc + c.households * c.per_household, 0);
  const totalHouseholds = round.cohorts.reduce((acc, c) => acc + c.households, 0);

  return (
    <section
      aria-labelledby="distribution-audit-heading"
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
            <span className="overline">{round.period.replace('-', '.')} 환원 분배</span>
          </div>
          <h3
            id="distribution-audit-heading"
            style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}
          >
            환원 검증 — {fmtWon(round.environ_total)} 분배
          </h3>
        </div>
        {onSankeyClick && (
          <button
            type="button"
            onClick={onSankeyClick}
            style={{
              fontSize: 12,
              color: 'var(--ink-2, var(--ink))',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              fontWeight: 500,
            }}
          >
            분배 흐름도 →
          </button>
        )}
      </header>

      {/* Formula strip: revenue × 41% → environ_total → N세대 분배 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px 10px',
          padding: '14px 16px',
          background: 'var(--accent-soft, #ECFDF5)',
          borderRadius: 'var(--r-sm, 6px)',
          fontSize: 14,
        }}
      >
        <FormulaTerm label="매출">
          <span className="num">{fmtWon(round.revenue)}</span>
        </FormulaTerm>
        <FormulaOp>×</FormulaOp>
        <FormulaTerm>
          <span className="num" style={{ color: 'var(--accent-ink, #047857)', fontWeight: 700 }}>
            41%
          </span>
        </FormulaTerm>
        <FormulaOp>→</FormulaOp>
        <FormulaTerm label="환원">
          <span className="num" style={{ color: 'var(--accent-ink, #047857)', fontWeight: 700 }}>
            {fmtWon(round.environ_total)}
          </span>
        </FormulaTerm>
        <FormulaOp>→</FormulaOp>
        <FormulaTerm>
          <span className="num">{fmtN(totalHouseholds)}세대</span>
          <span style={{ marginLeft: 3, color: 'var(--muted-2)' }}> 분배</span>
        </FormulaTerm>
      </div>

      {/* Cohort allocation table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr aria-label="코호트 배분 헤더" style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={thStyle}>코호트</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>비중</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>세대</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>세대당</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>합계</th>
          </tr>
        </thead>
        <tbody>
          {round.cohorts.map((c) => {
            const total = c.households * c.per_household;
            const tone: 'indigo' | 'sky' | 'amber' =
              c.code === 'lh' ? 'indigo' : c.code === 'gukmin' ? 'sky' : 'amber';
            return (
              <tr
                key={c.code}
                style={{ borderBottom: '1px solid var(--line)' }}
                aria-label={c.label}
              >
                <td style={tdStyle}>
                  <Pill tone={tone}>{c.label}</Pill>
                </td>
                <td className="num" style={{ ...tdStyle, textAlign: 'right' }}>
                  {(c.share_pct * 100).toFixed(1)}%
                </td>
                <td className="num" style={{ ...tdStyle, textAlign: 'right' }}>
                  {fmtN(c.households)}
                </td>
                <td className="num" style={{ ...tdStyle, textAlign: 'right' }}>
                  {fmtWon(Math.round(c.per_household))}
                </td>
                <td
                  className="num"
                  style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: 'var(--ink)' }}
                >
                  {fmtWon(Math.round(total))}
                </td>
              </tr>
            );
          })}
          <tr aria-label="합계" style={{ background: 'var(--bg, #FBFBFA)' }}>
            <td style={{ ...tdStyle, fontWeight: 700 }}>합계</td>
            <td className="num" style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
              100.0%
            </td>
            <td className="num" style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
              {fmtN(totalHouseholds)}
            </td>
            <td style={tdStyle} />
            <td
              className="num"
              style={{
                ...tdStyle,
                textAlign: 'right',
                fontWeight: 700,
                color: 'var(--accent-ink, #047857)',
              }}
            >
              <span>{fmtWon(Math.round(sumActual))}</span><span aria-hidden="true"> ✓</span>
            </td>
          </tr>
        </tbody>
      </table>

      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          fontSize: 11,
          color: 'var(--muted-2)',
        }}
      >
        <span>Hyperledger Fabric 영구 기록 — 변조 시 자동 거부</span>
        <MonthlyCycleBadge
          status={round.status}
          dMinus={round.close_d_minus}
          sealedAt={round.sealed_at}
        />
      </footer>
    </section>
  );
}

function MonthlyCycleBadge(props: {
  readonly status: DistributionRoundStatus;
  readonly dMinus?: number;
  readonly sealedAt?: string;
}) {
  switch (props.status) {
    case 'in_progress': {
      const d = props.dMinus ?? 0;
      const isSoon = d <= 1;
      return (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            border: `1px solid ${isSoon ? 'var(--amber-fg, #B45309)' : 'var(--line)'}`,
            color: isSoon ? 'var(--amber-fg, #B45309)' : 'var(--ink-2, var(--ink))',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {isSoon
            ? `라운드 마감 임박 · 마감 D-${d}`
            : `라운드 진행 중 · 마감 예정 D-${d}`}
        </span>
      );
    }
    case 'closing_soon':
      return (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            border: '1px solid var(--amber-fg, #B45309)',
            color: 'var(--amber-fg, #B45309)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          라운드 마감 임박 · 마감 D-{props.dMinus ?? 1}
        </span>
      );
    case 'sealing':
      return (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            border: '1px solid var(--line)',
            color: 'var(--muted-2)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          마감 검증 중…
        </span>
      );
    case 'sealed': {
      const t = props.sealedAt ? formatSealedAt(props.sealedAt) : '—';
      return (
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 999,
            border: '1px solid var(--accent-ink, #047857)',
            color: 'var(--accent-ink, #047857)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          마감 완료 · 검증 {t}
        </span>
      );
    }
  }
}

/**
 * Parse ISO 8601 timestamp respecting the embedded UTC offset.
 * Extracts wall-clock time from the offset portion rather than converting to
 * local time — prevents jsdom (UTC) vs. browser (+09:00) divergence in tests.
 *
 * e.g. "2026-05-01T02:14:00+09:00" → "05-01 02:14"
 */
function formatSealedAt(iso: string): string {
  // Try to extract date/time components directly from the string to avoid
  // timezone conversion issues in test environments (jsdom runs at UTC).
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (m) {
    return `${m[2]}-${m[3]} ${m[4]}:${m[5]}`;
  }
  // Fallback: parse with Date (may differ in UTC environments)
  const d = new Date(iso);
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${mo}-${day} ${hh}:${mm}`;
}

function FormulaTerm({
  label,
  children,
}: {
  readonly label?: string;
  readonly children: ReactNode;
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
      {label && (
        <span style={{ fontSize: 11, color: 'var(--muted-2)', fontWeight: 500 }}>{label}</span>
      )}
      {children}
    </span>
  );
}

function FormulaOp({ children }: { readonly children: ReactNode }) {
  return (
    <span style={{ color: 'var(--muted)', fontWeight: 500, fontSize: 14 }}>{children}</span>
  );
}

const thStyle: CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--muted)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  padding: '0 0 8px',
};

const tdStyle: CSSProperties = {
  padding: '10px 0',
  color: 'var(--ink-2, var(--ink))',
};
