// FR-R-005 §3 — Mock SMS signature flow for LOI submission.
//
// Real flow (Phase 2): 카카오 인증서 / 공동인증서 / SMS OTP.
// Pilot v1.3: phone-input → "send code" (no-op) → 6-digit input → 5s wait
// → "success" (always succeeds in Pilot Mock). The state-machine here is
// what the React UI subscribes to.
//
// Designed for jsdom-friendly tests: time advances via injectable `now()`
// + `setTimeout` is the only side effect (vi.useFakeTimers can drive it).

export type SignatureState =
  | { phase: 'idle' }
  | { phase: 'awaiting_code'; phone: string; codeSentAt: string }
  | { phase: 'verifying'; phone: string; submittedCode: string; verifyingSince: string }
  | { phase: 'verified'; phone: string; verifiedAt: string }
  | { phase: 'error'; message: string };

export interface SignatureMachine {
  /** Snapshot of the current state (read-only). */
  state: SignatureState;
  /** Submit phone, transition to awaiting_code. Caller validates phone format upstream. */
  sendCode: (phone: string) => void;
  /** Submit the 6-digit code; transitions to verifying then verified after VERIFY_DELAY_MS. */
  verifyCode: (code: string) => Promise<void>;
  /** Reset to idle. */
  reset: () => void;
  /** Subscribe to state changes; returns an unsubscribe fn. */
  subscribe: (listener: (s: SignatureState) => void) => () => void;
}

const KOREAN_PHONE = /^(\+82|0)\d{1,3}-?\d{3,4}-?\d{4}$/;
const SIX_DIGIT = /^\d{6}$/;

/** Verification delay in milliseconds. Mock — real OTP would be near-instant. */
export const VERIFY_DELAY_MS = 5_000;

export interface SignatureMachineOptions {
  /** Override for testability. Defaults to () => new Date().toISOString(). */
  now?: () => string;
  /** Override for testability. Defaults to globalThis.setTimeout. */
  scheduleAfter?: (ms: number, cb: () => void) => () => void;
}

/**
 * Construct an FR-R-005 §3 SMS-signature state machine. Pure logic; UI binds
 * via `subscribe()`.
 */
export function createSignatureMachine(opts: SignatureMachineOptions = {}): SignatureMachine {
  const now = opts.now ?? (() => new Date().toISOString());
  const scheduleAfter =
    opts.scheduleAfter ??
    ((ms, cb) => {
      const id = setTimeout(cb, ms);
      return () => clearTimeout(id);
    });

  let state: SignatureState = { phase: 'idle' };
  const listeners = new Set<(s: SignatureState) => void>();
  let cancelPending: (() => void) | null = null;

  function setState(next: SignatureState): void {
    state = next;
    for (const fn of listeners) fn(state);
  }

  function sendCode(phone: string): void {
    if (!KOREAN_PHONE.test(phone)) {
      setState({ phase: 'error', message: '잘못된 전화번호 형식입니다.' });
      return;
    }
    cancelPending?.();
    cancelPending = null;
    setState({ phase: 'awaiting_code', phone, codeSentAt: now() });
  }

  async function verifyCode(code: string): Promise<void> {
    if (state.phase !== 'awaiting_code') {
      setState({ phase: 'error', message: '인증 코드 입력 단계가 아닙니다.' });
      return;
    }
    if (!SIX_DIGIT.test(code)) {
      setState({ phase: 'error', message: '6자리 숫자 코드를 입력하세요.' });
      return;
    }
    const phone = state.phone;
    setState({ phase: 'verifying', phone, submittedCode: code, verifyingSince: now() });

    return new Promise<void>((resolve) => {
      cancelPending = scheduleAfter(VERIFY_DELAY_MS, () => {
        cancelPending = null;
        // Pilot Mock: any 6-digit code succeeds.
        setState({ phase: 'verified', phone, verifiedAt: now() });
        resolve();
      });
    });
  }

  function reset(): void {
    cancelPending?.();
    cancelPending = null;
    setState({ phase: 'idle' });
  }

  function subscribe(listener: (s: SignatureState) => void): () => void {
    listeners.add(listener);
    listener(state);
    return () => {
      listeners.delete(listener);
    };
  }

  return {
    get state() {
      return state;
    },
    sendCode,
    verifyCode,
    reset,
    subscribe,
  };
}
