// FR-R-005 §4 — Mock blockchain hash registration (FR-S-007 endpoint).
//
// Real flow (Phase 2): POST /api/chain/loi-hash → Hyperledger Fabric tx_id.
// Pilot v1.3: hash is computed by generateLOI() and persisted to localStorage
// alongside the signed_at timestamp + status='submitted'. The "registration"
// is a no-op log + LOI store update.

/* eslint-disable no-console */

import type { LOI } from '@lucia/contracts/domain';

import { generateLOI, type LOIGenerateOutput } from './generator.js';
import { transitionLOI, upsertLOI } from './store.js';
import type { LOIDocumentInput } from './templates/types.js';

export interface RegistrationResult {
  /** The LOI after hash + signed_at + status='submitted' have been written. */
  readonly loi: LOI;
  /** The full generator output (html / blob / hash). UI uses html for preview. */
  readonly document: LOIGenerateOutput;
  /** Mock chain tx id — what FR-S-007 would return after Endorse + Commit. */
  readonly mockTxId: string;
}

/**
 * Generate the LOI document, hash it, register the hash to the (mock) chain,
 * and persist the resulting LOI back to the store with status='submitted'.
 *
 * Caller must have run the FR-R-005 §3 signature flow first; pass the
 * verified `signed_at` timestamp returned by the signature machine.
 *
 * Idempotent in shape: re-running on the same draft transitions to
 * 'submitted' once. After 'submitted' the LOI is immutable from this entry
 * point — operator console at /admin/loi handles further transitions.
 */
export async function registerSignedLOI(args: {
  input: LOIDocumentInput;
  signedAt: string;
}): Promise<RegistrationResult> {
  const { input, signedAt } = args;
  const document = await generateLOI({ ...input, issuedAt: signedAt });

  // Mock chain endpoint — log the would-be POST body for traceability.
  const mockTxId = `mock-tx-${input.loi.id}-${Date.now().toString(36)}`;
  console.info(
    '[FR-S-007 mock] LOI hash registered',
    { loi_id: input.loi.id, hash: document.hash, signed_at: signedAt, mock_tx_id: mockTxId },
  );

  // Persist hash + signed_at on the draft LOI BEFORE transitioning to
  // submitted (transitionLOI does not mutate other fields).
  const draft: LOI = {
    ...input.loi,
    pdf_url: input.loi.pdf_url, // preserved if already set
    blockchain_hash: document.hash,
    signed_at: signedAt,
  };
  upsertLOI(draft);

  // If the LOI is in 'draft' move it to 'submitted'. If it's already in some
  // other state (e.g. operator pre-marked it), skip the transition gracefully.
  let final: LOI;
  if (draft.status === 'draft') {
    final = transitionLOI(draft.id, 'submitted');
  } else {
    final = draft;
  }

  return { loi: final, document, mockTxId };
}
