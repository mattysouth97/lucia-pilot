// apps/lucia-energy/src/copy.ts
// All Korean copy for the LuciaEnergy landing. Korean-only per spec Q4.
// i18n-safe structure: an _EN sibling can be added later without refactor.
//
// Hard rules (see apps/lucia-energy/CLAUDE.md):
//   - No MERIDIAN, LangGraph, or named-agent strings anywhere on the public surface.
//   - No 발전왕 by name — generalize to "기존 단일자산 솔루션".
//   - Korean-only.

export const NAV = {
  brand: 'Lucia · Energy',
  tabLh: 'LH 햇빛발전소',
  tabEnergy: 'LuciaEnergy',
  ctaInquiry: '사업 문의',
  ctaLogin: '로그인',
  menuItems: [
    { label: '발전소 연동하기', href: '#multi-asset-heading' },
    { label: '전력거래',       href: '#blockchain-heading' },
    { label: '매각중개',       href: '#inquiry-heading' },
  ] as ReadonlyArray<{ label: string; href: string }>,
} as const;

export const HERO = {
  overline: 'LUCIA ENERGY · 통합 DER 플랫폼',
  headlineLine1: '사람 손 없이도,',
  headlineLine2: '발전소는 멈추지 않습니다.',
  sub:
    'AI가 24시간 자동 수행하는 8개 운영 영역 — 발전량 예측·이상 탐지·매전 입찰·정산까지.',
  ctaPrimary: '사업 문의하기',
  ctaSecondary: '차별화 살펴보기',
} as const;

export const AUTOMATION_MATRIX = {
  heading: 'AI가 자동 수행하는 8개 운영 영역',
  cells: [
    { label: '발전량 예측',   desc: '기상 데이터 기반 단기·중기·장기 예측 (15분~12개월)' },
    { label: '이상 탐지',     desc: '모듈·스트링·인버터 단위 I-V 곡선 + 패턴 기반 자동 진단' },
    { label: '운영 워크오더', desc: '진단 결과 → 우선순위 자동 작성·배분' },
    { label: '매전 입찰',     desc: '전일·실시간·예비력 시장 96회 시나리오 입찰' },
    { label: '정산 자동화',   desc: 'SMP·REC·CP·예측정산금·CON/COFF 자동 계산' },
    { label: '탄소크레딧',    desc: 'Lucia 연동 발행·소각·온체인 거래' },
    { label: '햇빛연금 분배', desc: '주민조합 배당 자동 계산·증빙·원천징수' },
    { label: '보안 모니터링', desc: 'ISMS-P 통제 모니터링·이상행위 탐지' },
  ],
} as const;

export const MULTI_ASSET = {
  heading: '한 화면에서, 6대 자산을 한 정산 단위로',
  sub: 'PV에 국한된 단일자산 솔루션을 넘어, ESS·EV·히트펌프·소수력·연료전지까지 통합 운영합니다.',
  relevantPersonas: ['발전사업자', '자산관리자·EPC', '중개사업자'] as const,
  assets: [
    { label: 'PV (태양광)',  unit: 'MW',   standards: 'SunSpec Modbus · IEC 61850-7-420' },
    { label: 'ESS (저장)',   unit: 'MWh',  standards: 'IEC 61850-7-420 · DNP3' },
    { label: 'EV 충전기',    unit: '기',    standards: 'OCPP 1.6 / 2.0.1' },
    { label: '히트펌프',      unit: 'kW',   standards: 'BACnet · MQTT 5.0' },
    { label: '소수력',       unit: 'kW',   standards: 'IEC 61850-7-420' },
    { label: '연료전지',     unit: 'kW',   standards: 'IEC 61850-7-420 · DNP3' },
  ],
} as const;

