// 변조 시도 데모 — Interactive tamper attempt
const TamperDemo = ({ onClose }) => {
  const [phase, setPhase] = React.useState("idle"); // idle | editing | verifying | rejected
  const [editValue, setEditValue] = React.useState("146.4");
  const original = 146.4;

  const startTamper = () => {
    setEditValue("999.9");
    setPhase("editing");
    setTimeout(() => setPhase("verifying"), 400);
    setTimeout(() => setPhase("rejected"), 1600);
  };

  const reset = () => {
    setEditValue("146.4");
    setPhase("idle");
  };

  return (
    <Modal open={true} onClose={onClose} width={760}>
      <div style={{ padding: "20px 26px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Pill tone="rose" dot>FR-S-008 · 변조 시도 데모</Pill>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>블록체인 무결성 검증 시연</div>
        </div>
        <Btn variant="ghost" size="sm" onClick={onClose} icon={Icons.Cross}/>
      </div>

      <div style={{ padding: 28 }}>
        {/* Original record */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#9AA0AB", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>원본 정산 기록 · Block #184729</div>
          <div className="card" style={{ padding: 16, background: phase === "rejected" ? "#F0FDF4" : "#fff" }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 14 }}>
              <span style={{ width: 8, height: 40, background: "#10B981", borderRadius: 4 }}/>
              <div>
                <div className="mono" style={{ fontSize: 11, color: "#0E1116", fontWeight: 600 }}>0x7f3e…a92c</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>ULJN-001 · 2026-04-30 13:24:18 · 1.23 kWh</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>{original.toFixed(1)}원</div>
                <div className="mono" style={{ fontSize: 9.5, color: "#9AA0AB" }}>hash: f7a2…3e91</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tamper input */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "#9AA0AB", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>관리자 변경 시도 (어드민 권한도 거부됨)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px",
              border: `2px solid ${phase === "rejected" ? "#F43F5E" : phase === "verifying" ? "#F59E0B" : phase === "editing" ? "#0E1116" : "var(--line-2)"}`,
              borderRadius: 12, background: "#fff",
              transition: "all .2s",
              animation: phase === "rejected" ? "shake .3s" : "none",
            }}>
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>매출 변경 →</span>
              <input value={editValue} onChange={e => setEditValue(e.target.value)} disabled={phase !== "idle"} className="num" style={{
                flex: 1, fontSize: 18, fontWeight: 700, border: "none", outline: "none",
                color: phase === "rejected" ? "#BE123C" : "#0E1116",
                background: "transparent",
                fontFamily: "inherit",
              }}/>
              <span style={{ fontSize: 12, color: "#9AA0AB" }}>원</span>
            </div>
            <Btn variant={phase === "idle" ? "primary" : "secondary"} onClick={phase === "idle" ? startTamper : reset}>
              {phase === "idle" ? "변조 시도" : "다시 시도"}
            </Btn>
          </div>
        </div>

        {/* Verification flow */}
        <div className="card" style={{
          padding: 18,
          background: phase === "rejected" ? "#FFF1F3" : "#FAFBFC",
          borderColor: phase === "rejected" ? "#FFD9DF" : "var(--line)",
          transition: "all .3s",
        }}>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              { lbl: "1. Smart Contract endorsement 호출 (Org A + Org B)", show: ["editing", "verifying", "rejected"], done: ["verifying", "rejected"] },
              { lbl: "2. Hash chain 검증 — 원본 해시와 비교", show: ["verifying", "rejected"], done: ["rejected"], crit: "rejected" },
              { lbl: "3. 변경 후 해시: 8c91…7d2e ≠ 원본 f7a2…3e91", show: ["rejected"], done: ["rejected"], crit: "rejected" },
              { lbl: "4. 트랜잭션 거부 → 알림 발송 + 감사 로그 기록", show: ["rejected"], done: ["rejected"], crit: "rejected" },
            ].map((step, i) => {
              const visible = step.show.includes(phase);
              const done = step.done.includes(phase);
              const isCrit = step.crit === phase;
              if (!visible) return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.3, fontSize: 12 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 999, border: "1.5px solid #E2E5EA" }}/>
                  <span style={{ color: "#9AA0AB" }}>{step.lbl}</span>
                </div>
              );
              return (
                <div key={i} className="flow-in" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 999,
                    background: done ? (isCrit ? "#F43F5E" : "#10B981") : "#fff",
                    border: done ? "none" : "2px solid #F59E0B",
                    display: "grid", placeItems: "center",
                    color: "#fff",
                  }} className={!done ? "pulse-dot" : ""}>
                    {done && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        {isCrit ? <path d="m6 6 12 12M6 18 18 6"/> : <path d="m5 12 5 5L20 7"/>}
                      </svg>
                    )}
                  </span>
                  <span style={{ color: isCrit ? "#BE123C" : done ? "#0E1116" : "#374151", fontWeight: isCrit ? 700 : 500 }}>{step.lbl}</span>
                </div>
              );
            })}
          </div>

          {phase === "rejected" && (
            <div className="flow-in" style={{
              marginTop: 14, padding: "12px 14px",
              background: "#fff", border: "1px solid #FFD9DF", borderRadius: 10,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FECDD3", color: "#BE123C", display: "grid", placeItems: "center", flexShrink: 0 }}>
                {Icons.Lock}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#BE123C" }}>변조 시도 자동 거부 완료</div>
                <div style={{ fontSize: 11, color: "#9F1239", marginTop: 2 }} className="num">
                  Tx 0xe102…7c4a · 13:23:58 · admin@lucia · 10.0.4.21 · hash_mismatch
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#047857", background: "#D1FAE5", padding: "4px 10px", borderRadius: 999 }}>
                ✓ 원장 무결성 유지
              </span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, fontSize: 11.5, color: "#6B7280", textAlign: "center" }}>
          본 데모는 LH 본사 시연 시나리오 6단계(06:30~07:30)에 자동 재생됩니다.
        </div>
      </div>
    </Modal>
  );
};

window.TamperDemo = TamperDemo;
