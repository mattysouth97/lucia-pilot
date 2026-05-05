// apps/web/src/routes/Home/OperatorHome.tsx
//
// SPC 운영팀 (operator role) home. Diverges from the analyst's audit-finance
// surface; here the primary need is real-time fleet monitoring and anomaly
// triage. Composes generation + anomaly + buildings ranking directly,
// without reusing Dashboard (which is now analyst-focused via ActivityZone).

import { AnomalyCard } from '@/components/cards/AnomalyCard';
import { BuildingsCard } from '@/components/cards/BuildingsCard';
import { GenerationCard } from '@/components/cards/GenerationCard';
import { useRouteMeta } from '@/routes/Invest/meta';

export function OperatorHome() {
  useRouteMeta({
    title: 'Lucia — SPC 운영팀 대시보드',
    description: 'SPC 운영팀 — 실시간 발전 모니터링 및 이상 처리',
    robots: 'noindex, nofollow',
  });

  return (
    <>
      <FleetStatusHero />

      <OpsToolPanel />

      <div className="grid-dashboard" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <GenerationCard />
        </div>
        <div style={{ display: 'grid', gap: 16, alignContent: 'start', gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <AnomalyCard />
        </div>
      </div>

      <BuildingsCard />
    </>
  );
}

/* ===================================================================== *
 * FleetStatusHero — 정상 N / 주의 N / 이상 N + current generation MW     *
 * ===================================================================== */

function FleetStatusHero() {
  return (
    <section
      aria-label="전체 발전 현황"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
        padding: '18px 22px',
        background: 'var(--ink)',
        color: '#FFFFFF',
        borderRadius: 'var(--r-sm, 6px)',
        marginBottom: 16,
        alignItems: 'baseline',
        rowGap: 18,
      }}
    >
      <div style={{ flexBasis: '100%', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: 'var(--accent)',
            display: 'inline-block',
            boxShadow: '0 0 0 3px rgba(16,185,129,0.18)',
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.62)',
          }}
        >
          실시간 운영 — 2026.04.30 13:24 KST
        </span>
      </div>

      <FleetStat label="정상 가동" value="110" unit="동" tone="ok" />
      <Divider />
      <FleetStat label="주의" value="5" unit="동" tone="warn" />
      <Divider />
      <FleetStat label="이상" value="1" unit="동" tone="alert" />
      <Divider />
      <FleetStat label="현재 발전" value="2.84" unit="MW" tone="muted" mono />
      <Divider />
      <FleetStat label="SMP 단가" value="146" unit="원/kWh" tone="muted" mono />
      <Divider />
      <FleetStat label="REC 누적 (이번 달)" value="14.22" unit="REC" tone="muted" mono />
    </section>
  );
}

function FleetStat({
  label,
  value,
  unit,
  tone,
  mono,
}: {
  label: string;
  value: string;
  unit?: string;
  tone: 'ok' | 'warn' | 'alert' | 'muted';
  mono?: boolean;
}) {
  const valueColor =
    tone === 'ok'    ? 'var(--accent)' :
    tone === 'warn'  ? '#F59E0B' :
    tone === 'alert' ? '#F87171' :
                       '#FFFFFF';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.025em',
          color: valueColor,
          fontFamily: mono ? 'Geist Mono, ui-monospace, monospace' : 'inherit',
          fontVariantNumeric: 'tabular-nums',
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 5,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: 11.5,
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

function Divider() {
  return (
    <span
      aria-hidden
      style={{
        width: 1,
        alignSelf: 'stretch',
        background: 'rgba(255,255,255,0.12)',
      }}
    />
  );
}

/* ===================================================================== *
 * OpsToolPanel — quick links to admin console + anomaly queue            *
 * ===================================================================== */

function OpsToolPanel() {
  return (
    <section
      aria-label="운영 도구"
      className="card card-pad"
      style={{
        marginBottom: 16,
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>운영 도구</div>
      <a
        href="/admin"
        style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}
      >
        관리자 콘솔 →
      </a>
      <a
        href="/admin#anomalies"
        style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}
      >
        이상 큐 →
      </a>
      <a
        href="/monitor"
        style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}
      >
        전체 모니터 →
      </a>
      <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--muted)' }}>
        이번 주 이상 처리:{' '}
        <span className="num" style={{ color: 'var(--ink)', fontWeight: 700 }}>
          3
        </span>
        건
      </span>
    </section>
  );
}
