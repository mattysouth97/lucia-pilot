// 입주민 환원 포털 미니뷰
const ResidentCard = () => {
  return (
    <div className="card" style={{
      padding: 0,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* gradient header */}
      <div style={{
        background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 60%, #fff 100%)",
        padding: "20px 22px 16px",
        borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <Pill tone="green" dot>입주민 포털 · UC-4</Pill>
          <span className="mono" style={{ fontSize: 10, color: "#9AA0AB" }}>FR-M-007</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 999,
            background: "linear-gradient(135deg, #6EE7B7, #06B6A2)",
            color: "#fff", fontWeight: 700, fontSize: 14,
            display: "grid", placeItems: "center",
          }}>홍</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>홍길동 입주민님</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>울진 ULJN-001 · 매입임대 4세대</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: "#047857", fontWeight: 600, marginBottom: 4 }}>2026년 4월 환원 금액</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="num" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em" }}>6,420</span>
            <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>원</span>
            <span style={{ marginLeft: 6, fontSize: 11, color: "#059669", fontWeight: 600, background: "#D1FAE5", padding: "2px 8px", borderRadius: 999 }}>월 자동 정산</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 22px" }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>산정 근거</div>
        <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6B7280" }}>ULJN-001 발전수익 (4월)</span>
            <span className="num" style={{ fontWeight: 600 }}>16,432,180원</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6B7280" }}>주거비 환원 비율 (41%)</span>
            <span className="num" style={{ fontWeight: 600 }}>6,737,194원</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6B7280" }}>LH 매입임대 분배 (64.2%)</span>
            <span className="num" style={{ fontWeight: 600 }}>4,325,278원</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#6B7280" }}>1,643세대 균등 분배</span>
            <span className="num" style={{ fontWeight: 700, color: "#047857" }}>÷ 1,643 = 6,420원</span>
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--line-2)", display: "flex", gap: 8 }}>
          <Btn variant="secondary" size="sm" icon={Icons.Chain} style={{ flex: 1, justifyContent: "center" }}>블록체인 증빙</Btn>
          <Btn variant="ghost" size="sm" icon={Icons.Doc} style={{ flex: 1, justifyContent: "center" }}>PDF</Btn>
        </div>
      </div>
    </div>
  );
};

window.ResidentCard = ResidentCard;
