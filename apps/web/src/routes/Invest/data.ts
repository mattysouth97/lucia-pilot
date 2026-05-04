// apps/web/src/routes/Invest/data.ts
// Typed numeric / structural fixtures for /invest. v1 is fixture-only;
// Phase-2 swaps these import call sites for engine-backed TanStack Query hooks.

import type { TxStreamMessage } from '@lucia/contracts';
import { TX_STREAM } from '@lucia/contracts/fixtures';

export interface AumStat {
  readonly label: string;
  readonly value: number;
  readonly format: 'krw' | 'pct' | 'count';
  readonly unit?: string;
  readonly helper?: string;
}

export interface ImpactSplit {
  readonly reservationPct: number;
  readonly groups: ReadonlyArray<{
    readonly code: 'lh' | 'gukmin' | 'sowoe';
    readonly label: string;
    readonly pct: number;
  }>;
  readonly highlightCode: 'sowoe';
}

export interface StationCard {
  readonly buildingId: string;
  readonly buildingName: string;
  readonly installedKw: number;
  readonly status: 'ok' | 'maintenance';
  readonly dailyKwh: number;
  readonly cumulativeKrw: number;
}

export interface LedgerSnapshot {
  readonly txs: ReadonlyArray<TxStreamMessage>;
  readonly capturedAt: string;
}

// AUM trio — values derived from FRD §11.3 seed targets in untitled/project/src/data.jsx,
// copied as plain literals; Phase-2 will replace with engine-wired values.
export const aumStats: ReadonlyArray<AumStat> = [
  { label: '누적 투자금', value: 18_420_000_000, format: 'krw', helper: '↑ 12.4% MoM' },
  { label: '평균 연 수익률', value: 5.2, format: 'pct', unit: '%', helper: '지난 12개월 실현' },
  { label: '운영 발전소', value: 116, format: 'count', unit: '동', helper: '9,354동까지 확장 가능한 구조' },
];

// 41% / 64.2 / 10.9 / 35.8 — verbatim labels from untitled/project/src/data.jsx lines 106–108
// and apps/web/src/routes/ResidentPortal.tsx. Sub-ratios refer to scoped cohorts, not flat shares.
export const impactSplit: ImpactSplit = {
  reservationPct: 41,
  groups: [
    { code: 'lh', label: 'LH 매입임대', pct: 64.2 },
    { code: 'gukmin', label: '국민임대', pct: 10.9 },
    { code: 'sowoe', label: '에너지소외', pct: 35.8 },
  ],
  highlightCode: 'sowoe',
};

// Station cards — manually projected from contracts BUILDINGS to a public-safe shape.
// Tree-shaking does not remove sibling object fields, so importing BUILDINGS directly
// would leak internal data (address, lat, lng, region_office, inverter_count) into the
// public bundle. We pre-project here so only the 4 public fields are referenced.
//
// Source IDs intersect BUILDINGS fixture with public-fixture status constraint
// (only 'ok' or 'maintenance' may appear publicly per spec §6.6).
export const stationCards: ReadonlyArray<StationCard> = [
  { buildingId: 'ULJN-001', buildingName: '울진 울진읍 001동', installedKw: 25.86, status: 'ok',          dailyKwh: 124.6, cumulativeKrw: 4_812_400 },
  { buildingId: 'ULJN-002', buildingName: '울진 울진읍 002동', installedKw: 25.86, status: 'ok',          dailyKwh: 122.1, cumulativeKrw: 4_768_900 },
  { buildingId: 'ULJN-007', buildingName: '울진 울진읍 007동', installedKw: 25.86, status: 'ok',          dailyKwh: 119.8, cumulativeKrw: 4_701_200 },
  { buildingId: 'ULJN-014', buildingName: '울진 울진읍 014동', installedKw: 25.86, status: 'maintenance', dailyKwh: 0,     cumulativeKrw: 4_690_300 },
  { buildingId: 'ULJN-023', buildingName: '울진 울진읍 023동', installedKw: 25.86, status: 'ok',          dailyKwh: 125.2, cumulativeKrw: 4_854_100 },
  { buildingId: 'ULJN-031', buildingName: '울진 울진읍 031동', installedKw: 25.86, status: 'ok',          dailyKwh: 121.4, cumulativeKrw: 4_792_600 },
  { buildingId: 'ULJN-073', buildingName: '울진 울진읍 073동', installedKw: 25.86, status: 'ok',          dailyKwh: 123.7, cumulativeKrw: 4_823_400 },
  { buildingId: 'ULJN-089', buildingName: '울진 울진읍 089동', installedKw: 25.86, status: 'ok',          dailyKwh: 120.5, cumulativeKrw: 4_745_800 },
];

// Ledger snapshot — 8-row fallback when WebSocket disconnected. Reuses TX_STREAM from
// @lucia/contracts; entry [4] in TX_STREAM is the tamper rejection (status !== 'confirmed'),
// which we intentionally exclude from the public landing-page fallback.
export const ledgerSnapshot: LedgerSnapshot = {
  txs: TX_STREAM.filter(tx => tx.status === 'confirmed').slice(0, 8),
  capturedAt: '2026-04-30 13:24',
};
