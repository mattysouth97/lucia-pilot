// apps/web/src/routes/Invest/data.ts
// Typed numeric / structural fixtures for /invest. v1 is fixture-only;
// Phase-2 swaps these import call sites for engine-backed TanStack Query hooks.

import { BUILDINGS, TX_STREAM } from '@lucia/contracts/fixtures';
import type { TxStreamMessage } from '@lucia/contracts';

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

// Station cards — first 8 from @lucia/contracts BUILDINGS, filtered to public-fixture status set
// (only 'ok' or 'maintenance' may appear publicly per spec §6.6). Rich operational data is mocked
// at landing-page level (dailyKwh, cumulativeKrw) since the contracts fixture omits these.
const STATION_OPERATIONAL = new Map<string, { dailyKwh: number; cumulativeKrw: number; status: 'ok' | 'maintenance' }>([
  ['ULJN-001', { dailyKwh: 124.6, cumulativeKrw: 4_812_400, status: 'ok' }],
  ['ULJN-002', { dailyKwh: 122.1, cumulativeKrw: 4_768_900, status: 'ok' }],
  ['ULJN-007', { dailyKwh: 119.8, cumulativeKrw: 4_701_200, status: 'ok' }],
  ['ULJN-014', { dailyKwh: 0,     cumulativeKrw: 4_690_300, status: 'maintenance' }],
  ['ULJN-023', { dailyKwh: 125.2, cumulativeKrw: 4_854_100, status: 'ok' }],
  ['ULJN-031', { dailyKwh: 121.4, cumulativeKrw: 4_792_600, status: 'ok' }],
  ['ULJN-073', { dailyKwh: 123.7, cumulativeKrw: 4_823_400, status: 'ok' }],
  ['ULJN-089', { dailyKwh: 120.5, cumulativeKrw: 4_745_800, status: 'ok' }],
]);

export const stationCards: ReadonlyArray<StationCard> = BUILDINGS
  .filter(b => STATION_OPERATIONAL.has(b.building_id))
  .map(b => {
    const op = STATION_OPERATIONAL.get(b.building_id)!;
    return {
      buildingId: b.building_id,
      buildingName: `${b.city} ${b.district} ${b.building_id.split('-')[1] ?? ''}동`,
      installedKw: b.installed_kw,
      status: op.status,
      dailyKwh: op.dailyKwh,
      cumulativeKrw: op.cumulativeKrw,
    };
  });

// Ledger snapshot — 8-row fallback when WebSocket disconnected. Reuses TX_STREAM from
// @lucia/contracts; entry [4] in TX_STREAM is the tamper rejection (status !== 'confirmed'),
// which we intentionally exclude from the public landing-page fallback.
export const ledgerSnapshot: LedgerSnapshot = {
  txs: TX_STREAM.filter(tx => tx.status === 'confirmed').slice(0, 8),
  capturedAt: '2026-04-30 13:24',
};
