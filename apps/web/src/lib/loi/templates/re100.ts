// FR-R-005 — RE100 corporate LOI HTML template.
// Renders a self-contained HTML document (printable / hashable / iframe-displayable).

import { type LOIDocumentInput, esc, formatDateKR, formatKRW } from './types.js';

export function renderRE100Template(input: LOIDocumentInput): string {
  const { loi, investor, siteLabels } = input;
  if (investor.type !== 're100') {
    throw new Error(`renderRE100Template: investor.type must be 're100', got ${investor.type}`);
  }
  const issuedAt = input.issuedAt ?? loi.created_at;

  const sites = siteLabels.map((s, i) => `<li>${esc(s)} <span class="muted">(#${i + 1})</span></li>`).join('\n        ');

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>투자 의향서 — ${esc(investor.company_name)} (${esc(loi.id)})</title>
  <style>
    @page { size: A4; margin: 24mm 20mm; }
    body { font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
           color: #0a0c0f; line-height: 1.55; max-width: 720px; margin: 24px auto; padding: 0 16px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 15px; margin: 24px 0 8px; border-bottom: 1px solid #d8dbe0; padding-bottom: 4px; }
    .meta { color: #6b7280; font-size: 12px; margin-bottom: 28px; }
    .field { display: grid; grid-template-columns: 160px 1fr; gap: 8px; margin: 6px 0; font-size: 13px; }
    .field b { color: #374151; font-weight: 600; }
    .num { font-variant-numeric: tabular-nums; font-feature-settings: 'tnum'; }
    ul.sites { margin: 8px 0 0 18px; padding: 0; }
    ul.sites li { margin: 4px 0; font-size: 13px; }
    .muted { color: #9ca3af; }
    .clauses { font-size: 12.5px; color: #1f2937; }
    .clauses p { margin: 8px 0; }
    .signature { margin-top: 36px; display: grid; grid-template-columns: 1fr 220px; gap: 24px; }
    .stamp { border: 1px dashed #9ca3af; padding: 16px; min-height: 80px; text-align: center;
             color: #6b7280; font-size: 12px; }
    .disclaimer { margin-top: 24px; padding: 12px; background: #fff7ed; border-left: 3px solid #f59e0b;
                  font-size: 12px; color: #7c2d12; }
    @media print {
      body { max-width: none; margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <header>
    <h1>투자 의향서 (Letter of Intent)</h1>
    <div class="meta">
      <span>문서 ID: <span class="num">${esc(loi.id)}</span></span> ·
      <span>발행일: ${formatDateKR(issuedAt)}</span> ·
      <span>구분: RE100 기업 출자</span>
    </div>
  </header>

  <h2>1. 출자자 정보</h2>
  <div class="field"><b>회사명</b><span>${esc(investor.company_name)}</span></div>
  <div class="field"><b>사업자등록번호</b><span class="num">${esc(investor.business_registration_number)}</span></div>
  <div class="field"><b>담당자</b><span>${esc(investor.contact.name)}</span></div>
  <div class="field"><b>연락처</b><span class="num">${esc(investor.contact.phone)} · ${esc(investor.contact.email)}</span></div>
  <div class="field"><b>RE100 가입연도</b><span class="num">${investor.re100_joined_year}</span></div>
  <div class="field"><b>RE100 목표연도</b><span class="num">${investor.re100_target_year}</span></div>
  <div class="field"><b>연간 목표량</b><span class="num">${investor.target_re100_mwh_per_year.toLocaleString('ko-KR')} MWh</span></div>

  <h2>2. 출자 대상 사이트 (총 ${siteLabels.length}개 동)</h2>
  <ul class="sites">
        ${sites}
      </ul>

  <h2>3. 출자 조건</h2>
  <div class="field"><b>출자액</b><span class="num">${formatKRW(loi.capex_won)}</span></div>
  <div class="field"><b>출자 기간</b><span class="num">${loi.terms.years}년</span></div>
  <div class="field"><b>자기자본 비율</b><span class="num">${loi.terms.equity_ratio_pct}%</span></div>
  <div class="field"><b>예상 연 수익률</b><span class="num">${loi.terms.expected_yield_pct.toFixed(2)}%</span></div>
  <div class="field"><b>현재 상태</b><span>${esc(loi.status)}</span></div>

  <h2>4. 합의 조항</h2>
  <div class="clauses">
    <p>본 의향서는 ${esc(investor.company_name)}(이하 "출자자")가 TheKIE Digital Platform Center를
    통해 LH 매입임대 햇빛발전소 사업에 출자할 의향을 명시함을 목적으로 한다.</p>
    <p>출자자는 위 §3 출자 조건에 따라 §2의 사이트에 대한 출자 의사를 밝히며,
    실제 출자 절차는 TheKIE BD 팀의 후속 컨택과 SPC 설립 합의를 거쳐 확정된다.</p>
    <p>본 의향서는 RE100 인증서 발급 및 CBAM 대응을 위한 사전 자료로 활용될 수 있으며,
    출자자의 사전 동의 없이 본 문서를 제3자에게 공개하지 않는다.</p>
  </div>

  <div class="signature">
    <div>
      <div class="field"><b>서명일</b><span>${esc(loi.signed_at ? formatDateKR(loi.signed_at) : '미서명')}</span></div>
      <div class="field"><b>서명 방식</b><span>SMS 인증 (Mock — Pilot v1.3)</span></div>
      <div class="field"><b>블록체인 hash</b><span class="num" style="font-size:10px">${loi.blockchain_hash ? esc(loi.blockchain_hash) : '미등록'}</span></div>
    </div>
    <div class="stamp">출자자 서명·인</div>
  </div>

  <div class="disclaimer">
    본 LOI는 사전 출자 의향서이며, 실제 출자 약정은 SPC 설립 합의서 체결 시점에
    효력이 발생합니다. RE100 인증서 발급은 사이트 운영 개시 후 한국에너지공단의
    REC 발급 절차를 따릅니다.
  </div>
</body>
</html>`;
}
