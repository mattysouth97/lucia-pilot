// FR-M-001 main dashboard — wk3 (Track B)
// Placeholder: full StatsRow, GenerationCard, SankeyCard, BuildingsCard, etc. land wk3.

export function Dashboard() {
  return (
    <div className="card flow-in" style={{ padding: '48px 40px' }}>
      <p className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
        FR-M-001 placeholder — to be implemented in wk3 (Track B)
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        메인 대시보드
      </h1>
      <p style={{ color: 'var(--muted)', margin: 0, fontSize: 14 }}>
        발전량 현황, 정산 요약, 실시간 거래 스트림, 이상 감지 카드가 여기에 구현됩니다.
      </p>
    </div>
  );
}
