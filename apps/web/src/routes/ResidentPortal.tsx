// FR-M-007 resident portal — wk5 (Track B)
// Placeholder: per-resident settlement breakdown, PDF download, QR verification land wk5.

import { useParams } from 'react-router-dom';

export function ResidentPortal() {
  const { user_id } = useParams<{ user_id: string }>();

  return (
    <div className="card flow-in" style={{ padding: '48px 40px' }}>
      <p className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
        FR-M-007 placeholder — to be implemented in wk5
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        입주민 포털 — {user_id ?? '—'}
      </h1>
      <p style={{ color: 'var(--muted)', margin: 0, fontSize: 14 }}>
        입주민별 정산 내역, 에너지 절약 리포트, PDF 다운로드, QR 검증이 여기에 구현됩니다.
      </p>
    </div>
  );
}