export const BLOCKCHAIN = {
  heading: '발전소가 블록체인 위에서 정산됩니다',
  sub: 'SMP·REC·햇빛연금·자발적 탄소크레딧을 Lucia(TON 기반) 위에서 자동 토큰화·분배합니다.',
  relevantPersonas: ['발전사업자', '기업 RE100', '주민조합원'] as const,
  bullets: [
    'CxNFT — 톤(tCO₂eq) 단위 자발적 탄소크레딧 자동 발행·소각',
    '햇빛연금 — 주민조합 배당 권리를 토큰화해 자동 분배',
    'MRV 자동화 — IoT 센서→해시 인덱싱 (ISO 14064-2 / Verra VM0007 호환 설계)',
    'LEO Wallet 연동 — KYC Level 2+ 사용자만 거래·보유',
  ],
} as const;

export const PUBLIC_CITIZEN = {
  heading: '공공이 도입할 수 있는, 시민이 참여하는 플랫폼',
  sub: '영광군 햇빛연금부터 정부 5,500억원·500개소 확대 계획까지, 시민·공공 친화 기능을 표준 탑재합니다.',
  relevantPersonas: ['공공발주처', '주민조합원', '발전사업자'] as const,
  pillars: [
    {
      title: '햇빛연금 자동분배',
      body:
        '영광군 2024년 82억원 분배 모델을 표준 모듈로. 정부 5,500억원·500개소 확대 계획(2030, 2025.11.16 국무회의 보고)에 즉시 대응.',
    },
    {
      title: 'ISMS-P · CSAP-Hi · 망분리',
      body:
        'ISMS-P 101개 통제 기준 충족, 공공 발주 대비 CSAP 표준등급/상등급(Hi) 옵션, 사무망/인터넷망 분리 옵션.',
    },
    {
      title: '누리장터 즉시 등재',
      body:
        'KONEPS(나라장터) BEMS 통합사건대장 등재 준비 완료. 지자체 채택 즉시 발주 가능.',
    },
  ],
} as const;

export const STANDARDS = {
  heading: '국제·국내 표준 호환',
  items: [
    'SunSpec Modbus',
    'IEC 61850-7-420',
    'DNP3',
    'OCPP 1.6 / 2.0.1',
    'MQTT 5.0',
    'KPX e-Power Market API',
  ] as const,
  relevantPersonas: ['발전사업자', '자산관리자·EPC'] as const,
} as const;

export const ROADMAP = {
  heading: '단계별 구축 로드맵',
  phases: [
    { phase: 'Phase 0', period: '2026.06~08',         focus: '프리스탠더',          kpi: '내부 PoC',           aspirational: false },
    { phase: 'Phase 1', period: '2026.09~2027.03',    focus: 'MVP — 모니터링·예측·O&M·정산', kpi: '1,000개소 · 0.3 GW',    aspirational: true },
    { phase: 'Phase 2', period: '2027.04~2027.10',    focus: 'VPP·입찰',            kpi: 'KPX 등록·운영',      aspirational: true },
    { phase: 'Phase 3', period: '2027.11~2028.04',    focus: 'Lucia 블록체인 연동',  kpi: 'CxNFT · 햇빛연금 자동분배', aspirational: true },
    { phase: 'Phase 4', period: '2028.05~2028.12',    focus: '공공·다중자산',         kpi: '30,000개소 · 5 GW · 500억 ARR', aspirational: true },
    { phase: 'Phase 5', period: '2029~',              focus: '글로벌',              kpi: '60,000개소 · 12 GW · 1,500억 ARR', aspirational: true },
  ],
  asteriskLabel: '*목표치',
  asteriskNote: '* Phase 1 이후 KPI는 목표치이며, 실제 달성치는 분기별로 갱신 공시합니다.',
} as const;

