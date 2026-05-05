// FR-R-005 — Retail (개인) LOI HTML template.
// Simplified vs RE100; carries the mandatory non-binding disclaimer (FR-R-004 §banner).

import { type LOIDocumentInput, esc, formatDateKR, formatKRW } from './types.js';

const NON_BINDING_NOTICE =
  '본 의향서는 비구속력(non-binding)이며, 출자 약정이 아닙니다. ' +
  '실제 출자 시 자본시장법에 따른 적격투자자 검증과 적정성 평가가 별도로 진행됩니다.';

export function renderRetailTemplate(input: LOIDocumentInput): string {
  const { loi, investor, siteLabels } = input;
  if (investor.type !== 'retail') {
    throw new Error(`renderRetailTemplate: investor.type must be 'retail', got ${investor.type}`);
  }
  const issuedAt = input.issuedAt ?? loi.created_at;

  const motivations =
    investor.investment_motivations.length === 0
      ? '미지정'
      : investor.investment_motivations
          .map((m) => MOTIVATION_LABEL[m])
          .join(', ');

  const sites = siteLabels.map((s, i) => `<li>${esc(s)} <span class="muted">(#${i + 1})</span></li>`).join('\n        ');

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>출자 관심 표명서 — ${esc(investor.individual_name)} (${esc(loi.id)})</title>
  <style>
    @page { size: A4; margin: 24mm 20mm; }
    body { font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
           color: #0a0c0f; line-height: 1.55; max-width: 720px; margin: 24px auto; padding: 0 16px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 24px 0 8px; border-bottom: 1px solid #d8dbe0; padding-bottom: 4px; }
    .meta { color: #6b7280; font-size: 12px; margin-bottom: 28px; }
    .banner { padding: 12px 14px; background: #fef3c7; border-left: 4px solid #d97706;
              font-size: 13px; color: #78350f; margin-bottom: 24px; border-radius: 4px; }
    .banner strong { display: block; margin-bottom: 4px; }
    .field { display: grid; grid-template-columns: 140px 1fr; gap: 8px; margin: 6px 0; font-size: 13px; }
    .field b { color: #374151; font-weight: 600; }
    .num { font-variant-numeric: tabular-nums; }
    ul.sites { margin: 8px 0 0 18px; padding: 0; }
    ul.sites li { margin: 4px 0; font-size: 13px; }
    .muted { color: #9ca3af; }
    .clauses { font-size: 12.5px; color: #1f2937; }
    .clauses p { margin: 8px 0; }
    .signature { margin-top: 36px; display: grid; grid-template-columns: 1fr 220px; gap: 24px; }
    .stamp { border: 1px dashed #9ca3af; padding: 16px; min-height: 80px; text-align: center;
             color: #6b7280; font-size: 12px; }
    .nonbinding { margin-top: 24px; padding: 14px; background: #fff1f2; border-left: 4px solid #dc2626;
                  font-size: 12.5px; color: #7f1d1d; border-radius: 4px; font-weight: 500; }
    @media print { body { max-width: none; margin: 0; } }
  </style>
</head>
<body>
  <header>
    <h1>출자 관심 표명서 (Non-binding LOI)</h1>
    <div class="meta">
      <span>문서 ID: <span class="num">${esc(loi.id)}</span></span> ·
      <span>발행일: ${formatDateKR(issuedAt)}</span> ·
      <span>구분: 개인 (Retail)</span>
    </div>
  </header>

  <div class="banner" role="alert">
    <strong>⚠️ 비구속력 의향 표명 단계입니다.</strong>
    실제 출자는 자본시장법에 따른 적격투자자 검증·적정성 평가 이후 가능합니다 (Phase 2 예정).
  </div>

  <h2>1. 출자자 정보</h2>
  <div class="field"><b>성명</b><span>${esc(investor.individual_name)}</span></div>
  <div class="field"><b>연락처</b><span class="num">${esc(investor.contact.phone)}</span></div>
  <div class="field"><b>이메일</b><span class="num">${esc(investor.contact.email)}</span></div>
  <div class="field"><b>투자 동기</b><span>${esc(motivations)}</span></div>

  <h2>2. 관심 사이트 (총 ${siteLabels.length}개)</h2>
  <ul class="sites">
        ${sites}
      </ul>

  <h2>3. 관심 출자 조건</h2>
  <div class="field"><b>관심 출자액</b><span class="num">${formatKRW(loi.capex_won)}</span></div>
  <div class="field"><b>희망 기간</b><span class="num">${loi.terms.years}년</span></div>
  <div class="field"><b>자기자본 비율</b><span class="num">${loi.terms.equity_ratio_pct}%</span></div>
  <div class="field"><b>예상 연 수익률</b><span class="num">${loi.terms.expected_yield_pct.toFixed(2)}%</span></div>
  <div class="field"><b>상태</b><span>${esc(loi.status)}</span></div>

  <h2>4. 안내</h2>
  <div class="clauses">
    <p>본 의향서는 출자자가 LH 매입임대 햇빛발전소 사업에 대한 관심을 표명하기 위한
    문서입니다. TheKIE BD 팀이 본 표명을 검토 후 후속 컨택을 진행합니다.</p>
    <p>${esc(NON_BINDING_NOTICE)}</p>
  </div>

  <div class="signature">
    <div>
      <div class="field"><b>표명일</b><span>${esc(loi.signed_at ? formatDateKR(loi.signed_at) : '미서명')}</span></div>
      <div class="field"><b>서명 방식</b><span>SMS 인증 (Mock — Pilot v1.3)</span></div>
      <div class="field"><b>블록체인 hash</b><span class="num" style="font-size:10px">${loi.blockchain_hash ? esc(loi.blockchain_hash) : '미등록'}</span></div>
    </div>
    <div class="stamp">출자자 서명</div>
  </div>

  <div class="nonbinding">
    ${esc(NON_BINDING_NOTICE)}
  </div>
</body>
</html>`;
}

const MOTIVATION_LABEL: Record<'esg' | 'yield' | 'local_contribution' | 'other', string> = {
  esg: 'ESG 가치 부합',
  yield: '수익성',
  local_contribution: '지역 기여',
  other: '기타',
};
