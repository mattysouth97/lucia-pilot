// apps/web/src/routes/Invest/sections/StationGrid.tsx
import { useMemo, useState } from 'react';

import {
  STATIONS_FILTER, STATIONS_INVEST_CTA, STATIONS_STATUS_LABEL,
  STATIONS_SUB, STATIONS_TITLE, STATIONS_VIEW_ALL,
} from '../copy';
import { stationCards } from '../data';

const FORMAT_WON = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });
type Filter = 'all' | 'ok' | 'maintenance';

export function StationGrid() {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(
    () => filter === 'all' ? stationCards : stationCards.filter(s => s.status === filter),
    [filter],
  );

  const chips: ReadonlyArray<{ id: Filter; label: string }> = [
    { id: 'all', label: STATIONS_FILTER.all },
    { id: 'ok', label: STATIONS_FILTER.ok },
    { id: 'maintenance', label: STATIONS_FILTER.maintenance },
  ];

  return (
    <section id="stations" aria-labelledby="stations-heading" className="landing-section">
      <div className="landing-container">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
          <div>
            <h2 id="stations-heading" style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px', letterSpacing: '-0.025em' }}>
              {STATIONS_TITLE} <span className="num" style={{ color: 'var(--muted-2)', fontWeight: 500 }}>({stationCards.length})</span>
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: 0 }}>{STATIONS_SUB}</p>
          </div>
          <div role="tablist" aria-label="발전소 필터" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {chips.map(chip => (
              <button
                key={chip.id}
                role="tab"
                aria-selected={filter === chip.id}
                onClick={() => setFilter(chip.id)}
                className={filter === chip.id ? 'ledger-chip is-active' : 'ledger-chip'}
                data-testid={`station-filter-${chip.id}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          }}
        >
          {visible.map(s => (
            <article key={s.buildingId} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{s.buildingName}</h3>
                <span className="num" style={{ fontSize: 12.5, color: 'var(--muted)' }}>{s.installedKw} kW</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, marginBottom: 14 }}>
                <span style={{
                  display: 'inline-block', width: 6, height: 6, borderRadius: 999,
                  background: s.status === 'ok' ? 'var(--accent)' : 'var(--muted-2)',
                }} />
                <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{STATIONS_STATUS_LABEL[s.status]}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, fontSize: 12, display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>일 발전</span>
                  <span className="num" style={{ color: 'var(--ink-2)' }}>{s.dailyKwh.toFixed(1)} kWh</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>누적</span>
                  <span className="num" style={{ color: 'var(--ink)' }}>₩{FORMAT_WON.format(s.cumulativeKrw)}</span>
                </div>
              </div>
              <button
                disabled={s.status === 'maintenance'}
                style={{
                  marginTop: 14, width: '100%', height: 36,
                  background: s.status === 'maintenance' ? 'var(--chip)' : 'var(--ink)',
                  color: s.status === 'maintenance' ? 'var(--muted)' : '#fff',
                  borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                  cursor: s.status === 'maintenance' ? 'not-allowed' : 'pointer',
                }}
              >
                {s.status === 'maintenance' ? '점검 중' : STATIONS_INVEST_CTA}
              </button>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href="/invest/projects" style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}>
            {STATIONS_VIEW_ALL} →
          </a>
        </div>
      </div>
    </section>
  );
}
