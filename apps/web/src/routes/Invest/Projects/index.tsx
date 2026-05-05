// FR-R-002 — investor catalog list page (/invest/projects).
//
// Reads BUILDINGS_NATIONWIDE (9,354 entries), applies URL-state filters,
// sorts + paginates 24/page. Pilot Uljin 116 buildings are pinned to the
// top of the default sort ("yield_desc + ULJN-* boost").

import { BUILDINGS_NATIONWIDE, REGION_BY_NAME } from '@lucia/contracts';
import type { Building } from '@lucia/contracts/domain';
import { useMemo } from 'react';

import { FilterPanel } from './FilterPanel.js';
import { ProjectCard } from './ProjectCard.js';
import { useProjectFilters } from './useProjectFilters.js';

const PAGE_SIZE = 24;

export function ProjectsCatalog(): JSX.Element {
  const { filters, setFilter, resetFilters } = useProjectFilters();

  const filtered = useMemo(() => filterBuildings(BUILDINGS_NATIONWIDE, filters), [filters]);
  const sorted = useMemo(() => sortBuildings(filtered, filters.sort), [filtered, filters.sort]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(filters.page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1280, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, margin: 0, marginBottom: 4 }}>투자상품 카탈로그</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
          전국 14개 지역본부 매입임대주택{' '}
          <span className="num" style={{ fontFeatureSettings: "'tnum'", fontWeight: 600, color: '#0a0c0f' }}>
            9,354
          </span>
          동을 출자 단위로 선택하세요.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 260px) 1fr',
          gap: 24,
          alignItems: 'start',
        }}
        className="catalog-layout"
      >
        <FilterPanel
          filters={filters}
          setFilter={setFilter}
          resetFilters={resetFilters}
          totalMatched={sorted.length}
        />

        <section>
          {pageItems.length === 0 ? (
            <div
              style={{
                padding: 40,
                textAlign: 'center',
                background: '#ffffff',
                border: '1px solid var(--line-soft, #e5e7eb)',
                borderRadius: 6,
                color: '#6b7280',
              }}
            >
              필터 조건과 일치하는 사이트가 없습니다.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 12,
              }}
            >
              {pageItems.map((b) => (
                <ProjectCard
                  key={b.building_id}
                  building={b}
                  regionMeta={REGION_BY_NAME.get(b.region_office as never)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onChange={(p) => setFilter('page', p)}
            />
          )}
        </section>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
        }
        .project-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter + sort
// ---------------------------------------------------------------------------

function filterBuildings(
  all: readonly Building[],
  f: ReturnType<typeof useProjectFilters>['filters'],
): Building[] {
  return all.filter((b) => {
    if (f.regions.length > 0 && !f.regions.includes(b.region_office as never)) return false;
    if (b.installed_kw < f.minKw || b.installed_kw > f.maxKw) return false;
    if (f.statuses.length > 0) {
      const status = b.deployment_status ?? 'operating';
      if (!f.statuses.includes(status)) return false;
    }
    const yld = b.expected_yield_pct ?? 0;
    if (yld < f.minYieldPct || yld > f.maxYieldPct) return false;
    return true;
  });
}

function sortBuildings(items: Building[], sort: string): Building[] {
  const out = items.slice();
  // Pilot Uljin pinning: ULJN-* always come first in default sort
  if (sort === 'yield_desc') {
    out.sort((a, b) => {
      const aPilot = a.building_id.startsWith('ULJN-') ? 1 : 0;
      const bPilot = b.building_id.startsWith('ULJN-') ? 1 : 0;
      if (aPilot !== bPilot) return bPilot - aPilot;
      return (b.expected_yield_pct ?? 0) - (a.expected_yield_pct ?? 0);
    });
  } else if (sort === 'capacity_desc') {
    out.sort((a, b) => b.installed_kw - a.installed_kw);
  } else if (sort === 'capacity_asc') {
    out.sort((a, b) => a.installed_kw - b.installed_kw);
  } else if (sort === 'region_asc') {
    out.sort((a, b) => a.region_office.localeCompare(b.region_office, 'ko'));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

function Pagination({ page, totalPages, onChange }: PaginationProps): JSX.Element {
  // Show: first, current-window, last; up to ~7 visible items
  const visible: number[] = [];
  const window = 2;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= window) visible.push(p);
  }

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        margin: '24px 0 0',
        fontSize: 13,
      }}
      aria-label="페이지 탐색"
    >
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        style={pagBtnStyle(false, page === 1)}
        aria-label="이전 페이지"
      >
        ‹
      </button>
      {visible.map((p, i) => {
        const prev = visible[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {showEllipsis && <span style={{ color: '#9ca3af' }}>…</span>}
            <button
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              style={pagBtnStyle(p === page, false)}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        style={pagBtnStyle(false, page === totalPages)}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </nav>
  );
}

function pagBtnStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    minWidth: 32,
    height: 32,
    padding: '0 8px',
    border: `1px solid ${active ? '#10b981' : '#e5e7eb'}`,
    background: active ? '#10b981' : '#ffffff',
    color: active ? '#ffffff' : disabled ? '#d1d5db' : '#374151',
    fontWeight: active ? 600 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 4,
    fontSize: 12,
  };
}
