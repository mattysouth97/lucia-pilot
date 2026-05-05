// FR-R-005 — LOI module barrel.
// Signature + admin-console pieces land in Slice 3.

export { sha256Hex } from './sha256.js';
export {
  __resetLOIStoreForTests,
  getLOI,
  listLOIs,
  listLOIsByInvestor,
  transitionLOI,
  upsertLOI,
} from './store.js';
export { generateLOI, type LOIGenerateOutput } from './generator.js';
export type { LOIDocumentInput } from './templates/types.js';
export { formatKRW, formatDateKR } from './templates/types.js';
export {
  createSignatureMachine,
  type SignatureMachine,
  type SignatureState,
  VERIFY_DELAY_MS,
} from './signature.js';
export { registerSignedLOI, type RegistrationResult } from './blockchain-hash.js';
