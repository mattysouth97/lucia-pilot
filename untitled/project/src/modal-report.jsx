// 감사 보고서 PDF 미리보기 — Korean public-report style
const ReportModal = ({ onClose }) => {
  const [generating, setGenerating] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <Modal open={true} onClose={onClose} width={1100}>
      <div style={{ padding: "20px 26px 16px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFBFC" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#0E1116", color: "#fff", display: "grid", placeItems: "center" }}>{Icons.Doc}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>감사 보고서 생성 — 2026년 4월</div>
            <div style={{ fontSize: 11.5, color: "#6B7280" }}>FR-O-002 · LH ESG 경영실 양식 · 변조 불가 원장 첨부</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="secondary" size="sm" icon={Icons.Down}>PDF 다운로드</Btn>
          <Btn variant="primary" size="sm" icon={Icons.Share}>LH 회계 발송</Btn>
          <Btn variant="ghost" size="sm" onClick={onClose} icon={Icons.Cross}/>
        </div>
      </div>

      {/* Document preview */}
      <div style={{ padding: "24px 32px", background: "#E5E7EB", overflow: "auto", flex: 1 }}>
        {generating ? (
          <div style={{ height: 400, display: "grid", placeItems: "center", background: "#fff", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #ECFDF5", borderTopColor: "#10B981", borderRadius: 999, margin: "0 auto", animation: "spin 0.8s linear infinite" }}/>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600 }}>감사 보고서 생성 중…</div>
              <div style={{ fontSize: 11, color: "#9AA0AB", marginTop: 4 }}>116동 데이터 집계 · 블록체인 해시 검증 · PDF 렌더링</div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxWidth: 820, margin: "0 auto", padding: "44px 56px", fontSize: 11, color: "#000" }}>
            {/* Government-style header */}
            <div style={{ borderBottom: "3px double #000", paddingBottom: 14, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: "#666", letterSpacing: "0.1em" }}>문서번호: LH-ESG-2026-04-001</div>
                  <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>분류: 일반 · 보존 5년</div>
                </div>
                <div style={{ fontSize: 9, color: "#666", textAlign: "right" }}>
                  <div>2026년 4월 30일</div>
                  <div>한국토지주택공사 / TheKIE</div>
                </div>
              </div>
              <div style={{ textAlign: "center", margin: "18px 0 6px" }}>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.04em" }}>매입임대 햇빛발전소 정산 결과 보고서</div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>(울진 116동 / 3MW Pilot · 2026년 4월)</div>
              </div>
            </div>

            {/* Summary table */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, background: "#F0F0F0", padding: "5px 10px", borderLeft: "3px solid #000" }}>1. 정산 요약</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
                <tbody>
                  {[
                    ["발전 대상", "울진 매입임대 116동 (3,000 kWp)", "정산 기간", "2026-04-01 ~ 2026-04-30"],
                    ["총 발전량", "342,827 kWh", "총 매출 (SMP)", "32,356,400원"],
                    ["REC 적립", "1,422.4 REC × 1.2", "PPA 프리미엄", "6,936,540원"],
                    ["주거비 환원 (41%)", "13,266,360원", "환원 대상", "2,839세대"],
                    ["LH 매입임대 (1,643)", "8,510,925원 / 6,420원·세대", "국민임대 (280)", "1,445,632원 / 7,420원·세대"],
                    ["에너지소외 (916)", "3,309,803원 / 18,195원·세대", "TheKIE SaaS 수수료", "9,280,000원"],
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ background: "#F5F5F5", padding: "5px 10px", border: "1px solid #ccc", fontWeight: 600, width: "20%" }}>{row[0]}</td>
                      <td style={{ padding: "5px 10px", border: "1px solid #ccc" }}>{row[1]}</td>
                      <td style={{ background: "#F5F5F5", padding: "5px 10px", border: "1px solid #ccc", fontWeight: 600, width: "20%" }}>{row[2]}</td>
                      <td style={{ padding: "5px 10px", border: "1px solid #ccc" }}>{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Blockchain proof */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, background: "#F0F0F0", padding: "5px 10px", borderLeft: "3px solid #000" }}>2. 블록체인 무결성 증빙</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead>
                  <tr style={{ background: "#F5F5F5" }}>
                    <th style={{ padding: "5px 8px", border: "1px solid #ccc", fontWeight: 700 }}>일자</th>
                    <th style={{ padding: "5px 8px", border: "1px solid #ccc", fontWeight: 700 }}>블록</th>
                    <th style={{ padding: "5px 8px", border: "1px solid #ccc", fontWeight: 700 }}>트랜잭션 ID</th>
                    <th style={{ padding: "5px 8px", border: "1px solid #ccc", fontWeight: 700 }}>해시</th>
                    <th style={{ padding: "5px 8px", border: "1px solid #ccc", fontWeight: 700, textAlign: "right" }}>건수</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["2026-04-01", "182,140", "0xa14e…b9c2", "f7a2…3e91", "11,427"],
                    ["2026-04-08", "182,891", "0xc302…8d4f", "9b1c…8a30", "11,892"],
                    ["2026-04-15", "183,472", "0x52f8…a017", "4d8f…20b1", "11,304"],
                    ["2026-04-22", "184,108", "0x7f3e…a92c", "82c1…fe04", "11,651"],
                    ["2026-04-30", "184,729", "0x8a44…d215", "1e90…a3c8", "11,840"],
                  ].map((r, i) => (
                    <tr key={i}>
                      {r.map((c, j) => (
                        <td key={j} style={{ padding: "4px 8px", border: "1px solid #ddd", textAlign: j === 4 ? "right" : "left", fontFamily: j === 2 || j === 3 ? "monospace" : "inherit" }}>{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 9.5, color: "#666", marginTop: 6, lineHeight: 1.5 }}>
                ※ 본 기간 변조 시도 1건 발생 → 자동 거부 완료 (Tx 0xe102…7c4a, 2026-04-30 13:23:58, IP 10.0.4.21).<br/>
                ※ 모든 정산 트랜잭션은 Hyperledger Fabric 원장에 영구 보존되며, 본 보고서의 해시는 RFC 6920 표준을 따른다.
              </div>
            </div>

            {/* Stamp area */}
            <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end", gap: 30 }}>
              {["작성", "검토", "승인"].map((lbl, i) => (
                <div key={lbl} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>{lbl}</div>
                  <div style={{
                    width: 60, height: 60, borderRadius: 999,
                    border: i === 2 ? "2px solid #BE123C" : "1.5px solid #999",
                    color: i === 2 ? "#BE123C" : "#999",
                    display: "grid", placeItems: "center",
                    fontSize: i === 2 ? 14 : 11, fontWeight: 700,
                    transform: i === 2 ? "rotate(-8deg)" : "none",
                    background: i === 2 ? "#FFF1F3" : "#fff",
                  }}>
                    {i === 2 ? "승인" : ""}
                  </div>
                  <div style={{ fontSize: 9, color: "#666", marginTop: 4 }}>{["TheKIE DPC", "LH ESG 경영실", "LH 사장"][i]}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, fontWeight: 700, letterSpacing: "0.4em" }}>한국토지주택공사</div>
            <div style={{ borderTop: "1px solid #ccc", marginTop: 14, paddingTop: 8, fontSize: 9, color: "#888", textAlign: "center" }}>
              본 문서는 Lucia 블록체인 정산 플랫폼에서 자동 생성되었으며, FRD-2026-001 v1.0 기준 검증되었다 · 페이지 1 / 14
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

window.ReportModal = ReportModal;
