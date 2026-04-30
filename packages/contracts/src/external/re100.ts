import { z } from 'zod';

// FR-X-004 — RE100 ESG Mock
// Four contracted RE100 buyers per FRD prototype data.
export const Re100Company = z.enum(['SK하이닉스', '삼성전자', '네이버', '기아']);
export type Re100Company = z.infer<typeof Re100Company>;

export const Re100Input = z.object({
  company: Re100Company,
  kwh: z.number().positive(),
  amount_won: z.number().positive(),
  /** Existing certificate to append to; omit to issue a new one. */
  certificate_id: z.string().optional(),
});
export type Re100Input = z.infer<typeof Re100Input>;

export const Re100Certificate = z.object({
  id: z.string(),
  kwh: z.number().positive(),
  valid_until: z.string().date(), // YYYY-MM-DD
});
export type Re100Certificate = z.infer<typeof Re100Certificate>;

export const Re100Output = z.object({
  status: z.enum(['accepted', 'rejected']),
  esg_report_id: z.string(),
  certificate: Re100Certificate,
});
export type Re100Output = z.infer<typeof Re100Output>;
