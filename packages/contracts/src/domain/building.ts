import { z } from 'zod';

// FRD §11.1 — 매입임대주택 동 (116개)
export const BuildingStatus = z.enum(['ok', 'warn', 'alert', 'maintenance']);
export type BuildingStatus = z.infer<typeof BuildingStatus>;

export const Building = z.object({
  building_id: z.string().regex(/^ULJN-\d{3}$/),
  region_office: z.string(),
  city: z.string(),
  district: z.string(),
  address: z.string(),
  lat: z.number().min(33).max(43),
  lng: z.number().min(124).max(132),
  installed_kw: z.number().positive(),
  inverter_count: z.number().int().positive(),
  install_date: z.string().date(),
  status: BuildingStatus,
});
export type Building = z.infer<typeof Building>;
