// Re100CertificateTable — issued RE100 certificates by month.
// Each row: 월, REC 발행번호, 매수량, 검증 상태, 다운로드.

import { Btn, Pill } from '@/components/atoms';

interface Certificate {
  readonly id: string;
  readonly month: string;
  readonly recNumber: string;
  readonly kwh: number;
  readonly status: 'verified' | 'pending';
  readonly issuedAt: string;
}

const CERTIFICATES: Certificate[] = [
  { id: 'c-2604', month: '2026-04', recNumber: 'REC-26-04-A0192', kwh: 178_400, status: 'verified', issuedAt: '2026-04-30' },
  { id: 'c-2603', month: '2026-03', recNumber: 'REC-26-03-A0188', kwh: 174_220, status: 'verified', issuedAt: '2026-03-31' },
  { id: 'c-2602', month: '2026-02', recNumber: 'REC-26-02-A0184', kwh: 168_500, status: 'verified', issuedAt: '2026-02-28' },
  { id: 'c-2601', month: '2026-01', recNumber: 'REC-26-01-A0177', kwh: 170_280, status: 'verified', issuedAt: '2026-01-31' },
];

const FORMAT = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });

const DownIcon = (
  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v12m0 0-5-5m5 5 5-5M4 20h16" />
  </svg>
);

export function Re100CertificateTable() {
  return (
    <section
      aria-labelledby="re100-certificates-heading"
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="overline" style={{ marginBottom: 6 }}>발급된 RE100 인증서</div>
          <h3
            id="re100-certificates-heading"
            style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)' }}
          >
            한국에너지공단 발급 — {CERTIFICATES.length}건
          </h3>
        </div>
        <span className="num" style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>
          누적 {FORMAT.format(CERTIFICATES.reduce((s, c) => s + c.kwh, 0))} kWh
        </span>
      </header>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line-2)' }}>
              <th style={thStyle}>월</th>
              <th style={thStyle}>REC 발행번호</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>매수량</th>
              <th style={thStyle}>발급일</th>
              <th style={thStyle}>검증</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>다운로드</th>
            </tr>
          </thead>
          <tbody>
            {CERTIFICATES.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={tdStyle}>{c.month}</td>
                <td className="num" style={{ ...tdStyle, color: 'var(--accent-ink, #047857)' }}>{c.recNumber}</td>
                <td className="num" style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: 'var(--ink)' }}>
                  {FORMAT.format(c.kwh)} kWh
                </td>
                <td style={tdStyle}>{c.issuedAt}</td>
                <td style={tdStyle}>
                  {c.status === 'verified' ? (
                    <Pill tone="green" dot>검증 완료</Pill>
                  ) : (
                    <Pill tone="amber" dot>검증 중</Pill>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <Btn variant="ghost" size="sm" icon={DownIcon}>PDF</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--muted)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  padding: '8px 10px 10px',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 10px',
  color: 'var(--ink-2)',
};
