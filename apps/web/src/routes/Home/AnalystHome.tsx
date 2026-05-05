// apps/web/src/routes/Home/AnalystHome.tsx
//
// LH ESG 경영실 (analyst role) home. Diverges from the shared `Dashboard`
// because operator and analyst now have distinct primary information needs:
// the analyst lands on audit-integrity + report generation; the operator
// lands on real-time fleet monitoring (see OperatorHome).
//
// This page composes the analyst-relevant sections directly: an audit hero
// strip, the existing ActivityZone (verifiable settlement trail), and a new
// EnvironmentalImpactCard summarising this-month 환원 분배.

import { Icons } from '@/components/Icons';
import { EnvironmentalImpactCard } from '@/components/cards/EnvironmentalImpactCard';
import { useLuciaModals } from '@/lib/modals';
import { Dashboard } from '@/routes/Dashboard';
import { useRouteMeta } from '@/routes/Invest/meta';

export function AnalystHome() {
  useRouteMeta({
    title: 'Lucia — LH ESG 분석가 대시보드',
    description: 'LH ESG 분석가 대시보드 — 감사 무결성 및 환원 분배 검증',
    robots: 'noindex, nofollow',
  });

  const { openReport } = useLuciaModals();

  return (
    <>
      <AuditHeroStrip onReport={openReport} />
      <EnvironmentalImpactCard />
      <div style={{ marginTop: 24 }}>
        <Dashboard />
      </div>
    </>
  );
}

/* ===================================================================== *
 * AuditHeroStrip — 변조 시도 0건 + 검증 노드 + 보고서 CTA                 *
 * ===================================================================== */

function AuditHeroStrip({ onReport }: { onReport: () => void }) {
  return (
    <section
      aria-label="감사 무결성 요약"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 16,
        padding: '18px 20px',
        background: 'var(--ink)',
        color: '#FFFFFF',
        borderRadius: 'var(--r-sm, 6px)',
        marginBottom: 16,
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 28px', alignItems: 'baseline' }}>
        <div className="overline" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', flexBasis: '100%', marginBottom: 6 }}>
          감사 무결성 — 2026.04
        </div>

        <Stat
          label="변조 시도 (이번 달)"
          value="0"
          unit="건"
          accentMint
        />
        <Stat
          label="블록 높이"
          value="184,729"
          mono
        />
        <Stat
          label="검증 노드"
          value="4 / 4"
          unit="active"
        />
        <Stat
          label="마지막 검증"
          value="13:24:18"
          unit="2분 전"
          mono
        />
      </div>

      <button
        type="button"
        onClick={onReport}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--accent)',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: 6,
          fontSize: 13.5,
          fontWeight: 700,
          letterSpacing: '-0.005em',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 120ms ease-out, transform 120ms ease-out',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent-ink, #047857)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent)';
        }}
      >
        <span style={{ display: 'inline-flex' }}>{Icons.Doc}</span>
        감사 보고서 생성
      </button>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
  accentMint,
  mono,
}: {
  label: string;
  value: string;
  unit?: string;
  accentMint?: boolean;
  mono?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.62)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: accentMint ? 'var(--accent)' : '#FFFFFF',
          fontFamily: mono ? 'Geist Mono, ui-monospace, monospace' : 'inherit',
          fontVariantNumeric: 'tabular-nums',
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 5,
        }}
      >
        {accentMint && (
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: 'var(--accent)',
              display: 'inline-block',
              boxShadow: '0 0 0 3px rgba(16,185,129,0.18)',
              marginRight: 2,
              alignSelf: 'center',
            }}
          />
        )}
        {value}
        {unit && (
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500,
              letterSpacing: 0,
              fontFamily: 'inherit',
            }}
          >
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}
