import { z } from 'zod';

// FRD §11.1 — 정산 결과
// FR-S-002~006: SMP, REC, 가상공유거래 분배, SaaS, 거래수수료 — 9 cash flows
export const SettlementCashFlow = z.object({
  smp_revenue: z.number(),
  rec_amount: z.number(),
  rec_value: z.number(),
  ppa_revenue: z.number().default(0), // FR-S-010 Should-Have, default 0 in Pilot
  kets_credit: z.number().default(0), // FR-S-011 Should-Have
  housing_subsidy_lh: z.number(),
  housing_subsidy_kookmin: z.number(),
  housing_subsidy_energy: z.number(),
  saas_fee_lucia: z.number().default(0),
  saas_fee_kie_rems: z.number().default(0),
  txn_fee: z.number().default(0),
  spc_net: z.number(),
});
export type SettlementCashFlow = z.infer<typeof SettlementCashFlow>;

export const Settlement = z.object({
  settlement_id: z.string().uuid(),
  event_id: z.string().uuid(),
  building_id: z.string().regex(/^ULJN-\d{3}$/),
  ts: z.string().datetime(),
  kwh: z.number().nonnegative(),
  cash_flow: SettlementCashFlow,
  payload_hash: z.string().regex(/^[0-9a-f]{64}$/),
  prev_hash: z.string().regex(/^[0-9a-f]{64}$/).nullable(),
  tx_id: z.string().nullable(), // null until chain-recorded
  block_height: z.number().int().nonnegative().nullable(),
});
export type Settlement = z.infer<typeof Settlement>;
