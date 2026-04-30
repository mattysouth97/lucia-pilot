// 1 kWh → 28 항목 분배 — settlement breakdown card
const DistributionCard = () => {
  const groups = window.LUCIA_DATA.DISTRIBUTION;
  const items = window.LUCIA_DATA.SETTLEMENT_BREAKDOWN;
  const totalIn = items.filter(x => x.type === "income").reduce((s, x) => s + x.value, 0);
  const totalOut = -items.filter(x => x.type === "out").reduce((s, x) => s + x.value, 0);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Pill tone="indigo">FR-S-004</Pill>
            <Pill tone="neutral" dot>가상공유거래 ★</Pill>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>1 kWh 발전 → 9개 화폐 흐름</div>
          <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 3 }}>
            ULJN-001 · 1.20 kWh · 2026-04-30 13:24:18 · Block #184729
          </div>
        </div>
        <Btn variant="secondary" size="sm" icon={Icons.Share}>전체 28개</Btn>
      </div>

      {/* Big revenue strip */}
      <div style={{
        background: "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)",
        border: "1px solid #D1FAE5",
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 18,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 11.5, color: "#047857", fontWeight: 600, marginBottom: 4 }}>총 발전수익</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em" }}>248.0<span style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, marginLeft: 4 }}>원</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#059669", fontSize: 22, fontWeight: 300 }}>→</div>
        <div>
          <div style={{ fontSize: 11.5, color: "#BE123C", fontWeight: 600, marginBottom: 4 }}>분배·수수료</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em" }}>-114.7<span style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, marginLeft: 4 }}>원</span></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#059669", fontSize: 22, fontWeight: 300 }}>=</div>
        <div>
          <div style={{ fontSize: 11.5, color: "#0E1116", fontWeight: 600, marginBottom: 4 }}>SPC 순적립</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em" }}>133.3<span style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, marginLeft: 4 }}>원</span></div>
        </div>
      </div>

      {/* Breakdown rows */}
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((it, i) => {
          const pct = Math.abs(it.value) / Math.max(totalIn, totalOut) * 100;
          const pos = it.type === "income";
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "auto 1fr 110px 90px",
              alignItems: "center", gap: 12,
              padding: "8px 0",
            }}>
              <span className="mono" style={{ fontSize: 10.5, color: "#9AA0AB", letterSpacing: "0", width: 38 }}>{it.code}</span>
              <span style={{ fontSize: 13, color: "#0E1116", fontWeight: 500, letterSpacing: "-0.01em" }}>{it.label}</span>
              <div style={{ height: 6, borderRadius: 999, background: "#F4F5F7", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: pos ? "linear-gradient(90deg, #34D399, #10B981)" : "linear-gradient(90deg, #FDA4AF, #F43F5E)",
                  borderRadius: 999,
                }} />
              </div>
              <span className="num" style={{
                fontSize: 13.5, fontWeight: 700, textAlign: "right",
                color: pos ? "#047857" : "#BE123C",
              }}>{pos ? "+" : ""}{it.value.toFixed(2)}원</span>
            </div>
          );
        })}
      </div>

      {/* Beneficiary breakdown */}
      <div style={{ marginTop: 18, padding: "16px 0 0 0", borderTop: "1px dashed var(--line-2)" }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#6B7280", marginBottom: 10 }}>주거비 환원 41% — 2,839세대 분배</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {groups.map(g => (
            <div key={g.id} style={{
              border: "1px solid var(--line)", borderRadius: 12, padding: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: g.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{g.label}</span>
              </div>
              <div className="num" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {fmt.n(g.households)}<span style={{ fontSize: 11, color: "#9AA0AB", fontWeight: 500, marginLeft: 3 }}>세대</span>
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                월 <span className="num" style={{ color: "#0E1116", fontWeight: 600 }}>{fmt.n(g.perHH)}원</span>/세대
              </div>
              <div style={{ marginTop: 8, height: 4, background: "#F4F5F7", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${g.ratio * 100}%`, background: g.color, borderRadius: 999 }} />
              </div>
              <div style={{ fontSize: 10.5, color: "#9AA0AB", marginTop: 4 }} className="num">{(g.ratio * 100).toFixed(1)}% 비율</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.DistributionCard = DistributionCard;
