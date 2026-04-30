// P0 SKELETON — FR-M-008 WebSocket live tx stream hook.
// Full reconnect logic + exponential back-off lands wk7 (B7.3).
// Runtime: connects to ws://${apiHost}/ws/transactions, validates messages
// against TxStreamMessage (from @lucia/contracts), then invalidates
// TanStack Query cache so LiveTxStream card re-renders.

import { useEffect } from 'react';
import type { TxStreamMessage } from '@lucia/contracts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useLuciaStream(): void {
  useEffect(() => {
    // B7.3 — full WebSocket reconnect logic not yet implemented.
    console.warn('WebSocket not implemented in P0');

    // Stub: when implemented, open ws://${apiHost}/ws/transactions,
    // parse each message with TxStreamMessage.safeParse(), and call
    // queryClient.invalidateQueries({ queryKey: qk.txStream.recent() })
    // on every confirmed settle event.
    return () => {
      // cleanup stub
    };
  }, []);
}

// Type re-export so callers can type-narrow incoming messages.
export type { TxStreamMessage };
