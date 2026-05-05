import { describe, expect, it } from 'vitest';

import { sha256Hex } from '../../../src/lib/loi/sha256.js';

describe('sha256Hex', () => {
  it('hashes the empty string to the canonical SHA-256 of "" ', async () => {
    const h = await sha256Hex('');
    expect(h).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('hashes "abc" to the NIST FIPS 180-4 sample digest', async () => {
    const h = await sha256Hex('abc');
    expect(h).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('produces 64 lowercase hex chars', async () => {
    const h = await sha256Hex('루시아 정산 플랫폼 v1.3');
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it('hashes Uint8Array equivalently to its UTF-8 string', async () => {
    const a = await sha256Hex('한국어 텍스트');
    const b = await sha256Hex(new TextEncoder().encode('한국어 텍스트'));
    expect(a).toBe(b);
  });

  // NOTE: Blob path is intentionally not unit-tested under jsdom — jsdom's
  // Blob implementation differs from browser behaviour (arrayBuffer / text
  // can return wrong bytes). The runtime code at sha256.ts handles Blob
  // correctly in real browsers + Node 20 globalThis.Blob. Coverage is via
  // the FR-R-005 generator integration tests in Slice 2.
});
