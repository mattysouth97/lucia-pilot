// apps/web/src/routes/Home/IntegrityTimelineCard.tsx
//
// FR-S-007 — 30-day audit-integrity timeline. Replaces IncomeChartCard on
// AnalystHome's right rail. Horizontal strip with verifications as background
// height, rejection-tamper events as rose marks, unsettled as amber marks.

import type { IntegrityTimelinePoint } from './analystFixtures';

export interface IntegrityTimelineCardProps {
  readonly data: ReadonlyArray<IntegrityTimelinePoint>;
}

export function IntegrityTimelineCard({ data }: IntegrityTimelineCardProps) {
  const maxVerify = Math.max(...data.map((d) => d.verifications), 1);
  const totalRejections = data.reduce((acc, d) => acc + d.rejected_tamper, 0);
  const totalUnsettled = data.reduce((acc, d) => acc + d.unsettled, 0);

  return (
    <aside className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div className="overline" style={{ marginBottom: 4 }}>지난 30일</div>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, letterSpacing: '-0.015em' }}>
            감사 무결성 타임라인
          </h3>
        </div>
      </header>

      <ul
        role="list"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
          gap: 2,
          listStyle: 'none',
          padding: 0,
          margin: 0,
          height: 56,
          alignItems: 'end',
        }}
      >
        {data.map((d) => {
          const heightPct = (d.verifications / maxVerify) * 100;
          const isRejection = d.rejected_tamper > 0;
          const isUnsettled = d.unsettled > 0;
          const ariaLabel = isRejection
            ? `${d.date} · 변조 시도 ${d.rejected_tamper}건 거부`
            : isUnsettled
              ? `${d.date} · 미정산 ${d.unsettled}건`
              : `${d.date} · 검증 ${d.verifications}건`;
          return (
            <li
              key={d.date}
              role="listitem"
              aria-label={ariaLabel}
              style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <span
                style={{
                  width: '100%',
                  height: `${heightPct}%`,
                  background: 'var(--line)',
                  borderRadius: 1,
                }}
              />
              {isRejection && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--rose-fg, #BE123C)',
                    borderRadius: 1,
                    opacity: 0.95,
                  }}
                />
              )}
              {isUnsettled && !isRejection && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--amber-fg, #B45309)',
                    borderRadius: 1,
                    opacity: 0.85,
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>

      <footer style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted-2)' }}>
        <span>변조 시도 거부 <span className="num" style={{ color: totalRejections > 0 ? 'var(--rose-fg, #BE123C)' : 'var(--ink-2, var(--ink))' }}>{totalRejections}</span>건</span>
        <span>미정산 <span className="num" style={{ color: totalUnsettled > 0 ? 'var(--amber-fg, #B45309)' : 'var(--ink-2, var(--ink))' }}>{totalUnsettled}</span>건</span>
      </footer>
    </aside>
  );
}
