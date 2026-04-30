import { z } from 'zod';

import { BeneficiaryCategory } from './beneficiary.js';

// FRD demo §13.1 Step 5 — 입주민 포털 (2~3 mock identities)
// FR-M-007: Mock auth via token in URL; PII masked per NFR-4.
export const Resident = z.object({
  resident_id: z.string(),
  beneficiary_id: z.string(),
  category: BeneficiaryCategory,
  building_id: z.string().regex(/^ULJN-\d{3}$/),
  masked_name: z.string(), // e.g., "홍*동" — NFR-4 PII masking
  mock_login_token: z.string(), // demo-only; replaced by real auth in Phase 2
});
export type Resident = z.infer<typeof Resident>;
