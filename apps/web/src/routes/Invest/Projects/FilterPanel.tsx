// FR-R-002 — filter sidebar for the catalog. Mobile: <details> drawer; desktop: inline.

import { REGION_OFFICES } from '@lucia/contracts';
import type { DeploymentStatus, RegionOffice } from '@lucia/contracts/domain';

import type { ProjectFilterState, SortKey } from './useProjectFilters.js';

const STATUS_OPTIONS: { value: DeploymentStatus; label: string }[] = [
  { value: 'planned', label: '계획' },
  { value: 'construction', label: '시공 중' },
  { value: 'operating', label: '운영 중' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'yield_desc', label: '수익률 높은순' },
  { value: 'capacity_desc', label: '용량 큰순' },
  { value: 'capacity_asc', label: '용량 작은순' },
  { value: 'region_asc', label: '지역명 가나다순' },
];

interface FilterPanelProps {
  filters: ProjectFilterState;
  setFilter: <K extends keyof ProjectFilterState>(key: K, value: ProjectFilterState[K]) => void;
  resetFilters: () => void;
  totalMatched: number;
}

export function FilterPanel({ filters, setFilter, resetFilters, totalMatched }: FilterPanelProps): JSX.Element {
  const toggleRegion = (r: RegionOffice): void => {
    const next = filters.regions.includes(r)
      ? filters.regions.filter((x) => x !== r)
      : [...filters.regions, r];
    setFilter('regions', next);
  };

  const toggleStatus = (s: DeploymentStatus): void => {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter((x) => x !== s)
      : [...filters.statuses, s];
    setFilter('statuses', next);
  };

  return (
    <aside
      style={{
        position: 'sticky',
        top: 16,
        background: '#ffffff',
        border: '1px solid var(--line-soft, #e5e7eb)',
        borderRadius: 6,
        padding: 16,
        fontSize: 13,
      }}
      aria-label="투자상품 필터"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <h2 style={{ fontSize: 14, margin: 0 }}>필터</h2>
        <button
          type="button"
          onClick={resetFilters}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            fontSize: 11,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          전체 초기화
        </button>
      </div>

      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 16 }}>
        매칭된 사이트: <span className="num" style={{ fontWeight: 600, color: '#0a0c0f' }}>{totalMatched.toLocaleString('ko-KR')}</span>개
      </div>

      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px 0' }}>
        <legend style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>지역본부</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {REGION_OFFICES.map((r) => {
            const active = filters.regions.includes(r.name);
            return (
              <button
                key={r.name}
                type="button"
                onClick={() => toggleRegion(r.name)}
                aria-pressed={active}
                style={{
                  padding: '4px 8px',
                  fontSize: 11,
                  borderRadius: 4,
                  border: `1px solid ${active ? r.color : '#e5e7eb'}`,
                  background: active ? r.color : '#ffffff',
                  color: active ? '#ffffff' : '#374151',
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {r.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px 0' }}>
        <legend style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>설치 용량 (kW)</legend>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11 }}>
          <input
            type="number"
            value={filters.minKw}
            min={0}
            max={100}
            onChange={(e) => setFilter('minKw', Number.parseFloat(e.target.value) || 0)}
            style={{ width: 72, padding: 4, border: '1px solid #e5e7eb', borderRadius: 3 }}
            aria-label="최소 용량"
          />
          <span>~</span>
          <input
            type="number"
            value={filters.maxKw}
            min={0}
            max={100}
            onChange={(e) => setFilter('maxKw', Number.parseFloat(e.target.value) || 100)}
            style={{ width: 72, padding: 4, border: '1px solid #e5e7eb', borderRadius: 3 }}
            aria-label="최대 용량"
          />
        </div>
      </fieldset>

      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px 0' }}>
        <legend style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>진행 단계</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STATUS_OPTIONS.map((opt) => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={filters.statuses.includes(opt.value)}
                onChange={() => toggleStatus(opt.value)}
              />
              <span style={{ fontSize: 12 }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 16px 0' }}>
        <legend style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>예상 수익률 (%)</legend>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11 }}>
          <input
            type="number"
            step="0.1"
            value={filters.minYieldPct}
            min={0}
            max={15}
            onChange={(e) => setFilter('minYieldPct', Number.parseFloat(e.target.value) || 0)}
            style={{ width: 60, padding: 4, border: '1px solid #e5e7eb', borderRadius: 3 }}
            aria-label="최소 수익률"
          />
          <span>~</span>
          <input
            type="number"
            step="0.1"
            value={filters.maxYieldPct}
            min={0}
            max={15}
            onChange={(e) => setFilter('maxYieldPct', Number.parseFloat(e.target.value) || 15)}
            style={{ width: 60, padding: 4, border: '1px solid #e5e7eb', borderRadius: 3 }}
            aria-label="최대 수익률"
          />
        </div>
      </fieldset>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>정렬</label>
        <select
          value={filters.sort}
          onChange={(e) => setFilter('sort', e.target.value as SortKey)}
          style={{ width: '100%', padding: 6, border: '1px solid #e5e7eb', borderRadius: 3, fontSize: 12 }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </aside>
  );
}
