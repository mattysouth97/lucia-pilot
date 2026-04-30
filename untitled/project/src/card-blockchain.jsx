// 블록체인 라이브 트랜잭션 스트림
const BlockchainCard = () => {
  const txs = window.LUCIA_DATA.TX_STREAM;
  const { openBuilding } = window.useLuciaModals();
  const [tps, setTps] = React.useState(142);
  React.useEffect(() => {
    const t = setInterval(() => setTps(140 + Math.floor(Math.random() * 20)), 1500);
    return () => clearInterval(t);
  }, []);

  const typeMap = {
    settle: { label: "정산", tone: "green" },
    rec: { label: "REC", tone: "indigo" },
    tamper: { label: "변조시도", tone: "rose" },
  };

  return (
    <div className="card" style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: 999, background: "#10B981" }}/>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#047857" }}>Hyperledger Fabric · LIVE</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em" }}>블록체인 원장 라이브</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>변조 불가 · 모든 정산 영구 기록</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{tps}<span style={{ fontSize: 11, color: "#9AA0AB", fontWeight: 500, marginLeft: 4 }}>TPS</span></div>
          <div className="mono" style={{ fontSize: 11, color: "#9AA0AB" }}>blk #184,729</div>
        </div>
      </div>

      {/* tx list */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {txs.map((tx, i) => {
          const meta = typeMap[tx.type];
          const rejected = tx.status === "rejected";
          return (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "60px auto 1fr auto auto",
              alignItems: "center", gap: 10,
              padding: "10px 0",
              borderBottom: i < txs.length - 1 ? "1px solid #F4F5F7" : "none",
              opacity: rejected ? 1 : 1,
            }} className={i === 0 ? "flow-in" : ""}>
              <span className="mono" style={{ fontSize: 10.5, color: "#9AA0AB" }}>{tx.ts}</span>
              <Pill tone={meta.tone} dot={!rejected}>{rejected ? "✕ " + meta.label : meta.label}</Pill>
              <div style={{ minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 11, color: rejected ? "#BE123C" : "#0E1116", fontWeight: 600 }}>
                  {tx.id}
                </div>
                <div style={{ fontSize: 10.5, color: "#9AA0AB", marginTop: 1 }}>
                  {rejected ? "어드민 변경 시도 · 해시 불일치 · 자동 거부" : `${tx.building} · ${tx.kwh} kWh · block ${tx.block}`}
                </div>
              </div>
              <span className="num" style={{ fontSize: 12.5, fontWeight: 700, color: rejected ? "#BE123C" : "#0E1116", textAlign: "right" }}>
                {rejected ? "REJECTED" : `${tx.amount.toFixed(1)}원`}
              </span>
              <span style={{ color: rejected ? "#BE123C" : "#10B981", display: "grid", placeItems: "center" }}>
                {rejected ? Icons.Cross : Icons.Check}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tamper alert banner */}
      <div onClick={() => openBuilding({ id: "ULJN-042", region: "후포면 후포리", today: 38.2, capacity: 25.86, eff: 32.4, status: "alert", subsidy: 21 })} style={{
        marginTop: 12, padding: "10px 14px",
        background: "#FFF1F3", border: "1px solid #FFD9DF",
        borderRadius: 12,
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "#FECDD3", color: "#BE123C",
          display: "grid", placeItems: "center", flexShrink: 0,
        }}>{Icons.Lock}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#BE123C" }}>FR-S-008 · 변조 시도 1건 자동 거부</div>
          <div style={{ fontSize: 11, color: "#9F1239", marginTop: 1 }}>
            13:23:58 · admin@lucia · IP 10.0.4.21 · settlement_id 0x7c4a 변경 시도 → hash mismatch
          </div>
        </div>
        <Btn variant="secondary" size="sm">감사 로그</Btn>
      </div>
    </div>
  );
};

window.BlockchainCard = BlockchainCard;
