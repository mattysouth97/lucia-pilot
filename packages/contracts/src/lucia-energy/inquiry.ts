// packages/contracts/src/lucia-energy/inquiry.ts
// FR-LE-INQ — LuciaEnergy public inquiry form schema.
// Additive-only per Coherence Guard 2.

import { z } from 'zod';

export const PersonaEnum = z.enum([
  'generator',
  'asset_manager',
  'resident',
  'broker',
  'public_procurer',
  'corporate_re100',
  'other',
]);
export type Persona = z.infer<typeof PersonaEnum>;

export const InterestEnum = z.enum([
  'rec_purchase',
  'ppa',
  'operations_outsource',
  'asset_sale',
  'haetbit_pension',
  'public_procurement',
  'multi_asset',
  'other',
]);
export type Interest = z.infer<typeof InterestEnum>;

export const LuciaEnergyInquirySchema = z.object({
  company: z.string().min(1).max(200),
  contact_name: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(8).max(40),
  persona: PersonaEnum,
  interests: z.array(InterestEnum).min(1),
  message: z.string().max(2000).optional(),
  consent_pii: z.literal(true),
  source_url: z.string().url().optional(),
});

export type LuciaEnergyInquiry = z.infer<typeof LuciaEnergyInquirySchema>;
