// FR-R-002 — URL-state-synced filters for the catalog page.
//
// Reads/writes ?regions=A,B&minKw=N&maxKw=N&status=...&minYield=N&sort=...&page=N
// to/from the URL via useSearchParams. Page-load → restore state.

import type { DeploymentStatus, RegionOffice } from '@lucia/contracts/domain';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SortKey = 'yield_desc' | 'capacity_desc' | 'capacity_asc' | 'region_asc';

export interface ProjectFilterState {
  /** Empty = all 14 regions accepted. */
  regions: readonly RegionOffice[];
  minKw: number;
  maxKw: number;
  /** Empty = all statuses. */
  statuses: readonly DeploymentStatus[];
  minYieldPct: number;
  maxYieldPct: number;
  sort: SortKey;
  page: number;
}

export const DEFAULT_FILTERS: ProjectFilterState = {
  regions: [],
  minKw: 0,
  maxKw: 100,
  statuses: [],
  minYieldPct: 0,
  maxYieldPct: 15,
  sort: 'yield_desc',
  page: 1,
};

const ALL_REGIONS: readonly RegionOffice[] = [
  '서울', '인천', '경기남부', '경기북부', '부산울산', '강원',
  '충북', '대전충남', '전북', '광주전남', '경남', '제주', '세종', '대구경북',
];
const ALL_STATUSES: readonly DeploymentStatus[] = ['planned', 'construction', 'operating'];
const ALL_SORTS: readonly SortKey[] = ['yield_desc', 'capacity_desc', 'capacity_asc', 'region_asc'];

function parseRegions(raw: string | null): readonly RegionOffice[] {
  if (raw === null) return [];
  return raw.split(',').filter((r): r is RegionOffice => ALL_REGIONS.includes(r as RegionOffice));
}

function parseStatuses(raw: string | null): readonly DeploymentStatus[] {
  if (raw === null) return [];
  return raw.split(',').filter((s): s is DeploymentStatus => ALL_STATUSES.includes(s as DeploymentStatus));
}

function parseNumber(raw: string | null, fallback: number): number {
  if (raw === null) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

function parseSort(raw: string | null): SortKey {
  return ALL_SORTS.includes(raw as SortKey) ? (raw as SortKey) : DEFAULT_FILTERS.sort;
}

export function useProjectFilters(): {
  filters: ProjectFilterState;
  setFilter: <K extends keyof ProjectFilterState>(key: K, value: ProjectFilterState[K]) => void;
  resetFilters: () => void;
} {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<ProjectFilterState>(
    () => ({
      regions: parseRegions(params.get('regions')),
      minKw: parseNumber(params.get('minKw'), DEFAULT_FILTERS.minKw),
      maxKw: parseNumber(params.get('maxKw'), DEFAULT_FILTERS.maxKw),
      statuses: parseStatuses(params.get('status')),
      minYieldPct: parseNumber(params.get('minYield'), DEFAULT_FILTERS.minYieldPct),
      maxYieldPct: parseNumber(params.get('maxYield'), DEFAULT_FILTERS.maxYieldPct),
      sort: parseSort(params.get('sort')),
      page: Math.max(1, Math.floor(parseNumber(params.get('page'), 1))),
    }),
    [params],
  );

  const setFilter = useCallback(
    <K extends keyof ProjectFilterState>(key: K, value: ProjectFilterState[K]) => {
      const next = new URLSearchParams(params);
      // Reset page to 1 when any other filter changes
      if (key !== 'page') next.set('page', '1');

      if (key === 'regions') {
        const v = value as readonly RegionOffice[];
        if (v.length === 0) next.delete('regions');
        else next.set('regions', v.join(','));
      } else if (key === 'statuses') {
        const v = value as readonly DeploymentStatus[];
        if (v.length === 0) next.delete('status');
        else next.set('status', v.join(','));
      } else if (key === 'sort') {
        next.set('sort', String(value));
      } else if (key === 'page') {
        next.set('page', String(value));
      } else {
        const k =
          key === 'minKw'
            ? 'minKw'
            : key === 'maxKw'
              ? 'maxKw'
              : key === 'minYieldPct'
                ? 'minYield'
                : 'maxYield';
        next.set(k, String(value));
      }
      setParams(next, { replace: false });
    },
    [params, setParams],
  );

  const resetFilters = useCallback(() => {
    setParams(new URLSearchParams(), { replace: false });
  }, [setParams]);

  return { filters, setFilter, resetFilters };
}
