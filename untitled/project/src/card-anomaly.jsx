// 이상 감지 카드
const AnomalyCard = () => {
  const anomalies = window.LUCIA_DATA.ANOMALIES;
  const sevMap = {
    critical: { tone: "rose", label: "긴급", color: "#F43F5E" },
    warn: { tone: "amber", label: "주의", color: "#F59E0B" },
    info: { tone: "indigo", label: "정보", color: "#4F46E5" },
  };

  return (
    <div className="card" style={{ padding: 22, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 2 }}>이상 감지</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>FR-M-004 · 평균 1분 이내 감지</div>
        </div>
        <Pill tone="rose" dot>3건 활성</Pill>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {anomalies.map(a => {
          const sev = sevMap[a.severity];
          return (
            <div key={a.id} style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: `1px solid ${a.severity === "critical" ? "#FFD9DF" : "var(--line)"}`,
              background: a.severity === "critical" ? "#FFFAFB" : "#fff",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 4, alignSelf: "stretch", borderRadius: 2,
                background: sev.color,
              }}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: "#0E1116" }}>{a.building}</span>
                  <Pill tone={sev.tone}>{sev.label}</Pill>
                </div>
                <div style={{ fontSize: 13, color: "#0E1116", fontWeight: 500 }}>{a.type}</div>
                <div style={{ fontSize: 11, color: "#9AA0AB", marginTop: 2 }} className="num">
                  발생 {a.since} · {a.drop !== 0 ? `${a.drop}% 발전 감소` : "정산 큐 적체"}
                </div>
              </div>
              <Btn variant="ghost" size="sm">조치</Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
};

window.AnomalyCard = AnomalyCard;
