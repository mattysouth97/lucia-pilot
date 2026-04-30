// Mock data for Lucia 정산 플랫폼
// Based on FRD-2026-001 — Uljin 116동 / 3MW

const TODAY = "2026-04-30";

// 시간대별 발전량 (kWh) — 실제 일조 패턴 (06~19시)
const HOURLY_GENERATION = [
  { h: "06", today: 18, avg: 16, smp: 92 },
  { h: "07", today: 142, avg: 128, smp: 95 },
  { h: "08", today: 410, avg: 382, smp: 102 },
  { h: "09", today: 760, avg: 720, smp: 108 },
  { h: "10", today: 1180, avg: 1090, smp: 114 },
  { h: "11", today: 1520, avg: 1440, smp: 119 },
  { h: "12", today: 1680, avg: 1610, smp: 124 },
  { h: "13", today: 1620, avg: 1580, smp: 128 },
  { h: "14", today: 1480, avg: 1490, smp: 131 },
  { h: "15", today: 1240, avg: 1280, smp: 136 },
  { h: "16", today: 920, avg: 980, smp: 142 },
  { h: "17", today: 540, avg: 610, smp: 148 },
  { h: "18", today: 210, avg: 260, smp: 138 },
  { h: "19", today: 32, avg: 48, smp: 122 },
];

// 가상공유거래 분배 — 41% 환원
const DISTRIBUTION = [
  { id: "lh", label: "LH 매입임대", households: 1643, ratio: 0.642, perHH: 6420, color: "#10B981" },
  { id: "kookmin", label: "국민임대", households: 280, ratio: 0.109, perHH: 7420, color: "#34D399" },
  { id: "energy", label: "에너지소외계층", households: 916, ratio: 0.358, perHH: 18195, color: "#06B6A2" },
];

// 116동 발전 랭킹 (상위 + 이상)
const BUILDINGS = [
  { id: "ULJN-001", region: "울진읍 읍남리", today: 142.6, capacity: 25.86, eff: 98.2, status: "ok", subsidy: 1643 },
  { id: "ULJN-002", region: "울진읍 읍남리", today: 138.1, capacity: 25.86, eff: 96.8, status: "ok", subsidy: 14 },
  { id: "ULJN-007", region: "근남면 행곡리", today: 136.4, capacity: 25.86, eff: 95.9, status: "ok", subsidy: 22 },
  { id: "ULJN-014", region: "근남면 산포리", today: 132.9, capacity: 25.86, eff: 94.1, status: "ok", subsidy: 19 },
  { id: "ULJN-023", region: "기성면 정명리", today: 128.7, capacity: 25.86, eff: 92.3, status: "ok", subsidy: 17 },
  { id: "ULJN-031", region: "온정면 외선미리", today: 124.0, capacity: 25.86, eff: 90.7, status: "ok", subsidy: 15 },
  { id: "ULJN-042", region: "후포면 후포리", today: 38.2, capacity: 25.86, eff: 32.4, status: "alert", subsidy: 21 },
  { id: "ULJN-058", region: "북면 부구리", today: 92.1, capacity: 25.86, eff: 78.6, status: "warn", subsidy: 18 },
  { id: "ULJN-073", region: "평해읍 평해리", today: 121.3, capacity: 25.86, eff: 89.4, status: "ok", subsidy: 16 },
  { id: "ULJN-089", region: "죽변면 죽변리", today: 116.8, capacity: 25.86, eff: 87.2, status: "ok", subsidy: 13 },
  { id: "ULJN-104", region: "원남면 매화리", today: 110.5, capacity: 25.86, eff: 84.0, status: "ok", subsidy: 12 },
  { id: "ULJN-116", region: "서면 광회리", today: 108.2, capacity: 25.86, eff: 82.1, status: "ok", subsidy: 11 },
];

