import { describe, it } from 'vitest';
import { Building } from '../../domain/building.js';
import { Settlement } from '../../domain/settlement.js';
import { TxStreamMessage } from '../../domain/tx-stream-message.js';
import { BUILDINGS } from '../buildings.js';
import { SETTLEMENTS } from '../settlements.js';
import { TX_STREAM } from '../tx-stream.js';

describe('fixture validates against schema: Building', () => {
  it('fixture validates against schema: all BUILDINGS parse without error', () => {
    for (const b of BUILDINGS) {
      Building.parse(b);
    }
  });

  it('fixture validates against schema: BUILDINGS count is 12', ({ expect }) => {
    expect(BUILDINGS).toHaveLength(12);
  });

  it('fixture validates against schema: ULJN-042 has status alert', ({ expect }) => {
    const b = BUILDINGS.find((x) => x.building_id === 'ULJN-042');
    expect(b?.status).toBe('alert');
  });

  it('fixture validates against schema: ULJN-058 has status warn', ({ expect }) => {
    const b = BUILDINGS.find((x) => x.building_id === 'ULJN-058');
    expect(b?.status).toBe('warn');
  });
});

describe('fixture validates against schema: Settlement', () => {
  it('fixture validates against schema: all SETTLEMENTS parse without error', () => {
    for (const s of SETTLEMENTS) {
      Settlement.parse(s);
    }
  });

  it('fixture validates against schema: SETTLEMENTS count is 5', ({ expect }) => {
    expect(SETTLEMENTS).toHaveLength(5);
  });

  it('fixture validates against schema: first settlement prev_hash is zero hash', ({ expect }) => {
    const first = SETTLEMENTS[0];
    expect(first?.prev_hash).toBe('0000000000000000000000000000000000000000000000000000000000000000');
  });

  it('fixture validates against schema: settlements form a hash chain', ({ expect }) => {
    for (let i = 1; i < SETTLEMENTS.length; i++) {
      expect(SETTLEMENTS[i]?.prev_hash).toBe(SETTLEMENTS[i - 1]?.payload_hash);
    }
  });
});

describe('fixture validates against schema: TxStreamMessage', () => {
  it('fixture validates against schema: all TX_STREAM entries parse without error', () => {
    for (const tx of TX_STREAM) {
      TxStreamMessage.parse(tx);
    }
  });

  it('fixture validates against schema: TX_STREAM count is 8', ({ expect }) => {
    expect(TX_STREAM).toHaveLength(8);
  });

  it('fixture validates against schema: tamper entry is rejected with null block', ({ expect }) => {
    const tamper = TX_STREAM.find((tx) => tx.type === 'tamper');
    expect(tamper?.status).toBe('rejected');
    expect(tamper?.block_height).toBeNull();
    expect(tamper?.tx_id).toBeNull();
    expect(tamper?.building_id).toBe('ADMIN');
  });

  it('fixture validates against schema: all non-tamper entries are confirmed', ({ expect }) => {
    const nonTamper = TX_STREAM.filter((tx) => tx.type !== 'tamper');
    for (const tx of nonTamper) {
      expect(tx.status).toBe('confirmed');
    }
  });
});
