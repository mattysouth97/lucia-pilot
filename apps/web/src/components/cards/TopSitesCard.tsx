// TopSitesCard — compact ranking strip mirroring the Figma "상위 얼만 등 현장"
// shows top 4 sites + "기타" remainder rollup with colored dot indicators.

import { Icons } from '@/components/Icons';
import { SectionTitle } from '@/components/atoms';

interface TopSiteRow {
  id: string;
  pct: number;
  kwh: number;
  color: string;
}

const DEFAULT_ROWS: TopSiteRow[] = [
  { id: 'ULJN-001', pct: 23.58, kwh: 43435, color: '#10B981' },
  { id: 'ULJN-014', pct: 18.72, kwh: 34471, color: '#F59E0B' },
  { id: 'ULJN-027', pct: 13.89, kwh: 25582, color: '#F97316' },
  { id: 'ULJN-042', pct: 10.54, kwh: 19411, color: '#F43F5E' },
];

const REST = { id: '기타 112동', pct: 33.27, kwh: 62201, color: '#9AA0AB' };

interface TopSitesCardProps {
  rows?: TopSiteRow[];
}

export function TopSitesCard({ rows = DEFAULT_ROWS }: TopSitesCardProps) {
  return (
    <div className="card card-pad">
      <div className="card-header" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
        <SectionTitle
          title="상위 발전 동 현황"
          subtitle="동별 발전량 및 환원 가이드"
        />
        <span className="top-sites-icon" aria-hidden="true">
          {Icons.Grid}
        </span>
      </div>

      <ul className="top-sites-list">
        {rows.map((r) => (
          <li key={r.id} className="top-sites-row">
            <span
              className="top-sites-dot"
              style={{ background: r.color }}
              aria-hidden="true"
            />
            <span className="mono top-sites-id">{r.id}</span>
            <span className="num top-sites-pct">{r.pct.toFixed(2)}%</span>
            <span className="num top-sites-kwh">{r.kwh.toLocaleString()}</span>
          </li>
        ))}

        <li className="top-sites-row top-sites-row--rest">
          <span
            className="top-sites-dot"
            style={{ background: REST.color }}
            aria-hidden="true"
          />
          <span className="top-sites-id top-sites-id--rest">{REST.id}</span>
          <span className="num top-sites-pct">{REST.pct.toFixed(2)}%</span>
          <span className="num top-sites-kwh">{REST.kwh.toLocaleString()}</span>
        </li>
      </ul>
    </div>
  );
}
