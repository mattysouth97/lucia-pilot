// apps/web/src/routes/Invest/copy.ts
// All user-facing Korean strings for /invest. Keep terse; legal owns final 약관 / 위험 고지 / 면책 wording.

export const HERO_OVERLINE = 'LUCIA · LH 매입임대 햇빛발전소 정산 기반 금융상품';
export const HERO_TITLE = '햇빛으로 받는, 투명한 정기 수익.';
export const HERO_SUB =
  '한국토지주택공사 매입임대주택 옥상 발전소의 SMP/REC 정산 수익을 블록체인으로 검증하고 투자자에게 분배합니다.';

export const CTA_PRIMARY = '투자하기';
export const CTA_SECONDARY = '운영 발전소 보기';

export const IMPACT_OVERLINE = '정산 구조에 내장된 사회적 환원';
export const IMPACT_HEADLINE_LINE_1 = '발전 수익의 41%는 공익 목적으로 자동 분배되며,';
export const IMPACT_HEADLINE_LINE_2 = '그중 35.8%는 에너지소외 가구로 환원됩니다.';
export const IMPACT_DETAIL_LINK = '정산 분배 구조 자세히 보기';

export const HOW_IT_WORKS_OVERLINE = '정산엔진의 작동 방식';
export const HOW_IT_WORKS_STEPS: ReadonlyArray<{ index: number; title: string; body: string }> = [
  { index: 1, title: '예치', body: '본인인증 후 투자금을 입금합니다.' },
  { index: 2, title: '정산엔진 자동 분배', body: '116동 발전소 풀에 가상공유거래 41%가 자동 적용됩니다.' },
  { index: 3, title: 'SMP/REC 자동 수익', body: 'Hyperledger 검증을 거쳐 월 정산이 지급됩니다.' },
];

export const RIBBON_OVERLINE = '실시간 정산 원장 — 라이브';
export const RIBBON_LINK = '전체 원장 보기';
export const RIBBON_STATUS_LIVE = '라이브';
export const RIBBON_STATUS_CONNECTING = '연결 중';
export const RIBBON_STATUS_SNAPSHOT = (capturedAt: string) => `스냅샷 · ${capturedAt} 기준`;

export const STATIONS_TITLE = '운영 발전소';
export const STATIONS_SUB = '원하는 발전소를 직접 지정해 투자할 수도 있습니다.';
export const STATIONS_FILTER = { all: '전체', ok: '가동중', maintenance: '점검' } as const;
export const STATIONS_VIEW_ALL = '전체 116동 보기';
export const STATIONS_INVEST_CTA = '지정 투자';
export const STATIONS_STATUS_LABEL = { ok: '가동중', maintenance: '점검' } as const;

export const TRUST_TITLE = '왜 Lucia인가';
export const TRUST_TILES: ReadonlyArray<{
  iconKind: 'hyperledger' | 'lh' | 'registration' | 'audit';
  title: string;
  body: string;
}> = [
  { iconKind: 'hyperledger', title: 'Hyperledger Fabric 블록체인', body: '모든 정산 거래는 변조 불가능한 블록체인에 기록됩니다.' },
  { iconKind: 'lh', title: 'LH 공공임대 backed', body: '한국토지주택공사 매입임대주택 옥상 자산을 기반으로 합니다.' },
  { iconKind: 'registration', title: '정부 등록', body: '온라인투자연계금융업 등록 절차를 진행하고 있습니다.' },
  { iconKind: 'audit', title: '회계 검증', body: '분기별로 회계법인 검증 보고서를 발행합니다.' },
];

export const RISK_TITLE = '투자 위험 고지';
export const RISK_BULLETS: ReadonlyArray<string> = [
  '원금 손실의 위험이 있습니다.',
  'SMP/REC 가격 변동에 따라 수익률이 달라집니다.',
  '발전소 가동 중단 시 수익이 일시 정지될 수 있습니다.',
  '본 상품은 예금자보호 대상이 아닙니다.',
];
export const RISK_FULL_LINK = '전체 위험 고지 보기';

export const FAQ_TITLE = '자주 묻는 질문';
export const FAQ_ITEMS: ReadonlyArray<{ question: string; answer: string }> = [
  {
    question: '투자금은 어떻게 회수되나요?',
    answer:
      '월별 SMP/REC 정산 수익이 자동 분배되며, 약정 기간 종료 시 원금 잔액이 정산됩니다. 가격 변동에 따라 수익률은 변동할 수 있습니다.',
  },
  {
    question: 'Hyperledger 기반 검증은 어떻게 작동하나요?',
    answer:
      '발전·정산·분배 거래는 Hyperledger Fabric 체인에 기록되며, 각 거래의 해시는 사후에 검증 가능합니다. 변조 시도는 체인 노드 검증 단계에서 거부됩니다.',
  },
  {
    question: '41% 환원이란 무엇인가요?',
    answer:
      '발전 수익의 41%는 공익 목적으로 자동 분배되며, LH 매입임대(64.2%) · 국민임대(10.9%) · 에너지소외(35.8%) 비율로 정산엔진이 적용합니다. 자세한 분배 구조는 별도 문서를 참고하세요.',
  },
  {
    question: '최소 투자 금액과 투자 기간은 어떻게 되나요?',
    answer: '최소 투자 금액 및 약정 기간은 상품별로 상이합니다. 투자 페이지에서 상품별 약관을 확인하시기 바랍니다.',
  },
  {
    question: '세금은 어떻게 처리되나요?',
    answer:
      '분배 수익은 「소득세법」에 따라 원천징수 후 지급됩니다. 정확한 세무 처리는 개별 투자자의 상황에 따라 다를 수 있으니 세무 전문가의 자문을 권장합니다.',
  },
];

export const PRE_FOOTER_HEADLINE = '투명하게 검증되는 햇빛 수익을 지금 시작해보세요.';
export const PRE_FOOTER_LOGIN_LINK = '이미 회원이신가요? 로그인';

export const FOOTER_COLUMNS: ReadonlyArray<{
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}> = [
  {
    title: '회사 정보',
    links: [
      { label: '사업자등록번호: XXX-XX-XXXXX', href: '#' },
      { label: '대표이사: (placeholder)', href: '#' },
      { label: '주소: (placeholder)', href: '#' },
    ],
  },
  {
    title: '법적 고지',
    links: [
      { label: '이용약관', href: '/invest/disclosures/terms' },
      { label: '개인정보처리방침', href: '/invest/disclosures/privacy' },
      { label: '위험 고지', href: '/invest/disclosures/risk' },
    ],
  },
  {
    title: '자료실',
    links: [
      { label: '백서 (PDF)', href: '#' },
      { label: '감사보고서', href: '#' },
      { label: '월간 정산 리포트', href: '#' },
    ],
  },
  {
    title: '문의',
    links: [
      { label: 'hello@lucia.kr', href: 'mailto:hello@lucia.kr' },
      { label: '02-XXX-XXXX', href: 'tel:02XXXXXXX' },
    ],
  },
];

export const FOOTER_COPYRIGHT = '© 2026 Lucia. 본 상품은 원금이 보장되지 않습니다.';
export const FOOTER_REGULATORY = '온라인투자연계금융업 등록번호 — 등록 절차 진행 중 (placeholder)';

export const NAV_ITEMS: ReadonlyArray<{ label: string; href: string }> = [
  { label: '상품 소개', href: '#hero' },
  { label: '운영 발전소', href: '#stations' },
  { label: '신뢰', href: '#trust' },
  { label: '자료', href: '/invest/disclosures' },
];
export const NAV_LOGIN = '로그인';
