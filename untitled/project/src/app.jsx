// App composition with modal state
const { useState, createContext, useContext } = React;

const ModalCtx = createContext({});
window.useLuciaModals = () => useContext(ModalCtx);

function App() {
  const [tab, setTab] = useState("개요");
  const [building, setBuilding] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [showTamper, setShowTamper] = useState(false);

  const ctx = {
    openBuilding: (b) => setBuilding(b),
    openReport: () => setShowReport(true),
    openTamper: () => setShowTamper(true)
  };

  return (
    <ModalCtx.Provider value={ctx}>
      <div className="app-shell">
        <Topbar tab={tab} setTab={setTab} />

        <div style={{ padding: "24px 28px 60px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 6, fontWeight: 500 }}>안녕하세요, 김지호 처장님</div>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>LH옥상 사이트-A, 오늘도 잘 발전 중입니다

              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 13, color: "#6B7280" }}>
                <span>2026년 4월 30일 (목) · 14:24 KST</span>
                <span style={{ color: "#E2E5EA" }}>·</span>
                <span>현재 발전 중 <span className="num" style={{ color: "#047857", fontWeight: 700 }}>112동</span></span>
                <span style={{ color: "#E2E5EA" }}>·</span>
                <span>일조 양호 · 25.4°C</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#fff", border: "1px solid var(--line-2)",
                padding: "8px 14px", borderRadius: 999, height: 40
              }}>
                {Icons.Clock}
                <span style={{ fontSize: 12.5, color: "#6B7280" }}>기간</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>2026년 4월</span>
                {Icons.Caret}
              </div>
              <Btn variant="secondary" icon={Icons.Lock} onClick={() => setShowTamper(true)}>변조 시도 데모</Btn>
              <Btn variant="primary" icon={Icons.Doc} onClick={() => setShowReport(true)}>감사 보고서 생성</Btn>
            </div>
          </div>

          <StatsRow />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginTop: 16 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <GenerationCard />
              <SankeyCard />
              <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16 }}>
                <DistributionCard />
                <div style={{ display: "grid", gap: 16 }}>
                  <BlockchainCard />
                </div>
              </div>
              <BuildingsCard />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <RE100Card />
                <LoadTestCard />
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
              <Sidebar />
              <AnomalyCard />
              <ResidentCard />
            </div>
          </div>

          <div style={{ marginTop: 30, paddingTop: 18, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#9AA0AB" }}>
            <div style={{ display: "flex", gap: 16 }}>
              <span>FRD-2026-001 v1.0 · MVP 22/22</span>
              <span>Hyperledger Fabric 2.5 · Local Network</span>
              <span>KIE-REMS Lite · TheKIE Digital Platform</span>
            </div>
            <div className="mono">build 1.0.4 · 2026-04-30 · M+3 demo-ready</div>
          </div>
        </div>

        {building && <BuildingDetail building={building} onClose={() => setBuilding(null)} />}
        {showReport && <ReportModal onClose={() => setShowReport(false)} />}
        {showTamper && <TamperDemo onClose={() => setShowTamper(false)} />}
      </div>
    </ModalCtx.Provider>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);