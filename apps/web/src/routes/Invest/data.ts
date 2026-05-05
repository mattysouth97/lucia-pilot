// apps/web/src/routes/Invest/data.ts
// Typed numeric / structural fixtures for /invest. v1 is fixture-only;
// Phase-2 swaps these import call sites for engine-backed TanStack Query hooks.

export interface AumStat {
  readonly label: string;
  readonly value: number;
  readonly format: 'krw' | 'pct' | 'count';
  readonly unit?: string;
  readonly helper?: string;
}

// AUM trio — values derived from FRD §11.3 seed targets in untitled/project/src/data.jsx,
// copied as plain literals; Phase-2 will replace with engine-wired values.
export const aumStats: ReadonlyArray<AumStat> = [
  { label: '누적 투자금', value: 18_420_000_000, format: 'krw', helper: '↑ 12.4% MoM' },
  { label: '평균 연 수익률', value: 5.2, format: 'pct', unit: '%', helper: '지난 12개월 실현' },
  { label: '운영 발전소', value: 116, format: 'count', unit: '동', helper: '9,354동까지 확장 가능한 구조' },
];

export interface YieldMonth {
  readonly month: string;       // 'YY.MM' display
  readonly distributionKrw: number;
  readonly onTime: boolean;
  readonly latest?: boolean;
}

// 12-month distribution history — slight upward trend tracking the operating fleet
// growing from ~98 to 116 buildings. All months on-time per FRD §11 SLAs.
export const yieldHistory: ReadonlyArray<YieldMonth> = [
  { month: '25.05', distributionKrw: 28_140_000, onTime: true },
  { month: '25.06', distributionKrw: 28_920_000, onTime: true },
  { month: '25.07', distributionKrw: 30_410_000, onTime: true },
  { month: '25.08', distributionKrw: 31_240_000, onTime: true },
  { month: '25.09', distributionKrw: 30_660_000, onTime: true },
  { month: '25.10', distributionKrw: 30_180_000, onTime: true },
  { month: '25.11', distributionKrw: 29_540_000, onTime: true },
  { month: '25.12', distributionKrw: 29_120_000, onTime: true },
  { month: '26.01', distributionKrw: 30_300_000, onTime: true },
  { month: '26.02', distributionKrw: 31_080_000, onTime: true },
  { month: '26.03', distributionKrw: 31_960_000, onTime: true },
  { month: '26.04', distributionKrw: 32_356_400, onTime: true, latest: true },
];
