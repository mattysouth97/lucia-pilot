// FR-O-003 admin console — wk5 (Track B)
// Placeholder: system config, user management, anomaly inject, audit log land wk5.

export function AdminConsole() {
  return (
    <div className="card flow-in" style={{ padding: '48px 40px' }}>
      <p className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
        FR-O-003 placeholder — to be implemented in wk5
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        관리자 콘솔
      </h1>
      <p style={{ color: 'var(--muted)', margin: 0, fontSize: 14 }}>
        시스템 설정, 사용자 관리, 이상 주입 데모, 감사 로그 열람이 여기에 구현됩니다.
      </p>
    </div>
  );
}