export const COMPARISON = {
  heading: '기존 단일자산 솔루션 vs LuciaEnergy 차세대 통합 플랫폼',
  legacyHeader: '기존 단일자산 솔루션',
  nextHeader: 'LuciaEnergy',
  rows: [
    { dim: '자산 종류',     legacy: 'PV 단일',                  next: 'PV · ESS · EV · 히트펌프 · 소수력 · 연료전지' },
    { dim: 'AI 엔진',       legacy: '평균·이상 비교 + 통계',     next: 'AI 자동화 — 8개 운영 영역 동시 수행' },
    { dim: '예측 모델',     legacy: '단일 알고리즘',             next: '앙상블(통계+ML+물리기반)' },
    { dim: '이상 탐지',     legacy: '임계치 기반',              next: '모듈/스트링 I-V 곡선 + Edge AI' },
    { dim: '결제·정산',     legacy: 'SMP/REC 조회',             next: 'Lucia 온체인 정산 · CxNFT 토큰화 · 스마트 컨트랙트 자동집행' },
    { dim: 'VPP 참여',      legacy: '연동 단계',                next: '입찰 · 실시간 시장 · 예비력 · DR Plus 통합' },
    { dim: '시민참여',      legacy: '미지원',                    next: '햇빛연금 자동배당 · 주민조합 거버넌스 토큰' },
    { dim: '공공 적합성',  legacy: '민간 SaaS',                 next: 'ISMS-P · CSAP-Hi · 망분리 · 온프레미스 옵션' },
  ],
} as const;

export const SECURITY = {
  heading: '보안·인증',
  items: [
    { name: 'ISMS-P',       desc: '101개 통제 기준 충족 — 관리체계·보호대책·개인정보 처리단계' },
    { name: 'CSAP (Hi)',   desc: '공공 발주 대비 클라우드보안인증 표준/상등급 옵션' },
    { name: 'IEC 62443',    desc: 'OT 운영기술 보안 (산업용 제어시스템)' },
    { name: 'IEC 62351',    desc: '전력시스템 사이버보안' },
    { name: '망분리',         desc: '사무망/인터넷망 분리 + 일방향 데이터 전송(Diode) 옵션' },
    { name: 'EU CRA',        desc: 'Cyber Resilience Act 대응 게이트웨이' },
  ] as const,
} as const;

export const INQUIRY = {
  heading: '지금 사업 문의를 시작하세요',
  buyer: {
    title: '전기구매자 문의',
    sub: '검증된 햇빛 전기, 자동 정산으로. RE100 가입·직접 PPA·REC 매입 라우팅.',
    defaultPersona: 'corporate_re100' as const,
  },
  generator: {
    title: '발전사업자 문의',
    sub: '옥상이 매출이 됩니다. 운영은 AI에게. 운영 위탁·자산 매각·다중자산 통합.',
    defaultPersona: 'generator' as const,
  },
  fields: {
    company: '회사명',
    contact: '담당자',
    email: '이메일',
    phone: '전화',
    persona: '구분',
    interests: '관심분야 (복수선택 가능)',
    message: '자유 메시지 (선택)',
    consent: '개인정보 처리에 동의합니다.',
    submit: '문의 접수',
    sending: '전송 중…',
    success: '문의가 접수되었습니다. ops@lucia.kr 또는 전화로 별도 회신드립니다.',
    fallbackMailto: 'mailto:hello@lucia.kr?subject=LuciaEnergy 문의',
    fallbackMailtoLabel: '메일로 보내기',
    errorPrefix: '전송 실패',
  },
  // Critic Blocker 1 fix: '주민조합원·아파트 입주자' was a label-vs-chip drift.
  // Section chip arrays use '주민조합원'; we now use the same shorter label here
  // so dropdown ↔ chip ↔ URL hash all agree.
  personaLabels: {
    generator: '발전사업자',
    asset_manager: '자산관리자·EPC',
    resident: '주민조합원',
    broker: '중개사업자',
    public_procurer: '공공발주처',
    corporate_re100: '기업 RE100',
    other: '기타',
  } as const,
  interestLabels: {
    rec_purchase: 'REC 매입',
    ppa: 'PPA 체결',
    operations_outsource: '발전소 운영 위탁',
    asset_sale: '자산 매각·M&A',
    haetbit_pension: '햇빛연금',
    public_procurement: '공공발주',
    multi_asset: '다중자산 통합 운영',
    other: '기타',
  } as const,
} as const;

export const FOOTER = {
  copyright: '© 2026 Lucia. 본 페이지는 사업 소개용이며 투자 권유가 아닙니다.',
} as const;
