// 9,354동 부하 테스트 카드
const LoadTestCard = () => {
  const data = window.LUCIA_DATA.LOAD_TEST;
  const max = Math.max(...data.map(d => d.settleMs));

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Pill tone="indigo">FR-O-001</Pill>
            <Pill tone="green" dot>가설 5 검증 ★</Pill>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>9,354동 부하 시뮬레이션</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>전국 확장 시 정산·대시보드 응답 시간</div>
        </div>
        <span className="num" style={{ fontSize: 11, fontWeight: 600, color: "#047857", background: "#ECFDF5", padding: "4px 10px", borderRadius: 999 }}>선형 확장 통과</span>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {data.map((d, i) => (
          <div key={d.scale}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "baseline" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#0E1116" }}>{d.scale}</span>
              <span className="num" style={{ fontSize: 11.5, color: "#6B7280" }}>
                정산 <span style={{ color: "#0E1116", fontWeight: 700 }}>{(d.settleMs / 1000).toFixed(2)}s</span>
                <span style={{ margin: "0 6px", color: "#E2E5EA" }}>·</span>
                대시보드 <span style={{ color: "#0E1116", fontWeight: 700 }}>{(d.dashMs / 1000).toFixed(2)}s</span>
              </span>
            </div>
            <div style={{ display: "flex", height: 8, gap: 2 }}>
              <div style={{
                flex: d.settleMs / max,
                background: "linear-gradient(90deg, #6EE7B7, #10B981)",
                borderRadius: "999px 0 0 999px",
              }}/>
              <div style={{
                flex: 1 - d.settleMs / max,
                background: "#F4F5F7",
                borderRadius: "0 999px 999px 0",
              }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px dashed var(--line-2)", fontSize: 11.5, color: "#6B7280", display: "flex", justifyContent: "space-between" }}>
        <span>NFR-1 기준: 정산 5s·대시보드 3s 이내</span>
        <span style={{ color: "#047857", fontWeight: 700 }}>✓ 통과 (4.68s · 2.94s)</span>
      </div>
    </div>
  );
};

window.LoadTestCard = LoadTestCard;
