// FR-R-003 / FR-R-004 v1.3 — Investor onboarding wizards.
//
// Two routes share the file:
//   /invest/onboarding/re100   — 5-step RE100 corporate onboarding (FR-R-003)
//   /invest/onboarding/retail  — 3-step retail individual onboarding (FR-R-004)
//
// Both end by calling registerSignedLOI() with the assembled Investor + LOI,
// then route the user to /invest/onboarding/done?id=<loi_id> for the
// confirmation screen.

import { BUILDINGS_NATIONWIDE, REGION_OFFICES } from '@lucia/contracts';
import type { Investor, LOI } from '@lucia/contracts/domain';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { registerSignedLOI } from '@/lib/loi';

// ---------------------------------------------------------------------------
// Wizard shell + step indicator (shared)
// ---------------------------------------------------------------------------

interface WizardShellProps {
  flow: 're100' | 'retail';
  steps: readonly string[];
  currentStep: number;
  children: React.ReactNode;
  onBack: () => void;
  onNext: () => void;
  isFinal: boolean;
  canAdvance: boolean;
  submitting?: boolean;
}

function WizardShell({
  flow,
  steps,
  currentStep,
  children,
  onBack,
  onNext,
  isFinal,
  canAdvance,
  submitting,
}: WizardShellProps): JSX.Element {
  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: 760, margin: '0 auto' }}>
      <header style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {flow === 're100' ? 'FR-R-003 · RE100 출자 의향 온보딩' : 'FR-R-004 · 개인 관심 표명 온보딩'}
        </div>
        <h1 style={{ fontSize: 26, margin: '4px 0 0', letterSpacing: '-0.02em' }}>
          {flow === 're100' ? 'RE100 기업 출자 신청' : '개인 관심 표명'}
        </h1>
      </header>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <div
        style={{
          marginTop: 20,
          background: '#fff',
          border: '1px solid var(--line, #e5e7eb)',
          borderRadius: 8,
          padding: 24,
          minHeight: 280,
        }}
      >
        {children}
      </div>

      {flow === 'retail' && currentStep === 0 && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: '#fef3c7',
            borderLeft: '3px solid #f59e0b',
            fontSize: 12,
            color: '#78350f',
          }}
        >
          본 표명은 <strong>비구속력</strong> 의향 표명이며, 적격투자자 KYC·적정성 평가는 향후 단계에서 별도 진행됩니다.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={onBack}
          disabled={currentStep === 0 || submitting}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            color: 'var(--ink, #0a0c0f)',
            border: '1px solid var(--line, #e5e7eb)',
            borderRadius: 4,
            fontSize: 13,
            cursor: currentStep === 0 || submitting ? 'not-allowed' : 'pointer',
            opacity: currentStep === 0 ? 0.4 : 1,
          }}
        >
          ← 이전
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance || submitting}
          style={{
            padding: '10px 22px',
            background: canAdvance ? 'var(--ink, #0a0c0f)' : '#9ca3af',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            cursor: canAdvance && !submitting ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? '제출 중…' : isFinal ? '제출하기 →' : '다음 →'}
        </button>
      </div>
    </div>
  );
}

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: readonly string[];
  currentStep: number;
}): JSX.Element {
  return (
    <div style={{ display: 'flex', gap: 6 }} aria-label="단계 표시">
      {steps.map((label, i) => {
        const active = i === currentStep;
        const done = i < currentStep;
        return (
          <div
            key={label}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 4,
              background: done ? 'var(--ink, #0a0c0f)' : active ? '#fff' : '#f3f4f6',
              border: `1px solid ${active ? 'var(--ink, #0a0c0f)' : 'var(--line, #e5e7eb)'}`,
              color: done ? '#fff' : active ? 'var(--ink, #0a0c0f)' : '#9ca3af',
              fontSize: 11,
              fontWeight: active || done ? 700 : 500,
              textAlign: 'center',
            }}
          >
            <span style={{ marginRight: 4 }}>{i + 1}.</span>
            {label}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form primitives (shared)
// ---------------------------------------------------------------------------

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
        {label}
        {hint && <span style={{ color: '#6b7280', fontWeight: 400, marginLeft: 6 }}>· {hint}</span>}
      </span>
      {children}
      {error && (
        <span style={{ fontSize: 11, color: '#b91c1c' }}>{error}</span>
      )}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: '1px solid var(--line, #e5e7eb)',
  borderRadius: 4,
  fontSize: 13,
  fontFamily: 'inherit',
};

// Korean phone format check (matches Investor.contact.phone regex)
const PHONE_RE = /^(\+82|0)\d{1,3}-?\d{3,4}-?\d{4}$/;
const BRN_RE = /^\d{3}-\d{2}-\d{5}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// RE100 5-step wizard (FR-R-003)
// ---------------------------------------------------------------------------

interface RE100Form {
  // Step 0 — Company
  company_name: string;
  business_registration_number: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  // Step 1 — RE100
  re100_joined_year: number;
  re100_target_year: number;
  target_re100_mwh_per_year: number;
  // Step 2 — Investment
  capex_won: number;
  years: number;
  equity_ratio_pct: number;
  expected_yield_pct: number;
  preferred_regions: string[];
  selected_sites: string[];
  // Step 4 — Signature
  signature_phone: string;
  signature_code: string;
}

const RE100_STEPS = ['회사 정보', 'RE100 약속', '투자 조건', '검토', '서명·제출'] as const;

export function RE100Wizard(): JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialSite = params.get('site');

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<RE100Form>(() => ({
    company_name: '',
    business_registration_number: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    re100_joined_year: 2024,
    re100_target_year: 2050,
    target_re100_mwh_per_year: 1000,
    capex_won: 100_000_000,
    years: 20,
    equity_ratio_pct: 30,
    expected_yield_pct: 6.0,
    preferred_regions: [],
    selected_sites: initialSite ? [initialSite] : [],
    signature_phone: '',
    signature_code: '',
  }));

  const update = <K extends keyof RE100Form>(key: K, value: RE100Form[K]): void =>
    setForm((f) => ({ ...f, [key]: value }));

  const stepValid = useMemo<boolean>(() => {
    switch (step) {
      case 0:
        return (
          form.company_name.trim().length > 0 &&
          BRN_RE.test(form.business_registration_number) &&
          form.contact_name.trim().length > 0 &&
          PHONE_RE.test(form.contact_phone) &&
          EMAIL_RE.test(form.contact_email)
        );
      case 1:
        return (
          form.re100_joined_year >= 2014 &&
          form.re100_joined_year <= 2030 &&
          form.re100_target_year >= 2030 &&
          form.re100_target_year <= 2060 &&
          form.target_re100_mwh_per_year >= 0
        );
      case 2:
        return (
          form.capex_won > 0 &&
          form.years >= 1 &&
          form.years <= 30 &&
          form.equity_ratio_pct > 0 &&
          form.equity_ratio_pct <= 100 &&
          form.selected_sites.length > 0
        );
      case 3:
        return true;
      case 4:
        return PHONE_RE.test(form.signature_phone) && form.signature_code.length === 6;
      default:
        return false;
    }
  }, [step, form]);

  const onSubmit = async (): Promise<void> => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const now = new Date().toISOString();
      const investorId = `i-${Date.now().toString(36)}`;
      const investor: Investor = {
        id: investorId,
        type: 're100',
        company_name: form.company_name.trim(),
        business_registration_number: form.business_registration_number,
        contact: {
          name: form.contact_name.trim(),
          phone: form.contact_phone,
          email: form.contact_email,
        },
        target_re100_mwh_per_year: form.target_re100_mwh_per_year,
        re100_joined_year: form.re100_joined_year,
        re100_target_year: form.re100_target_year,
        preferred_regions: form.preferred_regions as never,
        expected_capex_range: {
          min_won: Math.round(form.capex_won * 0.8),
          max_won: Math.round(form.capex_won * 1.2),
        },
        created_at: now,
      };

      const loiId = `loi-${Date.now().toString(36)}`;
      const draft: LOI = {
        id: loiId,
        investor_id: investorId,
        sites: form.selected_sites,
        capex_won: form.capex_won,
        terms: {
          years: form.years,
          equity_ratio_pct: form.equity_ratio_pct,
          expected_yield_pct: form.expected_yield_pct,
        },
        status: 'draft',
        pdf_url: null,
        blockchain_hash: null,
        signed_at: null,
        is_non_binding: false,
        created_at: now,
        updated_at: now,
      };

      const siteLabels = form.selected_sites.map((id) => {
        const b = BUILDINGS_NATIONWIDE.find((x) => x.building_id === id);
        return b ? `${b.building_id} — ${b.region_office} ${b.city} ${b.district}` : id;
      });

      const result = await registerSignedLOI({
        input: { loi: draft, investor, siteLabels },
        signedAt: now,
      });

      navigate(`/invest/onboarding/done?id=${result.loi.id}&flow=re100`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '제출 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <WizardShell
      flow="re100"
      steps={RE100_STEPS}
      currentStep={step}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => {
        if (!stepValid) return;
        if (step === RE100_STEPS.length - 1) {
          void onSubmit();
        } else {
          setStep((s) => s + 1);
        }
      }}
      isFinal={step === RE100_STEPS.length - 1}
      canAdvance={stepValid}
      submitting={submitting}
    >
      {step === 0 && <RE100CompanyStep form={form} update={update} />}
      {step === 1 && <RE100Step form={form} update={update} />}
      {step === 2 && <InvestmentStep form={form} update={update} />}
      {step === 3 && <ReviewStep form={form} flow="re100" />}
      {step === 4 && <SignatureStep form={form} update={update} error={submitError} />}
    </WizardShell>
  );
}

function RE100CompanyStep({
  form,
  update,
}: {
  form: RE100Form;
  update: <K extends keyof RE100Form>(key: K, value: RE100Form[K]) => void;
}): JSX.Element {
  return (
    <div>
      <Field label="회사명">
        <input
          style={inputStyle}
          value={form.company_name}
          onChange={(e) => update('company_name', e.target.value)}
          placeholder="삼성전자 ESG팀"
        />
      </Field>
      <Field label="사업자등록번호" hint="형식: NNN-NN-NNNNN">
        <input
          style={inputStyle}
          value={form.business_registration_number}
          onChange={(e) => update('business_registration_number', e.target.value)}
          placeholder="124-81-12345"
        />
      </Field>
      <Field label="담당자 이름">
        <input
          style={inputStyle}
          value={form.contact_name}
          onChange={(e) => update('contact_name', e.target.value)}
          placeholder="김ESG"
        />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="전화번호" hint="031-784-2700">
          <input
            style={inputStyle}
            value={form.contact_phone}
            onChange={(e) => update('contact_phone', e.target.value)}
          />
        </Field>
        <Field label="이메일">
          <input
            style={inputStyle}
            type="email"
            value={form.contact_email}
            onChange={(e) => update('contact_email', e.target.value)}
            placeholder="esg@samsung.com"
          />
        </Field>
      </div>
    </div>
  );
}

function RE100Step({
  form,
  update,
}: {
  form: RE100Form;
  update: <K extends keyof RE100Form>(key: K, value: RE100Form[K]) => void;
}): JSX.Element {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="RE100 가입 연도">
          <input
            type="number"
            style={inputStyle}
            value={form.re100_joined_year}
            min={2014}
            max={2030}
            onChange={(e) => update('re100_joined_year', Number.parseInt(e.target.value, 10) || 2024)}
          />
        </Field>
        <Field label="RE100 목표 연도">
          <input
            type="number"
            style={inputStyle}
            value={form.re100_target_year}
            min={2030}
            max={2060}
            onChange={(e) => update('re100_target_year', Number.parseInt(e.target.value, 10) || 2050)}
          />
        </Field>
      </div>
      <Field label="연간 RE100 수요" hint="MWh / 년 (재생에너지로 충당해야 할 전력량)">
        <input
          type="number"
          style={inputStyle}
          value={form.target_re100_mwh_per_year}
          min={0}
          onChange={(e) =>
            update('target_re100_mwh_per_year', Number.parseFloat(e.target.value) || 0)
          }
        />
      </Field>
      <div
        style={{
          marginTop: 8,
          padding: 12,
          background: '#ecfdf5',
          borderLeft: '3px solid #10b981',
          fontSize: 12,
          color: '#065f46',
          lineHeight: 1.55,
        }}
      >
        Lucia Pilot은 RE100 인증 가능한 재생에너지를 본 사이트 외 발전소까지 광역으로 제공합니다.
        제출하신 연간 수요 대비 충당 비율은 출자 후 ESG 리포트에서 확인하실 수 있습니다.
      </div>
    </div>
  );
}

