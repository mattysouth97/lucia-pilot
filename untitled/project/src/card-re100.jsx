// RE100 PPA 카드
const RE100Card = () => {
  const companies = window.LUCIA_DATA.RE100;
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Pill tone="indigo">FR-S-010</Pill>
            <span style={{ fontSize: 11, color: "#9AA0AB", fontWeight: 500 }}>Mock 모드</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>RE100 PPA 약정 이행</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>4개사 · 누적 346,700 kWh · 프리미엄 +20원/kWh</div>
        </div>
        <Btn variant="secondary" size="sm" icon={Icons.Doc}>인증서</Btn>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {companies.map(c => {
          const pct = (c.kwh / c.target) * 100;
          return (
            <div key={c.name} style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr 110px",
              gap: 12, alignItems: "center",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: c.color, color: "#fff",
                display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 700, letterSpacing: "-0.02em",
              }}>{c.logo}</div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "baseline" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                  <span className="num" style={{ fontSize: 11, color: "#9AA0AB" }}>{fmt.n(c.kwh)} / {fmt.n(c.target)} kWh</span>
                </div>
                <div style={{ height: 6, background: "#F4F5F7", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${Math.min(pct, 100)}%`,
                    background: pct >= 80 ? "linear-gradient(90deg, #34D399, #10B981)" : "linear-gradient(90deg, #93C5FD, #4F46E5)",
                    borderRadius: 999,
                  }}/>
                </div>
              </div>
              <span className="num" style={{ fontSize: 12.5, fontWeight: 700, textAlign: "right", color: pct >= 80 ? "#047857" : "#374151" }}>{pct.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

window.RE100Card = RE100Card;
