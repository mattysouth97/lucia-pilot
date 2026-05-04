// apps/web/src/routes/Invest/sections/LiveLedgerRibbon.tsx
import {
  RIBBON_LINK, RIBBON_OVERLINE, RIBBON_STATUS_CONNECTING, RIBBON_STATUS_LIVE,
  RIBBON_STATUS_SNAPSHOT,
} from '../copy';
import { ledgerSnapshot } from '../data';

import { useLuciaStream } from '@/lib/useLuciaStream';

const FORMAT_WON = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

type SnapshotTx = typeof ledgerSnapshot.txs[number];

type RibbonState =
  | { kind: 'live'; txs: ReadonlyArray<SnapshotTx> }
  | { kind: 'connecting'; txs: ReadonlyArray<SnapshotTx> }
  | { kind: 'snapshot'; txs: ReadonlyArray<SnapshotTx>; capturedAt: string };

export function deriveRibbonState(stream: { status: string; txs: ReadonlyArray<SnapshotTx> }): RibbonState {
  if (stream.status === 'connected' && stream.txs.length >= 1) {
    return { kind: 'live', txs: stream.txs.slice(0, 8) };
  }
  if (stream.status === 'connecting') {
    return { kind: 'connecting', txs: ledgerSnapshot.txs };
  }
  return { kind: 'snapshot', txs: ledgerSnapshot.txs, capturedAt: ledgerSnapshot.capturedAt };
}

export function LiveLedgerRibbon() {
  // P0 hook returns void; we still call it for side-effects (future cache priming)
  // and synthesize the stream state until B7.3 lands the full WS shape.
  useLuciaStream();
  const state = deriveRibbonState({ status: 'disconnected', txs: [] });

  const pillBg = state.kind === 'live' ? 'var(--accent-soft)' : 'var(--chip)';
  const pillFg =
    state.kind === 'live' ? 'var(--accent-ink)' :
    state.kind === 'connecting' ? 'var(--muted)' : 'var(--muted-2)';
  const pillText =
    state.kind === 'live' ? `● ${RIBBON_STATUS_LIVE}` :
    state.kind === 'connecting' ? `● ${RIBBON_STATUS_CONNECTING}` :
    RIBBON_STATUS_SNAPSHOT(state.capturedAt);

  return (
    <section aria-labelledby="ribbon-heading" className="landing-section" style={{ background: 'var(--panel)' }}>
      <div className="landing-container">
        <p id="ribbon-heading" className="overline" style={{ marginBottom: 12 }}>{RIBBON_OVERLINE}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: pillBg, color: pillFg,
              fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 4,
            }}
          >
            {pillText}
          </span>
        </div>
        <div
          aria-live="polite"
          aria-relevant="additions"
          className="card"
          style={{ overflow: 'hidden' }}
        >
          {state.txs.map((tx, idx) => (
            <div
              key={tx.tx_id}
              className={state.kind === 'live' && idx === 0 ? 'flow-in' : ''}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(120px, 140px) minmax(120px, 1fr) minmax(80px, 100px) minmax(80px, 110px) 1fr',
                alignItems: 'center', gap: 12,
                padding: '12px 16px',
                borderTop: idx === 0 ? 'none' : '1px solid var(--line)',
                fontSize: 12.5,
              }}
            >
              <span className="num" style={{ color: 'var(--muted)' }}>{tx.tx_id}</span>
              <span style={{ color: 'var(--ink-2)' }}>{tx.building_id}</span>
              <span style={{ color: 'var(--muted)' }}>{tx.type}</span>
              <span className="num" style={{ color: 'var(--ink)', textAlign: 'right' }}>
                ₩{FORMAT_WON.format(tx.amount_won ?? 0)}
              </span>
              <span className="num" style={{ color: 'var(--accent-ink)', textAlign: 'right' }}>
                ✓ block-{tx.block_height}
              </span>
            </div>
          ))}
        </div>
        <a
          href="/"
          style={{ display: 'inline-block', marginTop: 14, fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}
        >
          → {RIBBON_LINK}
        </a>
      </div>
    </section>
  );
}
