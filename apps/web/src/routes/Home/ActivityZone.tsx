// apps/web/src/routes/Home/ActivityZone.tsx
//
// FR-M-001 — settlement ledger zone shared by AnalystHome and OperatorHome.
// Extracted from Dashboard.tsx to allow per-role customization via props.

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { Icons } from '@/components/Icons';

const FILTER_CHIPS = ['전체 정산', '일일 정산', 'REC 발급', 'PPA 정산', '가상공유거래', '주거비 환원'] as const;
export type FilterChip = (typeof FILTER_CHIPS)[number];

type LedgerStatus = 'good' | 'warn' | 'bad';

export interface LedgerRow {
  id: string;
  buildingName: string;
  buildingId: string;
  service: string;
  amount: string;
  status: LedgerStatus;
  statusLabel: string;
  city: string;
  district?: string;
}

const LEDGER_ROWS: ReadonlyArray<LedgerRow> = [
  { id: 'TX-89A2F1B', buildingName: '울진 옥상-A',  buildingId: 'ULJN-001', service: '일일 정산',   amount: '₩148,920',   status: 'good', statusLabel: '완료',   city: '울진군' },
  { id: 'TX-7C8E219', buildingName: '울진 옥상-B',  buildingId: 'ULJN-002', service: '일일 정산',   amount: '₩142,380',   status: 'good', statusLabel: '완료',   city: '울진군' },
  { id: 'TX-6F1A308', buildingName: '의정부 양주-D', buildingId: 'UJBU-018', service: 'REC 발급',    amount: '₩98,400',    status: 'good', statusLabel: '완료',   city: '의정부시', district: '양주동' },
  { id: 'TX-4D9B0E3', buildingName: '화성 방교-G',  buildingId: 'HSNG-027', service: '가상공유거래', amount: '₩61,520',    status: 'warn', statusLabel: '검증중', city: '화성시',   district: '방교동' },
  { id: 'TX-3A82C77', buildingName: '광명 철산-K',  buildingId: 'GMNG-041', service: '일일 정산',   amount: '₩151,210',   status: 'good', statusLabel: '완료',   city: '광명시',   district: '철산동' },
  { id: 'TX-2E1980D', buildingName: '평택 안중-N',  buildingId: 'PYTK-056', service: '주거비 환원',  amount: '₩1,489,000', status: 'good', statusLabel: '완료',   city: '평택시',   district: '안중동' },
  { id: 'TX-1B70F94', buildingName: '의왕 부곡-P',  buildingId: 'UWAW-072', service: '일일 정산',   amount: '₩7,820',     status: 'bad',  statusLabel: '거부',   city: '의왕시',   district: '부곡동' },
  { id: 'TX-0C5832B', buildingName: '시흥 대야-S',  buildingId: 'SHNG-088', service: '일일 정산',   amount: '₩142,860',   status: 'good', statusLabel: '완료',   city: '시흥시',   district: '대야동' },
  { id: 'TX-PPA-A12', buildingName: '울진 옥상-A',  buildingId: 'ULJN-001', service: 'PPA 정산',    amount: '₩412,800',   status: 'good', statusLabel: '완료',   city: '울진군' },
  { id: 'TX-PPA-B07', buildingName: '광명 철산-K',  buildingId: 'GMNG-041', service: 'PPA 정산',    amount: '₩398,150',   status: 'good', statusLabel: '완료',   city: '광명시',   district: '철산동' },
];

const REGIONS = ['전체 지역', ...Array.from(new Set(LEDGER_ROWS.map((r) => r.city)))] as const;
type Region = (typeof REGIONS)[number];

export interface ActivityZoneProps {
  readonly initialFilters: ReadonlyArray<FilterChip>;
  readonly rightRail?: ReactNode;
  readonly onRowClick?: (row: LedgerRow) => void;
}

