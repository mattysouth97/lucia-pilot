// 동별 상세 화면 — Building detail modal
const BuildingDetail = ({ building, onClose }) => {
  if (!building) return null;
  const b = building;

  // Synthesize 24h hourly chart and 30-day trend
  const hourly = window.LUCIA_DATA.HOURLY_GENERATION.map(h => ({
    h: h.h,
    kwh: Math.round(h.today * (b.eff / 95) * (b.id === "ULJN-042" ? (parseInt(h.h) >= 13 ? 0.05 : 0.95) : 1) / 116 * 1.05),
  }));
  const days = Array.from({ length: 30 }, (_, i) => ({
    d: i + 1,
    kwh: Math.round(110 + Math.random() * 30 + (i / 30) * 10),
  }));

  const sevColor = { ok: "#10B981", warn: "#F59E0B", alert: "#F43F5E" }[b.status];
  const statusLabel = { ok: "정상 가동", warn: "주의 — 효율 저하", alert: "긴급 — 인버터 오류" }[b.status];

  const recent = [
    { ts: "13:24:18", kwh: 1.23, smp: 119, won: 146.4, status: "ok" },
    { ts: "13:23:18", kwh: 1.18, smp: 119, won: 140.4, status: "ok" },
    { ts: "13:22:18", kwh: 1.21, smp: 118, won: 142.8, status: "ok" },
    { ts: "13:21:18", kwh: 1.15, smp: 118, won: 135.7, status: "ok" },
    { ts: "13:20:18", kwh: 1.09, smp: 117, won: 127.5, status: "ok" },
  ];

  return (
    <Modal open={true} onClose={onClose} width={1080}>
      {/* Header */}
      <div style={{
        padding: "22px 28px 18px",
        borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Pill tone={b.status === "alert" ? "rose" : b.status === "warn" ? "amber" : "green"} dot>{statusLabel}</Pill>
            <span className="mono" style={{ fontSize: 11, color: "#9AA0AB" }}>FR-M-002 · /buildings/{b.id}</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.025em" }}>{b.id}</span>
            <span style={{ fontSize: 14, color: "#6B7280" }}>{b.region}</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#6B7280", marginTop: 4 }}>
            <span className="num">{b.capacity} kW</span> 설치 · 옥상 태양광 ·
            <span style={{ marginLeft: 6 }} className="num">36.9928°N, 129.4003°E</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" size="sm" icon={Icons.Doc}>이력 PDF</Btn>
          <Btn variant="ghost" size="sm" onClick={onClose} icon={Icons.Cross}/>
        </div>
      </div>

      {/* Body — scrollable */}
      <div style={{ overflow: "auto", padding: 24, background: "#FAFBFC" }}>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
          {[
            { lbl: "오늘 발전량", val: fmt.kwh(b.today), unit: "kWh", color: sevColor, delta: b.status === "alert" ? "▼ 67.6%" : "▲ 4.2%", deltaC: b.status === "alert" ? "#BE123C" : "#047857" },
            { lbl: "현재 효율", val: b.eff.toFixed(1), unit: "%", color: sevColor },
            { lbl: "환원 세대", val: fmt.n(b.subsidy), unit: "세대", color: "#06B6A2" },
            { lbl: "누적 매출 (4월)", val: "16,432", unit: "천원", color: "#0E1116" },
          ].map((k, i) => (
            <div key={i} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11.5, color: "#6B7280", fontWeight: 500, marginBottom: 6 }}>{k.lbl}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: k.color }}>{k.val}</span>
                <span style={{ fontSize: 11, color: "#9AA0AB", fontWeight: 500 }}>{k.unit}</span>
              </div>
              {k.delta && <div style={{ fontSize: 11, fontWeight: 600, color: k.deltaC, marginTop: 4 }}>{k.delta}</div>}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12, marginBottom: 18 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>24시간 발전량</div>
              <Pill tone="neutral">2026-04-30</Pill>
            </div>
            <div style={{ height: 180 }}>
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.AreaChart data={hourly} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`bdGrad-${b.id}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={sevColor} stopOpacity="0.3"/>
                      <stop offset="100%" stopColor={sevColor} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <Recharts.CartesianGrid stroke="#F1F3F5" vertical={false}/>
                  <Recharts.XAxis dataKey="h" axisLine={false} tickLine={false}/>
                  <Recharts.YAxis axisLine={false} tickLine={false}/>
                  <Recharts.Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E5EA" }}/>
                  <Recharts.Area type="monotone" dataKey="kwh" stroke={sevColor} strokeWidth={2.2} fill={`url(#bdGrad-${b.id})`}/>
                </Recharts.AreaChart>
              </Recharts.ResponsiveContainer>
            </div>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>30일 추이</div>
              <Pill tone="neutral">일별</Pill>
            </div>
            <div style={{ height: 180 }}>
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.BarChart data={days} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <Recharts.CartesianGrid stroke="#F1F3F5" vertical={false}/>
                  <Recharts.XAxis dataKey="d" axisLine={false} tickLine={false} fontSize={10}/>
                  <Recharts.YAxis axisLine={false} tickLine={false}/>
                  <Recharts.Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E5EA" }}/>
                  <Recharts.Bar dataKey="kwh" fill="#06B6A2" radius={[4, 4, 0, 0]}/>
                </Recharts.BarChart>
              </Recharts.ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Two-column: inverter + recent settlements */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 12 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>인버터 상태</div>
            {[
              { lbl: "효율", val: b.eff.toFixed(1) + "%", color: sevColor },
              { lbl: "온도", val: b.status === "alert" ? "84.2°C" : "42.1°C", color: b.status === "alert" ? "#F43F5E" : "#0E1116" },
              { lbl: "DC 전압", val: "612 V", color: "#0E1116" },
              { lbl: "AC 전류", val: "38.4 A", color: "#0E1116" },
              { lbl: "마지막 점검", val: "2026-03-12", color: "#6B7280" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid #F4F5F7" : "none", fontSize: 12.5 }}>
                <span style={{ color: "#6B7280" }}>{row.lbl}</span>
                <span className="num" style={{ fontWeight: 700, color: row.color }}>{row.val}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>최근 정산 이력</div>
              <span style={{ fontSize: 11, color: "#9AA0AB" }}>최근 5건 / 14,247건</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 60px 80px 60px", padding: "0 0 8px", fontSize: 10.5, color: "#9AA0AB", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--line)" }}>
              <span>시각</span><span>kWh</span><span style={{ textAlign: "right" }}>SMP</span><span style={{ textAlign: "right" }}>매출</span><span style={{ textAlign: "right" }}>상태</span>
            </div>
            {recent.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr 60px 80px 60px", padding: "9px 0", borderBottom: i < recent.length - 1 ? "1px solid #F4F5F7" : "none", fontSize: 12, alignItems: "center" }}>
                <span className="mono" style={{ color: "#9AA0AB", marginRight: 14 }}>{r.ts}</span>
                <span className="num" style={{ fontWeight: 600 }}>{r.kwh.toFixed(2)} kWh</span>
                <span className="num" style={{ textAlign: "right", color: "#6B7280" }}>{r.smp}원</span>
                <span className="num" style={{ textAlign: "right", fontWeight: 700 }}>{r.won.toFixed(1)}원</span>
                <span style={{ textAlign: "right" }}><Pill tone="green" dot>확정</Pill></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

window.BuildingDetail = BuildingDetail;
