// 116동 발전 랭킹 카드
const BuildingsCard = () => {
  const buildings = window.LUCIA_DATA.BUILDINGS;
  const { openBuilding } = window.useLuciaModals();
  const [filter, setFilter] = React.useState("전체");
  const filters = ["전체", "정상", "주의", "이상"];
  const map = { 정상: "ok", 주의: "warn", 이상: "alert" };
  const filtered = filter === "전체" ? buildings : buildings.filter(b => b.status === map[filter]);
  const maxToday = Math.max(...buildings.map(b => b.today));

  const statusTone = { ok: "green", warn: "amber", alert: "rose" };
  const statusLabel = { ok: "정상", warn: "주의", alert: "이상" };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <SectionTitle title="동별 발전 랭킹" subtitle="116동 중 상위/하위 12동 · 실시간 효율 기반" />
        </div>
        <div style={{ display: "flex", gap: 6, background: "#F4F5F7", padding: 4, borderRadius: 999 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 12px", borderRadius: 999,
              fontSize: 12, fontWeight: 600,
              background: filter === f ? "#fff" : "transparent",
              color: filter === f ? "#0E1116" : "#6B7280",
              boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 80px 90px 80px 80px 28px", padding: "0 4px 8px", fontSize: 11, fontWeight: 600, color: "#9AA0AB", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--line)" }}>
        <span>동 ID</span>
        <span>지역 · 발전량</span>
        <span style={{ textAlign: "right" }}>오늘 kWh</span>
        <span style={{ textAlign: "right" }}>효율</span>
        <span style={{ textAlign: "right" }}>세대</span>
        <span style={{ textAlign: "right" }}>상태</span>
        <span></span>
      </div>

      <div>
        {filtered.map((b, i) => (
          <div key={b.id} onClick={() => openBuilding(b)} style={{
            display: "grid", gridTemplateColumns: "100px 1fr 80px 90px 80px 80px 28px",
            alignItems: "center", padding: "12px 4px",
            borderBottom: i < filtered.length - 1 ? "1px solid #F4F5F7" : "none",
            transition: "background .12s", cursor: "pointer",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "#0E1116" }}>{b.id}</span>
            <div>
              <div style={{ fontSize: 12.5, color: "#0E1116", marginBottom: 4, fontWeight: 500 }}>{b.region}</div>
              <div style={{ height: 4, background: "#F4F5F7", borderRadius: 999, overflow: "hidden", maxWidth: 280 }}>
                <div style={{
                  height: "100%", width: `${b.today / maxToday * 100}%`,
                  background: b.status === "alert" ? "#F43F5E" : b.status === "warn" ? "#F59E0B" : "linear-gradient(90deg, #34D399, #10B981)",
                  borderRadius: 999,
                }}/>
              </div>
            </div>
            <span className="num" style={{ fontSize: 13, fontWeight: 700, textAlign: "right" }}>{fmt.kwh(b.today)}</span>
            <span className="num" style={{ fontSize: 12.5, textAlign: "right", color: b.eff < 50 ? "#BE123C" : b.eff < 85 ? "#B45309" : "#047857", fontWeight: 600 }}>{b.eff.toFixed(1)}%</span>
            <span className="num" style={{ fontSize: 12.5, textAlign: "right", color: "#6B7280" }}>{b.subsidy}</span>
            <span style={{ textAlign: "right" }}><Pill tone={statusTone[b.status]} dot>{statusLabel[b.status]}</Pill></span>
            <span style={{ color: "#9AA0AB", display: "grid", placeItems: "end" }}>{Icons.Caret}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280" }}>
        <span>전체 116동 보기 →</span>
        <span className="num">총 12동 표시 · 평균 효율 84.3%</span>
      </div>
    </div>
  );
};

window.BuildingsCard = BuildingsCard;
