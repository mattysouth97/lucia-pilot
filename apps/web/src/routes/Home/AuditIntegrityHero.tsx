// apps/web/src/routes/Home/AuditIntegrityHero.tsx
//
// FR-M-001 / FR-S-007 — analyst audit-integrity hero. Replaces today's
// AuditHeroStrip + HeroBand + BlockchainIntegrityStrip into a single
// full-bleed white block. σ3 semantics: 변조 시도 counter with
// "✓ 모두 거부" rejection framing.

import { Icons } from '@/components/Icons';

export type AuditHeroState = 'loading' | 'fresh' | 'stale' | 'disconnected' | 'unreachable';

export interface AuditHeroData {
  readonly tampering_attempts: number;
  readonly attempts_rejected: number;
  readonly block_height: number;
  readonly validators_active: number;
  readonly validators_total: number;
  readonly unsettled_count: number;
  readonly pending_anomalies: number;
  readonly last_verified_at: string;
  readonly stale_minutes?: number;
}

export interface AuditIntegrityHeroProps {
  readonly greeting: { readonly displayName: string; readonly honorific?: string };
  readonly period: string; // YYYY-MM
  readonly state: AuditHeroState;
  readonly data?: AuditHeroData;
  readonly onReportClick?: () => void;
  readonly onUnsettledClick?: () => void;
  readonly onPendingAnomaliesClick?: () => void;
}

export function AuditIntegrityHero(props: AuditIntegrityHeroProps) {
  if (props.state === 'unreachable') {
    return <UnreachableBlock />;
  }

  const { greeting, period, state, data, onReportClick, onUnsettledClick, onPendingAnomaliesClick } = props;
  const muted = state === 'stale' || state === 'disconnected';
  const isLoading = state === 'loading';

  const formattedPeriod = period.replace('-', '.');
  const honorificSuffix = greeting.honorific ? ` ${greeting.honorific}님` : '님';
  const greetingLine = `안녕하세요, ${greeting.displayName}${honorificSuffix}`;

  const numeral = isLoading ? '—' : String(data?.tampering_attempts ?? 0);
  const numeralColor = muted ? 'var(--muted)' : 'var(--ink)';

  return (
    <section
      aria-label="감사 무결성 요약"
      style={{
        padding: '32px 0 28px',
        borderBottom: '1px solid var(--line)',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 18 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', letterSpacing: '-0.005em' }}>
          {greetingLine}
        </span>
        <span className="overline" style={{ fontSize: 11, color: 'var(--muted-2)', letterSpacing: '0.08em' }}>
          {formattedPeriod} 감사 무결성 라운드
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
        <span
          aria-label="이번 달 변조 시도"
          className="num"
          style={{
            fontFamily: 'Geist Mono, ui-monospace, monospace',
            fontSize: 'clamp(72px, 9vw, 112px)',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontWeight: 700,
            color: numeralColor,
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 200ms ease-out',
          }}
        >
          {numeral}
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 500, color: muted ? 'var(--muted-2)' : 'var(--ink-2, var(--ink))', letterSpacing: '-0.005em' }}>
          변조 시도 — {isLoading ? '검증 중…' : '✓ 모두 거부'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginTop: 22,
          paddingTop: 14,
          borderTop: '1px dashed var(--line-soft, var(--line))',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', alignItems: 'center', fontSize: 12, color: muted ? 'var(--muted)' : 'var(--ink-2, var(--ink))' }}>
          <EvidenceStat label="블록" value={data ? data.block_height.toLocaleString() : '—'} mono />
          <Sep />
          <EvidenceStat label="검증 노드" value={data ? `${data.validators_active}/${data.validators_total}` : '—/—'} mono />
          <Sep />
          <EvidenceStat label="미정산" value={data ? `${data.unsettled_count}건` : '—건'} clickable={data && data.unsettled_count > 0 ? onUnsettledClick : undefined} />
          <Sep />
          <EvidenceStat label="처리 대기" value={data ? `${data.pending_anomalies}건` : '—건'} clickable={data && data.pending_anomalies > 0 ? onPendingAnomaliesClick : undefined} />
          <Sep />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <LiveDot state={state} />
            {state === 'disconnected' ? '연결 끊김 — ' : '마지막 검증 '}
            <span className="num" style={{ marginLeft: 4, fontFamily: 'Geist Mono, ui-monospace, monospace' }}>
              {data ? formatTimestamp(data.last_verified_at) : '—'}
            </span>
            {data?.stale_minutes && data.stale_minutes > 0 ? (
              <span style={{ marginLeft: 6, color: 'var(--muted-2)' }}>· {data.stale_minutes}분 전</span>
            ) : null}
          </span>
        </div>

        <button
          type="button"
          onClick={onReportClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--accent)',
            color: '#FFFFFF',
            padding: '10px 14px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '-0.005em',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 120ms ease-out',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-ink, #047857)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
        >
          <span style={{ display: 'inline-flex' }}>{Icons.Doc}</span>
          감사 보고서 →
        </button>
      </div>
    </section>
  );
}

function UnreachableBlock() {
  return (
    <section
      role="alert"
      aria-label="감사 엔진 연결 실패"
      style={{
        padding: '32px 24px',
        borderTop: '4px solid var(--rose-fg, #BE123C)',
        background: 'var(--rose-soft, #FFF1F2)',
        marginBottom: 24,
      }}
    >
      <div className="overline" style={{ color: 'var(--rose-fg, #BE123C)', marginBottom: 8 }}>
        감사 엔진 연결 실패
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
        표시된 데이터는 신뢰할 수 없습니다.
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-2, var(--ink))' }}>
        엔진이 응답할 때까지 감사 검증을 일시 중지합니다. 운영팀에 문의하거나 잠시 후 다시 시도해주세요.
      </div>
    </section>
  );
}

function EvidenceStat(props: {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
  readonly clickable?: () => void;
}) {
  const content = (
    <>
      <span style={{ color: 'var(--muted-2)' }}>{props.label}</span>
      <span
        className={props.mono ? 'num' : undefined}
        style={{
          marginLeft: 6,
          fontFamily: props.mono ? 'Geist Mono, ui-monospace, monospace' : 'inherit',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {props.value}
      </span>
    </>
  );
  if (props.clickable) {
    return (
      <button
        type="button"
        onClick={props.clickable}
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          padding: 0,
          margin: 0,
          background: 'none',
          border: 'none',
          color: 'var(--amber-fg, #B45309)',
          cursor: 'pointer',
          fontSize: 'inherit',
          letterSpacing: 'inherit',
        }}
      >
        {content}
      </button>
    );
  }
  return <span style={{ display: 'inline-flex', alignItems: 'baseline' }}>{content}</span>;
}

function Sep() {
  return <span style={{ color: 'var(--line)' }}>·</span>;
}

function LiveDot({ state }: { readonly state: AuditHeroState }) {
  const isLive = state === 'fresh' || state === 'stale';
  return (
    <span
      aria-hidden
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: isLive ? 'var(--accent)' : 'var(--muted-2)',
        display: 'inline-block',
        animation: isLive ? 'lucia-pulse 2s ease-out infinite' : undefined,
        boxShadow: isLive ? '0 0 0 3px rgba(16,185,129,0.18)' : undefined,
      }}
    />
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}