function InvestmentStep({
  form,
  update,
}: {
  form: RE100Form;
  update: <K extends keyof RE100Form>(key: K, value: RE100Form[K]) => void;
}): JSX.Element {
  const toggleRegion = (r: string): void => {
    const next = form.preferred_regions.includes(r)
      ? form.preferred_regions.filter((x) => x !== r)
      : [...form.preferred_regions, r];
    update('preferred_regions', next);
  };

  const toggleSite = (id: string): void => {
    const next = form.selected_sites.includes(id)
      ? form.selected_sites.filter((x) => x !== id)
      : [...form.selected_sites, id];
    update('selected_sites', next);
  };

  // Suggest top-yield candidates from preferred_regions; fall back to ULJN-*
  const candidates = useMemo(() => {
    const all = BUILDINGS_NATIONWIDE;
    const filtered =
      form.preferred_regions.length === 0
        ? all.filter((b) => b.building_id.startsWith('ULJN-'))
        : all.filter((b) => form.preferred_regions.includes(b.region_office));
    return [...filtered]
      .sort((a, b) => (b.expected_yield_pct ?? 0) - (a.expected_yield_pct ?? 0))
      .slice(0, 24);
  }, [form.preferred_regions]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="출자액 (원)" hint={`${(form.capex_won / 100_000_000).toFixed(2)}억`}>
          <input
            type="number"
            style={inputStyle}
            value={form.capex_won}
            min={1_000_000}
            step={1_000_000}
            onChange={(e) => update('capex_won', Number.parseInt(e.target.value, 10) || 0)}
          />
        </Field>
        <Field label="투자 기간 (년)">
          <input
            type="number"
            style={inputStyle}
            value={form.years}
            min={1}
            max={30}
            onChange={(e) => update('years', Number.parseInt(e.target.value, 10) || 20)}
          />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="자기자본 비율 (%)">
          <input
            type="number"
            style={inputStyle}
            value={form.equity_ratio_pct}
            min={0}
            max={100}
            step={0.5}
            onChange={(e) => update('equity_ratio_pct', Number.parseFloat(e.target.value) || 30)}
          />
        </Field>
        <Field label="목표 수익률 (%)">
          <input
            type="number"
            style={inputStyle}
            value={form.expected_yield_pct}
            min={0}
            max={15}
            step={0.1}
            onChange={(e) => update('expected_yield_pct', Number.parseFloat(e.target.value) || 6)}
          />
        </Field>
      </div>

      <Field label="선호 지역본부" hint="없음 = Pilot Uljin 우선">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {REGION_OFFICES.map((r) => {
            const active = form.preferred_regions.includes(r.name);
            return (
              <button
                type="button"
                key={r.name}
                onClick={() => toggleRegion(r.name)}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  borderRadius: 4,
                  border: `1px solid ${active ? r.color : '#e5e7eb'}`,
                  background: active ? r.color : '#fff',
                  color: active ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {r.name}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="후보 사이트 선택" hint={`상위 ${candidates.length}개 표시 · 선택 ${form.selected_sites.length}개`}>
        <div
          style={{
            maxHeight: 220,
            overflow: 'auto',
            border: '1px solid var(--line, #e5e7eb)',
            borderRadius: 4,
          }}
        >
          {candidates.map((b) => {
            const active = form.selected_sites.includes(b.building_id);
            return (
              <label
                key={b.building_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '20px 100px 1fr 60px 50px',
                  gap: 8,
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderBottom: '1px solid var(--line, #e5e7eb)',
                  background: active ? '#ECFDF5' : '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                <input type="checkbox" checked={active} onChange={() => toggleSite(b.building_id)} />
                <span className="num" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {b.building_id}
                </span>
                <span style={{ color: '#6b7280' }}>
                  {b.region_office} {b.city}
                </span>
                <span className="num" style={{ textAlign: 'right' }}>
                  {b.installed_kw.toFixed(2)} kW
                </span>
                <span className="num" style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                  {(b.expected_yield_pct ?? 0).toFixed(2)}%
                </span>
              </label>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

function ReviewStep({ form, flow }: { form: RE100Form | RetailForm; flow: 're100' | 'retail' }): JSX.Element {
  if (flow === 're100') {
    const f = form as RE100Form;
    return (
      <div>
        <h3 style={{ fontSize: 16, marginTop: 0 }}>제출 전 확인</h3>
        <ReviewRow label="회사명" value={f.company_name} />
        <ReviewRow label="사업자등록번호" value={f.business_registration_number} />
        <ReviewRow label="담당자" value={`${f.contact_name} · ${f.contact_phone} · ${f.contact_email}`} />
        <ReviewRow label="RE100 가입 / 목표" value={`${f.re100_joined_year} → ${f.re100_target_year}`} />
        <ReviewRow label="연간 RE100 수요" value={`${f.target_re100_mwh_per_year.toLocaleString('ko-KR')} MWh`} />
        <ReviewRow label="출자액" value={`${f.capex_won.toLocaleString('ko-KR')}원 (${(f.capex_won / 100_000_000).toFixed(2)}억)`} />
        <ReviewRow label="투자 기간 / 자기자본" value={`${f.years}년 / ${f.equity_ratio_pct.toFixed(1)}%`} />
        <ReviewRow label="목표 수익률" value={`${f.expected_yield_pct.toFixed(2)}%`} />
        <ReviewRow label="선택한 사이트" value={f.selected_sites.join(', ') || '(없음)'} />
        <Disclaimers />
      </div>
    );
  } else {
    const f = form as RetailForm;
    return (
      <div>
        <h3 style={{ fontSize: 16, marginTop: 0 }}>제출 전 확인</h3>
        <ReviewRow label="이름" value={f.individual_name} />
        <ReviewRow label="연락처" value={`${f.contact_phone} · ${f.contact_email}`} />
        <ReviewRow label="투자 동기" value={f.motivations.join(', ') || '(미선택)'} />
        <ReviewRow label="관심 출자 범위" value={`${(f.min_capex / 10_000).toLocaleString('ko-KR')}만 ~ ${(f.max_capex / 10_000).toLocaleString('ko-KR')}만 원`} />
        <ReviewRow label="선택한 사이트" value={f.selected_sites.join(', ') || '(없음)'} />
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: '#fef3c7',
            borderLeft: '3px solid #f59e0b',
            fontSize: 12,
            color: '#78350f',
          }}
        >
          본 의향 표명은 <strong>비구속력 (Non-binding)</strong>으로 처리되며, 계약 체결을 보장하지 않습니다.
        </div>
      </div>
    );
  }
}

function ReviewRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        padding: '6px 0',
        borderBottom: '1px dashed var(--line, #e5e7eb)',
        fontSize: 13,
      }}
    >
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span style={{ color: '#0a0c0f', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function Disclaimers(): JSX.Element {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        background: '#fff7ed',
        borderLeft: '3px solid #f59e0b',
        fontSize: 11.5,
        color: '#7c2d12',
        lineHeight: 1.55,
      }}
    >
      <strong>중요 고지사항</strong>
      <ul style={{ paddingLeft: 18, margin: '6px 0 0' }}>
        <li>본 의향 표명은 가정 기반이며 실제 수익을 보장하지 않습니다.</li>
        <li>최종 계약 조건은 TheKIE BD 팀의 검토 후 별도 협의됩니다.</li>
        <li>재생에너지지원사업 융자금 적용은 한국에너지공단 심사 후 확정됩니다.</li>
      </ul>
    </div>
  );
}

function SignatureStep<T extends { signature_phone?: string; signature_code?: string }>({
  form,
  update,
  error,
}: {
  form: T;
  update: <K extends keyof T>(key: K, value: T[K]) => void;
  error: string | null;
}): JSX.Element {
  return (
    <div>
      <h3 style={{ fontSize: 16, marginTop: 0 }}>SMS 서명</h3>
      <p style={{ fontSize: 12.5, color: '#6b7280', lineHeight: 1.5 }}>
        Mock 서명 단계입니다. Pilot v1.3은 실제 SMS를 발송하지 않으며, 임의의 6자리 숫자를 입력하면
        진행됩니다 (FR-R-005 §3 — 향후 KISA 인증 SMS 게이트웨이로 교체 예정).
      </p>
      <Field label="서명자 휴대폰 번호" hint="010-XXXX-XXXX">
        <input
          style={inputStyle}
          value={(form as { signature_phone: string }).signature_phone}
          onChange={(e) => update('signature_phone' as keyof T, e.target.value as T[keyof T])}
          placeholder="010-1234-5678"
        />
      </Field>
      <Field label="인증 코드" hint="아무 숫자 6자리 (mock)">
        <input
          style={inputStyle}
          value={(form as { signature_code: string }).signature_code}
          maxLength={6}
          inputMode="numeric"
          onChange={(e) =>
            update('signature_code' as keyof T, e.target.value.replace(/\D/g, '').slice(0, 6) as T[keyof T])
          }
          placeholder="123456"
        />
      </Field>
      {error && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            fontSize: 12,
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Retail 3-step wizard (FR-R-004)
// ---------------------------------------------------------------------------

interface RetailForm {
  individual_name: string;
  contact_phone: string;
  contact_email: string;
  motivations: ('esg' | 'yield' | 'local_contribution' | 'other')[];
  min_capex: number;
  max_capex: number;
  selected_sites: string[];
  signature_phone: string;
  signature_code: string;
}

const RETAIL_STEPS = ['개인 정보', '관심 표명', '서명·제출'] as const;

const MOTIVATION_OPTIONS: {
  value: RetailForm['motivations'][number];
  label: string;
}[] = [
  { value: 'esg', label: 'ESG · 친환경 가치' },
  { value: 'yield', label: '수익률' },
  { value: 'local_contribution', label: '지역 기여' },
  { value: 'other', label: '기타' },
];

export function RetailWizard(): JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialSite = params.get('site');

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<RetailForm>(() => ({
    individual_name: '',
    contact_phone: '',
    contact_email: '',
    motivations: [],
    min_capex: 1_000_000,
    max_capex: 50_000_000,
    selected_sites: initialSite ? [initialSite] : [],
    signature_phone: '',
    signature_code: '',
  }));

  const update = <K extends keyof RetailForm>(key: K, value: RetailForm[K]): void =>
    setForm((f) => ({ ...f, [key]: value }));

  const stepValid = useMemo<boolean>(() => {
    switch (step) {
      case 0:
        return (
          form.individual_name.trim().length > 0 &&
          PHONE_RE.test(form.contact_phone) &&
          EMAIL_RE.test(form.contact_email)
        );
      case 1:
        return (
          form.motivations.length > 0 &&
          form.min_capex > 0 &&
          form.max_capex >= form.min_capex &&
          form.selected_sites.length > 0
        );
      case 2:
        return PHONE_RE.test(form.signature_phone) && form.signature_code.length === 6;
      default:
        return false;
    }
  }, [step, form]);

  const onSubmit = async (): Promise<void> => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const now = new Date().toISOString();
      const investorId = `i-${Date.now().toString(36)}`;
      const investor: Investor = {
        id: investorId,
        type: 'retail',
        individual_name: form.individual_name.trim(),
        contact: {
          name: form.individual_name.trim(),
          phone: form.contact_phone,
          email: form.contact_email,
        },
        preferred_regions: [],
        expected_capex_range: {
          min_won: form.min_capex,
          max_won: form.max_capex,
        },
        investment_motivations: form.motivations,
        created_at: now,
      };

      const loiId = `loi-${Date.now().toString(36)}`;
      const draft: LOI = {
        id: loiId,
        investor_id: investorId,
        sites: form.selected_sites,
        capex_won: Math.round((form.min_capex + form.max_capex) / 2),
        terms: {
          years: 20,
          equity_ratio_pct: 30,
          expected_yield_pct: 6.0,
        },
        status: 'draft',
        pdf_url: null,
        blockchain_hash: null,
        signed_at: null,
        is_non_binding: true,
        created_at: now,
        updated_at: now,
      };

      const siteLabels = form.selected_sites.map((id) => {
        const b = BUILDINGS_NATIONWIDE.find((x) => x.building_id === id);
        return b ? `${b.building_id} — ${b.region_office} ${b.city} ${b.district}` : id;
      });

      const result = await registerSignedLOI({
        input: { loi: draft, investor, siteLabels },
        signedAt: now,
      });

      navigate(`/invest/onboarding/done?id=${result.loi.id}&flow=retail`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '제출 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <WizardShell
      flow="retail"
      steps={RETAIL_STEPS}
      currentStep={step}
      onBack={() => setStep((s) => Math.max(0, s - 1))}
      onNext={() => {
        if (!stepValid) return;
        if (step === RETAIL_STEPS.length - 1) {
          void onSubmit();
        } else {
          setStep((s) => s + 1);
        }
      }}
      isFinal={step === RETAIL_STEPS.length - 1}
      canAdvance={stepValid}
      submitting={submitting}
    >
      {step === 0 && <RetailIdentityStep form={form} update={update} />}
      {step === 1 && <RetailInterestStep form={form} update={update} />}
      {step === 2 && <SignatureStep form={form} update={update} error={submitError} />}
    </WizardShell>
  );
}

function RetailIdentityStep({
  form,
  update,
}: {
  form: RetailForm;
  update: <K extends keyof RetailForm>(key: K, value: RetailForm[K]) => void;
}): JSX.Element {
  return (
    <div>
      <Field label="이름">
        <input
          style={inputStyle}
          value={form.individual_name}
          onChange={(e) => update('individual_name', e.target.value)}
          placeholder="홍길동"
        />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="휴대폰" hint="010-XXXX-XXXX">
          <input
            style={inputStyle}
            value={form.contact_phone}
            onChange={(e) => update('contact_phone', e.target.value)}
            placeholder="010-1234-5678"
          />
        </Field>
        <Field label="이메일">
          <input
            style={inputStyle}
            type="email"
            value={form.contact_email}
            onChange={(e) => update('contact_email', e.target.value)}
            placeholder="hong@example.com"
          />
        </Field>
      </div>
    </div>
  );
}

function RetailInterestStep({
  form,
  update,
}: {
  form: RetailForm;
  update: <K extends keyof RetailForm>(key: K, value: RetailForm[K]) => void;
}): JSX.Element {
  const toggleMotivation = (m: RetailForm['motivations'][number]): void => {
    const next = form.motivations.includes(m)
      ? form.motivations.filter((x) => x !== m)
      : [...form.motivations, m];
    update('motivations', next);
  };

  const toggleSite = (id: string): void => {
    const next = form.selected_sites.includes(id)
      ? form.selected_sites.filter((x) => x !== id)
      : [...form.selected_sites, id];
    update('selected_sites', next);
  };

  // Top-yield candidates (no region filter for retail)
  const candidates = useMemo(() => {
    return [...BUILDINGS_NATIONWIDE]
      .sort((a, b) => (b.expected_yield_pct ?? 0) - (a.expected_yield_pct ?? 0))
      .slice(0, 18);
  }, []);

  return (
    <div>
      <Field label="투자 동기 (다중 선택 가능)">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MOTIVATION_OPTIONS.map((opt) => {
            const active = form.motivations.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleMotivation(opt.value)}
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  borderRadius: 4,
                  border: `1px solid ${active ? '#10b981' : '#e5e7eb'}`,
                  background: active ? '#10b981' : '#fff',
                  color: active ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="관심 출자 최소 (원)" hint={`${(form.min_capex / 10_000).toLocaleString('ko-KR')}만`}>
          <input
            type="number"
            style={inputStyle}
            value={form.min_capex}
            min={100_000}
            step={100_000}
            onChange={(e) => update('min_capex', Number.parseInt(e.target.value, 10) || 1_000_000)}
          />
        </Field>
        <Field label="관심 출자 최대 (원)" hint={`${(form.max_capex / 10_000).toLocaleString('ko-KR')}만`}>
          <input
            type="number"
            style={inputStyle}
            value={form.max_capex}
            min={form.min_capex}
            step={100_000}
            onChange={(e) => update('max_capex', Number.parseInt(e.target.value, 10) || 50_000_000)}
          />
        </Field>
      </div>
      <Field label="관심 사이트" hint={`Top-yield 18개 표시 · 선택 ${form.selected_sites.length}개`}>
        <div
          style={{
            maxHeight: 200,
            overflow: 'auto',
            border: '1px solid var(--line, #e5e7eb)',
            borderRadius: 4,
          }}
        >
          {candidates.map((b) => {
            const active = form.selected_sites.includes(b.building_id);
            return (
              <label
                key={b.building_id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '20px 100px 1fr 60px 50px',
                  gap: 8,
                  alignItems: 'center',
                  padding: '6px 10px',
                  borderBottom: '1px solid var(--line, #e5e7eb)',
                  background: active ? '#ECFDF5' : '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                <input type="checkbox" checked={active} onChange={() => toggleSite(b.building_id)} />
                <span className="num" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {b.building_id}
                </span>
                <span style={{ color: '#6b7280' }}>
                  {b.region_office} {b.city}
                </span>
                <span className="num" style={{ textAlign: 'right' }}>
                  {b.installed_kw.toFixed(2)} kW
                </span>
                <span className="num" style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                  {(b.expected_yield_pct ?? 0).toFixed(2)}%
                </span>
              </label>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmation page (post-submit landing)
// ---------------------------------------------------------------------------

export function OnboardingDone(): JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get('id');
  const flow = params.get('flow') ?? 're100';
  const isRE100 = flow === 're100';

  return (
    <div style={{ padding: '64px 24px', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#10b981',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 700,
          margin: '0 auto 18px',
        }}
        aria-hidden
      >
        ✓
      </div>
      <h1 style={{ fontSize: 24, margin: 0 }}>
        {isRE100 ? '출자 의향서 제출이 완료되었습니다' : '관심 표명이 접수되었습니다'}
      </h1>
      <p style={{ fontSize: 13, color: '#6b7280', marginTop: 12, lineHeight: 1.6 }}>
        {isRE100
          ? '서명된 LOI에 SHA-256 해시가 부착되어 mock 블록체인에 기록되었습니다. TheKIE BD 팀의 검토 후 별도 연락드립니다.'
          : '비구속력 의향 표명이 접수되었습니다. 향후 모집 일정과 KYC·적정성 평가 안내가 이메일로 발송됩니다.'}
      </p>
      {id && (
        <div
          className="num"
          style={{
            marginTop: 18,
            padding: '10px 14px',
            background: '#f3f4f6',
            border: '1px solid var(--line, #e5e7eb)',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
            display: 'inline-block',
          }}
        >
          접수 번호: {id}
        </div>
      )}
      <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => navigate('/invest/projects')}
          style={{
            padding: '10px 18px',
            background: 'var(--ink, #0a0c0f)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          카탈로그로 돌아가기
        </button>
      </div>
    </div>
  );
}
