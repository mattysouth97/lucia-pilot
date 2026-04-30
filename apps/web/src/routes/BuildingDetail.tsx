// FR-M-002 building detail — wk4 (Track B)
// Placeholder: per-building settlement history, chain proof, resident list land wk4.

import { useParams } from 'react-router-dom';

export function BuildingDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="card flow-in" style={{ padding: '48px 40px' }}>
      <p className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
        FR-M-002 placeholder — to be implemented in wk4
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        동별 상세 — {id ?? '—'}
      </h1>
      <p style={{ color: 'var(--muted)', margin: 0, fontSize: 14 }}>
        개별 동의 발전량, 정산 이력, 블록체인 증명, 입주민 목록이 여기에 구현됩니다.
      </p>
    </div>
  );
}