// 블록체인 트랜잭션 라이브 스트림
const TX_STREAM = [
  { ts: "13:24:18", id: "0x7f3e…a92c", building: "ULJN-001", kwh: 1.23, type: "settle", amount: 146.4, block: 184729, status: "confirmed" },
  { ts: "13:24:14", id: "0x9b21…f04d", building: "ULJN-014", kwh: 1.18, type: "rec", amount: 99.1, block: 184728, status: "confirmed" },
  { ts: "13:24:09", id: "0x2c8a…1e7b", building: "ULJN-007", kwh: 1.34, type: "settle", amount: 159.5, block: 184727, status: "confirmed" },
  { ts: "13:24:03", id: "0x4d5f…b903", building: "ULJN-031", kwh: 0.98, type: "settle", amount: 116.6, block: 184726, status: "confirmed" },
  { ts: "13:23:58", id: "0xe102…7c4a", building: "ADMIN", kwh: null, type: "tamper", amount: null, block: null, status: "rejected" },
  { ts: "13:23:51", id: "0x8a44…d215", building: "ULJN-023", kwh: 1.09, type: "settle", amount: 129.7, block: 184725, status: "confirmed" },
  { ts: "13:23:45", id: "0x1f9c…502e", building: "ULJN-002", kwh: 1.21, type: "rec", amount: 101.6, block: 184724, status: "confirmed" },
  { ts: "13:23:39", id: "0x5b7d…ab38", building: "ULJN-104", kwh: 0.94, type: "settle", amount: 111.9, block: 184723, status: "confirmed" },
];

// 이상 감지
const ANOMALIES = [
  { id: "A-2406", building: "ULJN-042", type: "인버터 오류", since: "12:48", drop: -67.6, severity: "critical" },
  { id: "A-2405", building: "ULJN-058", type: "그늘 영향", since: "11:32", drop: -21.4, severity: "warn" },
  { id: "A-2404", building: "ULJN-091", type: "정산 지연", since: "10:15", drop: 0, severity: "info" },
];

// RE100 PPA
const RE100 = [
  { name: "SK하이닉스", logo: "SK", kwh: 142800, target: 180000, premium: 20, color: "#E5340B" },
  { name: "삼성전자", logo: "SS", kwh: 98200, target: 150000, premium: 18, color: "#1428A0" },
  { name: "네이버", logo: "N", kwh: 64500, target: 80000, premium: 15, color: "#03C75A" },
  { name: "기아", logo: "Kia", kwh: 41200, target: 60000, premium: 16, color: "#05141F" },
];

// 부하 테스트 결과
const LOAD_TEST = [
  { scale: "116동", buildings: 116, settleMs: 1240, dashMs: 890, tps: 142 },
  { scale: "1,000동", buildings: 1000, settleMs: 1840, dashMs: 1320, tps: 148 },
  { scale: "5,000동", buildings: 5000, settleMs: 3120, dashMs: 2410, tps: 151 },
  { scale: "9,354동", buildings: 9354, settleMs: 4680, dashMs: 2940, tps: 156 },
];

// Sankey 노드/링크
const SANKEY = {
  nodes: [
    { id: "gen", label: "발전수익", group: "src" },
    { id: "smp", label: "SMP 매출", group: "rev" },
    { id: "rec", label: "REC 매출", group: "rev" },
    { id: "subsidy", label: "주거비 환원 41%", group: "mid" },
    { id: "om", label: "O&M·SaaS 9%", group: "mid" },
    { id: "spc", label: "SPC 적립 50%", group: "mid" },
    { id: "lh", label: "LH 매입임대 1,643", group: "dst" },
    { id: "kookmin", label: "국민임대 280", group: "dst" },
    { id: "energy", label: "에너지소외 916", group: "dst" },
    { id: "thekie", label: "TheKIE", group: "dst" },
    { id: "om2", label: "O&M 운영", group: "dst" },
    { id: "spc2", label: "SPC 자본", group: "dst" },
  ],
};

// 28개 정산 항목 — 1 kWh 분해
const SETTLEMENT_BREAKDOWN = [
  { label: "SMP 매출", value: 119, type: "income", code: "S-002" },
  { label: "REC 발급 (×1.2)", value: 100.8, type: "income", code: "S-003" },
  { label: "PPA 프리미엄", value: 20, type: "income", code: "S-010" },
  { label: "K-ETS 적립", value: 8.2, type: "income", code: "S-011" },
  { label: "주거비 환원 (LH)", value: -64.2, type: "out", code: "S-004" },
  { label: "주거비 환원 (국민임대)", value: -10.9, type: "out", code: "S-004" },
  { label: "주거비 환원 (소외)", value: -35.8, type: "out", code: "S-004" },
  { label: "Lucia SaaS 수수료", value: -1.65, type: "out", code: "S-005" },
  { label: "거래수수료", value: -2.1, type: "out", code: "S-006" },
];

window.LUCIA_DATA = {
  TODAY,
  HOURLY_GENERATION,
  DISTRIBUTION,
  BUILDINGS,
  TX_STREAM,
  ANOMALIES,
  RE100,
  LOAD_TEST,
  SANKEY,
  SETTLEMENT_BREAKDOWN,
};
