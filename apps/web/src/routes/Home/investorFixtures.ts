// apps/web/src/routes/Home/investorFixtures.ts
export interface Holding {
  readonly buildingId: string;
  readonly buildingName: string;
  readonly stakePct: number;
  readonly monthlyKrw: number;
  readonly cumulativeKrw: number;
}

export interface YieldPoint {
  readonly month: string;
  readonly yieldKrw: number;
}

export interface SettlementEvent {
  readonly date: string;
  readonly amountKrw: number;
  readonly txId: string;
  readonly blockHeight: number;
}

export const investorAum = {
  cumulativeKrw: 2_400_000,
  expectedYieldPct: 5.2,
  nextSettlementDate: '2026-05-15',
};

export const investorHoldings: ReadonlyArray<Holding> = [
  { buildingId: 'ULJN-001', buildingName: '울진 1단지 옥상',  stakePct: 0.42, monthlyKrw: 18_240, cumulativeKrw: 218_880 },
  { buildingId: 'ULJN-007', buildingName: '울진 7단지 옥상',  stakePct: 0.38, monthlyKrw: 16_412, cumulativeKrw: 196_944 },
  { buildingId: 'ULJN-014', buildingName: '울진 14단지 옥상', stakePct: 0.21, monthlyKrw: 9_080,  cumulativeKrw: 108_960 },
];

export const investorYield: ReadonlyArray<YieldPoint> = [
  { month: '2025-06', yieldKrw: 38_410 },
  { month: '2025-07', yieldKrw: 40_120 },
  { month: '2025-08', yieldKrw: 41_580 },
  { month: '2025-09', yieldKrw: 43_220 },
  { month: '2025-10', yieldKrw: 39_700 },
  { month: '2025-11', yieldKrw: 42_840 },
  { month: '2025-12', yieldKrw: 44_320 },
  { month: '2026-01', yieldKrw: 41_960 },
  { month: '2026-02', yieldKrw: 43_810 },
  { month: '2026-03', yieldKrw: 45_120 },
  { month: '2026-04', yieldKrw: 43_732 },
];

export const investorSettlements: ReadonlyArray<SettlementEvent> = [
  { date: '2026-04-30', amountKrw: 43_732, txId: '0x7f3ea92c', blockHeight: 184729 },
  { date: '2026-03-31', amountKrw: 45_120, txId: '0x9b21f04d', blockHeight: 184610 },
  { date: '2026-02-29', amountKrw: 43_810, txId: '0x2c8a1e7b', blockHeight: 184491 },
  { date: '2026-01-31', amountKrw: 41_960, txId: '0x4d5fb903', blockHeight: 184372 },
  { date: '2025-12-31', amountKrw: 44_320, txId: '0x8e3c20a1', blockHeight: 184253 },
  { date: '2025-11-30', amountKrw: 42_840, txId: '0x1a6f5e88', blockHeight: 184134 },
  { date: '2025-10-31', amountKrw: 39_700, txId: '0x6b9d2c47', blockHeight: 184015 },
  { date: '2025-09-30', amountKrw: 43_220, txId: '0xa4c81bf2', blockHeight: 183896 },
];
