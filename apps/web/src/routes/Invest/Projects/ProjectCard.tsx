// FR-R-002 — single-site card on the catalog grid.

import type { Building, RegionOfficeMeta } from '@lucia/contracts';
import { Link } from 'react-router-dom';

const STATUS_LABEL: Record<NonNullable<Building['deployment_status']>, string> = {
  planned: '계획',
  construction: '시공 중',
  operating: '운영 중',
};

const STATUS_TONE: Record<NonNullable<Building['deployment_status']>, string> = {
  planned: '#9ca3af',
  construction: '#f59e0b',
  operating: '#10b981',
};

interface ProjectCardProps {
  building: Building;
  regionMeta: RegionOfficeMeta | undefined;
}

export function ProjectCard({ building: b, regionMeta }: ProjectCardProps): JSX.Element {
  const status = b.deployment_status ?? 'operating';
  const tone = STATUS_TONE[status];
  const label = STATUS_LABEL[status];
  const yieldPct = b.expected_yield_pct ?? 0;
  const minStake = (b.est_capex_won ?? 0) > 0 ? formatKRW((b.est_capex_won ?? 0) * 0.01) : '문의';

  return (
    <Link
      to={`/invest/projects/${b.building_id}`}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        background: '#ffffff',
        border: '1px solid var(--line-soft, #e5e7eb)',
        borderRadius: 6,
        padding: 16,
        transition: 'box-shadow 120ms ease',
      }}
      className="project-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            color: '#fff',
            background: regionMeta?.color ?? '#6b7280',
          }}
        >
          {b.region_office}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            color: tone,
            fontWeight: 600,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone }} />
          {label}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13, color: '#0a0c0f', marginBottom: 4 }}>
        {b.building_id}
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
        {b.city} · {b.district}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          fontSize: 12,
          color: '#374151',
        }}
      >
        <div>
          <div style={{ color: '#9ca3af', fontSize: 10 }}>설치용량</div>
          <div className="num" style={{ fontFeatureSettings: "'tnum'" }}>
            {b.installed_kw.toFixed(2)} kW
          </div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: 10 }}>예상 수익률</div>
          <div className="num" style={{ fontFeatureSettings: "'tnum'", color: '#10b981', fontWeight: 600 }}>
            {yieldPct.toFixed(2)}%
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ color: '#9ca3af', fontSize: 10 }}>최소 출자 (1%)</div>
          <div className="num" style={{ fontFeatureSettings: "'tnum'" }}>{minStake}</div>
        </div>
      </div>
    </Link>
  );
}

function formatKRW(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}