export function ActivityZone({ initialFilters, rightRail, onRowClick }: ActivityZoneProps) {
  const initialChip: FilterChip = initialFilters[0] ?? '전체 정산';
  const [activeChip, setActiveChip] = useState<FilterChip>(initialChip);
  const [activeRegion, setActiveRegion] = useState<Region>('전체 지역');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState<boolean>(false);

  const filtered = useMemo(() => {
    return LEDGER_ROWS
      .filter((r) => activeChip === '전체 정산' || r.service === activeChip)
      .filter((r) => activeRegion === '전체 지역' || r.city === activeRegion)
      .filter((r) => !showAnomaliesOnly || r.status === 'bad' || r.status === 'warn');
  }, [activeChip, activeRegion, showAnomaliesOnly]);

  const anomalyCount = useMemo(
    () =>
      LEDGER_ROWS.filter(
        (r) =>
          (activeChip === '전체 정산' || r.service === activeChip) &&
          (activeRegion === '전체 지역' || r.city === activeRegion) &&
          (r.status === 'bad' || r.status === 'warn'),
      ).length,
    [activeChip, activeRegion],
  );

  return (
    <div className="dash-activity">
      <div style={{ minWidth: 0 }}>
        <div className="ledger-toolbar">
          <div className="ledger-chip-group">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`ledger-chip ${activeChip === chip ? 'is-active' : ''}`}
                onClick={() => setActiveChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          <select
            value={activeRegion}
            onChange={(e) => setActiveRegion(e.target.value as Region)}
            style={{
              border: '1px solid var(--line)',
              height: 30,
              padding: '0 12px',
              borderRadius: 999,
              fontSize: 12,
              background: 'var(--panel)',
              color: 'var(--ink)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAnomaliesOnly((v) => !v)}
            aria-pressed={showAnomaliesOnly}
            style={{
              border: showAnomaliesOnly ? '1px solid var(--amber-fg, #B45309)' : '1px solid var(--line)',
              height: 30,
              padding: '0 12px',
              borderRadius: 999,
              fontSize: 12,
              background: showAnomaliesOnly ? 'var(--amber-soft, #FFFBEB)' : 'var(--panel)',
              color: showAnomaliesOnly ? 'var(--amber-fg, #B45309)' : 'var(--ink)',
              cursor: 'pointer',
              flexShrink: 0,
              fontWeight: 600,
            }}
          >
            이상만 보기 ({anomalyCount})
          </button>

          <label className="ledger-search">
            <span style={{ display: 'inline-flex', color: 'var(--muted-2)' }}>{Icons.Search}</span>
            <input type="text" placeholder="동·거래 ID 검색…" />
          </label>
        </div>

        <div className="ledger-section-head">
          <div className="ledger-section-title">최근 정산 거래</div>
        </div>

        <div className="ledger-table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th style={{ width: 130 }}>거래 ID</th>
                <th>동</th>
                <th>정산 항목</th>
                <th className="t-right">금액</th>
                <th>상태</th>
                <th className="t-right" style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <LedgerTableRow key={row.id} row={row} onClick={onRowClick} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted-2)' }}>
                    조건에 해당하는 거래가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rightRail && (
        <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>{rightRail}</div>
      )}
    </div>
  );
}

function LedgerTableRow({
  row,
  onClick,
}: {
  readonly row: LedgerRow;
  readonly onClick?: (row: LedgerRow) => void;
}) {
  const dotClass = row.status === 'good' ? '' : row.status === 'warn' ? ' is-warn' : ' is-bad';
  const pillClass = row.status === 'good' ? 'status-pill-good' : row.status === 'warn' ? 'status-pill-warn' : 'status-pill-bad';
  return (
    <tr>
      <td><span className="ledger-id">{row.id}</span></td>
      <td>
        <span className="ledger-bldg">
          <span className={`ledger-bldg-dot${dotClass}`} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 1, lineHeight: 1.2 }}>
            <span style={{ fontWeight: 500 }}>{row.buildingName}</span>
            <span className="ledger-bldg-id">{row.buildingId}</span>
          </span>
        </span>
      </td>
      <td>{row.service}</td>
      <td className="t-right num" style={{ fontWeight: 600, color: 'var(--ink)' }}>{row.amount}</td>
      <td><span className={pillClass}>{row.statusLabel}</span></td>
      <td className="t-right">
        <button
          type="button"
          className="ledger-row-action"
          onClick={() => onClick?.(row)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
        >
          원장 {Icons.Arrow}
        </button>
      </td>
    </tr>
  );
}
