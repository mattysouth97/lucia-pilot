// FR-R-005 §6 v1.3 — minimal /admin/loi operator console.
//
// Slice 4 of the LOI module. Lists all LOIs (across investors), supports
// status transitions (submitted → under_review → approved/rejected →
// contract) per the FR-R-005 §6 workflow enforced by transitionLOI.
//
// Pilot v1.3 is a deliberately bare console — operator usability polish
// arrives in v1.4 with backend wiring.

import type { LOI, LOIStatus } from '@lucia/contracts/domain';
import { canTransition } from '@lucia/contracts/domain';
import { DEMO_INVESTORS } from '@lucia/contracts/fixtures';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { listLOIs, transitionLOI } from '@/lib/loi';

const STATUS_LABEL: Record<LOIStatus, string> = {
  draft: '작성 중',
  submitted: '제출됨',
  under_review: '검토 중',
  approved: '승인',
  rejected: '반려',
  contract: '계약 체결',
};
const STATUS_TONE: Record<LOIStatus, string> = {
  draft: '#9ca3af',
  submitted: '#1264D3',
  under_review: '#f59e0b',
  approved: '#10b981',
  rejected: '#dc2626',
  contract: '#7c3aed',
};
const ALL_STATUSES: LOIStatus[] = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'contract'];

function investorLabel(id: string): string {
  const inv = DEMO_INVESTORS.find((i) => i.id === id);
  if (!inv) return id;
  return inv.type === 're100' ? `${inv.company_name} (RE100)` : `${inv.individual_name} (Retail)`;
}

export function AdminLOIList(): JSX.Element {
  const [version, setVersion] = useState(0);
  const lois = listLOIs();
  // Sort: under_review first (action needed), then submitted, then others
  const order: Record<LOIStatus, number> = {
    under_review: 0, submitted: 1, draft: 2, approved: 3, contract: 4, rejected: 5,
  };
  const sorted = [...lois].sort((a, b) => order[a.status] - order[b.status]);

  const onTransition = (id: string, to: LOIStatus): void => {
    try {
      transitionLOI(id, to);
      setVersion((v) => v + 1);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : '상태 전환 실패');
    }
  };

  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            color: '#6b7280',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          FR-R-005 §6 · LOI 운영 콘솔
        </div>
        <h1 style={{ fontSize: 24, margin: '4px 0 0' }}>LOI 관리 ({lois.length}건)</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          제출된 출자 의향서를 검토하고 승인/반려/계약 상태로 전환합니다 (workflow draft →
          submitted → under_review → approved/rejected → contract).
        </p>
      </header>

      <div key={version} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((loi) => (
          <LOIRow key={loi.id} loi={loi} onTransition={onTransition} />
        ))}
      </div>
    </div>
  );
}

function LOIRow({
  loi,
  onTransition,
}: {
  loi: LOI;
  onTransition: (id: string, to: LOIStatus) => void;
}): JSX.Element {
  const tone = STATUS_TONE[loi.status];
  const label = STATUS_LABEL[loi.status];
  const validTransitions = ALL_STATUSES.filter((s) => canTransition(loi.status, s));

  return (
    <div
      style={{
        padding: 14,
        background: '#fff',
        border: '1px solid var(--line, #e5e7eb)',
        borderRadius: 6,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <span
            style={{
              padding: '2px 8px',
              fontSize: 10.5,
              fontWeight: 700,
              color: '#fff',
              background: tone,
              borderRadius: 3,
            }}
          >
            {label}
          </span>
          {loi.is_non_binding && (
            <span style={{ fontSize: 10.5, color: '#92400e', fontWeight: 600 }}>비구속력</span>
          )}
          <Link
            to={`/admin/loi/${loi.id}`}
            className="num"
            style={{ fontSize: 11, fontFamily: 'monospace', color: '#1264D3', textDecoration: 'none' }}
          >
            {loi.id}
          </Link>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{investorLabel(loi.investor_id)}</div>
        <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 4 }}>
          출자 <strong className="num">{(loi.capex_won / 100_000_000).toFixed(2)}억</strong> · 사이트{' '}
          {loi.sites.length}개 · 기간 {loi.terms.years}년 · 자기자본{' '}
          {loi.terms.equity_ratio_pct.toFixed(1)}% · 수익률{' '}
          <strong style={{ color: '#10b981' }}>{loi.terms.expected_yield_pct.toFixed(2)}%</strong>
        </div>
        {loi.blockchain_hash && (
          <div className="num" style={{ fontSize: 10.5, color: '#9ca3af', fontFamily: 'monospace', marginTop: 4 }}>
            hash · {loi.blockchain_hash.slice(0, 24)}…
          </div>
        )}
      </div>
      {validTransitions.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexDirection: 'column' }}>
          {validTransitions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onTransition(loi.id, s)}
              style={{
                padding: '6px 12px',
                fontSize: 11.5,
                background: s === 'rejected' ? '#fef2f2' : '#fff',
                color: s === 'rejected' ? '#991b1b' : '#0a0c0f',
                border: `1px solid ${s === 'rejected' ? '#fecaca' : 'var(--line, #e5e7eb)'}`,
                borderRadius: 3,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              → {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminLOIDetail(): JSX.Element {
  const { loi_id } = useParams<{ loi_id: string }>();
  const lois = listLOIs();
  const loi = lois.find((l) => l.id === loi_id);

  if (!loi) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22 }}>LOI를 찾을 수 없습니다</h1>
        <Link to="/admin/loi" style={{ color: '#10b981' }}>← 목록으로</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 760, margin: '0 auto' }}>
      <Link
        to="/admin/loi"
        style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}
      >
        ← LOI 목록
      </Link>
      <h1 style={{ fontSize: 22, margin: 0 }}>{loi.id}</h1>
      <p style={{ fontSize: 13, color: '#6b7280' }}>{investorLabel(loi.investor_id)}</p>

      <pre
        style={{
          marginTop: 16,
          padding: 16,
          background: '#fafafa',
          border: '1px solid var(--line, #e5e7eb)',
          borderRadius: 6,
          fontSize: 11,
          fontFamily: 'monospace',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
        }}
      >
        {JSON.stringify(loi, null, 2)}
      </pre>
    </div>
  );
}
