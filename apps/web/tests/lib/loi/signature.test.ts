// FR-R-005 §3 — SMS-signature state machine tests.
// Uses an injectable scheduleAfter so we don't depend on real timers.

import { describe, expect, it, vi } from 'vitest';

import { createSignatureMachine, VERIFY_DELAY_MS } from '../../../src/lib/loi/signature.js';

describe('createSignatureMachine — basic state transitions', () => {
  it('starts in idle', () => {
    const m = createSignatureMachine();
    expect(m.state.phase).toBe('idle');
  });

  it('rejects invalid phone format with an error state', () => {
    const m = createSignatureMachine();
    m.sendCode('1234');
    expect(m.state.phase).toBe('error');
    if (m.state.phase === 'error') {
      expect(m.state.message).toMatch(/전화번호/);
    }
  });

  it('moves to awaiting_code on a valid Korean phone', () => {
    const m = createSignatureMachine();
    m.sendCode('010-1234-5678');
    expect(m.state.phase).toBe('awaiting_code');
    if (m.state.phase === 'awaiting_code') {
      expect(m.state.phone).toBe('010-1234-5678');
      expect(m.state.codeSentAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    }
  });

  it('rejects non-6-digit codes', async () => {
    const m = createSignatureMachine();
    m.sendCode('010-1234-5678');
    await m.verifyCode('abc');
    expect(m.state.phase).toBe('error');
  });

  it('rejects verifyCode while in idle (no awaiting_code)', async () => {
    const m = createSignatureMachine();
    await m.verifyCode('123456');
    expect(m.state.phase).toBe('error');
  });
});

describe('createSignatureMachine — verify pipeline', () => {
  it('transitions through verifying → verified after VERIFY_DELAY_MS', async () => {
    let cb: (() => void) | null = null;
    const m = createSignatureMachine({
      now: () => '2026-05-05T00:00:00.000Z',
      scheduleAfter: (ms, fn) => {
        expect(ms).toBe(VERIFY_DELAY_MS);
        cb = fn;
        return () => undefined;
      },
    });
    m.sendCode('010-1234-5678');
    const verifyPromise = m.verifyCode('123456');
    expect(m.state.phase).toBe('verifying');
    cb?.();
    await verifyPromise;
    expect(m.state.phase).toBe('verified');
    if (m.state.phase === 'verified') {
      expect(m.state.phone).toBe('010-1234-5678');
      expect(m.state.verifiedAt).toBe('2026-05-05T00:00:00.000Z');
    }
  });

  it('reset() clears state back to idle and cancels pending timer', async () => {
    const cancel = vi.fn();
    const m = createSignatureMachine({
      scheduleAfter: () => cancel,
    });
    m.sendCode('010-1234-5678');
    void m.verifyCode('123456'); // intentionally not awaited
    expect(m.state.phase).toBe('verifying');
    m.reset();
    expect(m.state.phase).toBe('idle');
    expect(cancel).toHaveBeenCalled();
  });
});

describe('createSignatureMachine — subscribe()', () => {
  it('notifies subscribers on initial subscribe + every state change', () => {
    const states: string[] = [];
    const m = createSignatureMachine({ scheduleAfter: () => () => undefined });
    const unsub = m.subscribe((s) => states.push(s.phase));
    m.sendCode('010-1234-5678');
    void m.verifyCode('123456');
    unsub();
    expect(states).toEqual(['idle', 'awaiting_code', 'verifying']);
  });

  it('unsubscribe() stops further notifications', () => {
    const states: string[] = [];
    const m = createSignatureMachine();
    const unsub = m.subscribe((s) => states.push(s.phase));
    expect(states).toEqual(['idle']);
    unsub();
    m.sendCode('010-1234-5678');
    expect(states).toEqual(['idle']); // no growth
  });
});

describe('createSignatureMachine — accepted Korean phone formats', () => {
  it('accepts mobile (010-) and landline (02-) formats', () => {
    const m = createSignatureMachine();
    m.sendCode('010-1234-5678');
    expect(m.state.phase).toBe('awaiting_code');
    m.reset();
    m.sendCode('02-3459-8000');
    expect(m.state.phase).toBe('awaiting_code');
  });
});
