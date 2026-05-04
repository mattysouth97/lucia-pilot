// apps/web/tests/routes/Invest/LiveLedgerRibbon.test.tsx
import { describe, expect, it } from 'vitest';

import { ledgerSnapshot } from '@/routes/Invest/data';
import { deriveRibbonState } from '@/routes/Invest/sections/LiveLedgerRibbon';

describe('LiveLedgerRibbon — deriveRibbonState', () => {
  it('returns live state when connected with txs', () => {
    const fakeTxs = ledgerSnapshot.txs.slice(0, 3);
    const result = deriveRibbonState({ status: 'connected', txs: fakeTxs });
    expect(result.kind).toBe('live');
    expect(result.txs.length).toBe(3);
  });

  it('falls back to snapshot when connecting (no live txs yet)', () => {
    const result = deriveRibbonState({ status: 'connecting', txs: [] });
    expect(result.kind).toBe('connecting');
    expect(result.txs).toEqual(ledgerSnapshot.txs);
  });

  it('falls back to snapshot when disconnected', () => {
    const result = deriveRibbonState({ status: 'disconnected', txs: [] });
    expect(result.kind).toBe('snapshot');
    if (result.kind === 'snapshot') expect(result.capturedAt).toBe(ledgerSnapshot.capturedAt);
  });
});
