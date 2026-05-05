// FRD-2026-001 v1.3.1 §FR-O-006 — investor-equity financial simulator.
//
// SCOPE: investor perspective only. TheKIE-internal BM A vs BM B comparison
// is forbidden in this UI. We compute and surface:
//   - Cumulative distribution (won)
//   - Equity IRR (%)
//   - Payback (years)
//   - ROI multiple (×)
//
// All numbers route through @lucia/finance.simulateInvestorReturn — this
// component is a pure controlled-form orchestrator: state → SimulationInput →
// useMemo result → render. No data-fetching, no derived business logic.
//
// Mandatory disclaimers (FR-O-006 §처리-12):
//   1. "본 시뮬레이션은 가정 기반이며 실제 수익을 보장하지 않습니다."
//   2. "재생에너지지원사업 융자금 적용은 한국에너지공단 심사 후 확정됩니다."

import { BUILDINGS_NATIONWIDE, REGION_BY_NAME } from '@lucia/contracts';
import {
  BASE_ASSUMPTIONS,
  SCENARIOS,
  simulateInvestorReturn,
  validateCapitalStructure,
  type CapitalStructure,
  type InvestorResult,
  type KEALoanTerms,
  type ScenarioName,
  type Sensitivity,
  type SimulationInput,
} from '@lucia/finance';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// ────────────────────────────────────────────────────────────────────────────
// Defaults
// ────────────────────────────────────────────────────────────────────────────

const SCENARIO_OPTIONS: { value: ScenarioName; label: string; tone: string }[] = [
  { value: 'conservative', label: '보수적', tone: 'var(--muted)' },
  { value: 'base', label: '기본', tone: 'var(--ink)' },
  { value: 'optimistic', label: '낙관적', tone: 'var(--accent)' },
];

const DEFAULT_CAPITAL: CapitalStructure = {
  project_equity_pct: 30,
  kea_loan_pct: 50,
  other_debt_pct: 20,
};

const DEFAULT_KEA: KEALoanTerms = {
  interest_rate_pct: BASE_ASSUMPTIONS.kea_loan_default_rate_pct,
  grace_years: BASE_ASSUMPTIONS.kea_loan_default_grace_years,
  repayment_years: BASE_ASSUMPTIONS.kea_loan_default_repayment_years,
};

const DEFAULT_SENSITIVITY: Sensitivity = {
  smp_pct: 0,
  rec_pct: 0,
  efficiency_pct: 0,
  kea_rate_bps: 0,
};

const DEFAULT_INVESTOR_CAPEX_WON = 100_000_000; // 1억원

// Default panel for roof-meta derivation. ULJN-Pilot 표준 모듈.
const DEFAULT_PANEL = {
  id: '550W (Mono PERC)',
  wattage: 550,
  width_m: 2.28,
  height_m: 1.13,
  efficiency_pct: 21.4,
} as const;

// Layout overhead — roof footprint multiplier accounting for aisles, setbacks,
// and inverter/maintenance zones. Korean rooftop benchmark.
const ROOF_LAYOUT_FACTOR = 1.4;

interface RoofMeta {
  panel_count: number;
  panel_id: string;
  panel_area_m2: number;
  roof_area_m2: number;
}

function deriveRoofMeta(installed_kw: number): RoofMeta {
  const panel_count = Math.max(1, Math.round((installed_kw * 1000) / DEFAULT_PANEL.wattage));
  const panel_area_m2 = DEFAULT_PANEL.width_m * DEFAULT_PANEL.height_m;
  const roof_area_m2 = panel_count * panel_area_m2 * ROOF_LAYOUT_FACTOR;
  return {
    panel_count,
    panel_id: DEFAULT_PANEL.id,
    panel_area_m2,
    roof_area_m2,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export function InstallSimulator(): JSX.Element {
  const [params, setParams] = useSearchParams();
  const siteId = params.get('site') ?? 'ULJN-001';

  const site = useMemo(
    () => BUILDINGS_NATIONWIDE.find((b) => b.building_id === siteId) ?? BUILDINGS_NATIONWIDE[0]!,
    [siteId],
  );
  const region = REGION_BY_NAME.get(site.region_office as never);
  const roofMeta = useMemo(() => deriveRoofMeta(site.installed_kw), [site.installed_kw]);

  const onSelectSite = (next: { building_id: string }): void => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('site', next.building_id);
    setParams(nextParams, { replace: false });
  };

  const [investorCapex, setInvestorCapex] = useState(DEFAULT_INVESTOR_CAPEX_WON);
  const [years, setYears] = useState(20);
  const [capital, setCapital] = useState<CapitalStructure>(DEFAULT_CAPITAL);
  const [keaTerms, setKeaTerms] = useState<KEALoanTerms>(DEFAULT_KEA);
  const [scenario, setScenario] = useState<ScenarioName>('base');
  const [sensitivity, setSensitivity] = useState<Sensitivity>(DEFAULT_SENSITIVITY);
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [showKeaSchedule, setShowKeaSchedule] = useState(false);

  const capitalValidation = validateCapitalStructure(capital);

  const input: SimulationInput = {
    investor_capex_won: investorCapex,
    years,
    installed_kw: site.installed_kw,
    capital_structure: capital,
    kea_loan_terms: keaTerms,
    scenario,
    sensitivity,
  };

  const result: InvestorResult | null = useMemo(() => {
    if (!capitalValidation.valid) return null;
    try {
      return simulateInvestorReturn(input);
    } catch {
      return null;
    }
  }, [
    investorCapex,
    years,
    site.installed_kw,
    capital.project_equity_pct,
    capital.kea_loan_pct,
    capital.other_debt_pct,
    keaTerms.interest_rate_pct,
    keaTerms.grace_years,
    keaTerms.repayment_years,
    scenario,
    sensitivity.smp_pct,
    sensitivity.rec_pct,
    sensitivity.efficiency_pct,
    sensitivity.kea_rate_bps,
    capitalValidation.valid,
  ]);

  const reset = (): void => {
    setInvestorCapex(DEFAULT_INVESTOR_CAPEX_WON);
    setYears(20);
    setCapital(DEFAULT_CAPITAL);
    setKeaTerms(DEFAULT_KEA);
    setScenario('base');
    setSensitivity(DEFAULT_SENSITIVITY);
  };

  const setCapitalKey = (key: keyof CapitalStructure, value: number): void => {
    // Auto-balance the OTHER two so the sum stays at 100. KEA hard-capped at 80.
    const v = Math.max(0, Math.min(key === 'kea_loan_pct' ? 80 : 100, value));
    const otherKeys = (Object.keys(capital) as (keyof CapitalStructure)[]).filter((k) => k !== key);
    const remaining = 100 - v;
    const otherSum = otherKeys.reduce((s, k) => s + capital[k], 0);
    const next: CapitalStructure = { ...capital, [key]: v };
    if (otherSum <= 0) {
      // Split evenly
      otherKeys.forEach((k) => {
        next[k] = remaining / otherKeys.length;
      });
    } else {
      otherKeys.forEach((k) => {
        next[k] = (capital[k] / otherSum) * remaining;
      });
    }
    // Clamp KEA at 80 if it bubbles up via redistribution
    if (next.kea_loan_pct > 80) {
      const overflow = next.kea_loan_pct - 80;
      next.kea_loan_pct = 80;
      const others = (Object.keys(next) as (keyof CapitalStructure)[]).filter(
        (k) => k !== 'kea_loan_pct',
      );
      const totalOthers = others.reduce((s, k) => s + next[k], 0);
      others.forEach((k) => {
        next[k] += totalOthers > 0 ? (next[k] / totalOthers) * overflow : overflow / others.length;
      });
    }
    setCapital(next);
  };

  return (
    <div style={{ padding: '24px 20px 80px', maxWidth: 1280, margin: '0 auto' }}>
      <SiteSearchSelector currentSite={site} onSelect={onSelectSite} />
      <SiteHeader
        site={site}
        roofMeta={roofMeta}
        regionColor={region?.color ?? '#6b7280'}
        regionName={site.region_office}
      />

      <div className="sim-layout">
        <aside className="sim-inputs">
          <InputCard title="투자 조건">
            <NumberInput
              label="출자액"
              suffix="원"
              value={investorCapex}
              min={1_000_000}
              max={10_000_000_000}
              step={1_000_000}
              format={(v) => `${(v / 100_000_000).toFixed(2)}억`}
              onChange={setInvestorCapex}
            />
            <SliderRow
              label="보유 기간"
              value={years}
              min={5}
              max={30}
              step={1}
              format={(v) => `${v}년`}
              onChange={setYears}
            />
          </InputCard>

          <InputCard title="자본 구조" warning={capitalValidation.error}>
            <CapitalSlider
              label="자기자본 (Project equity)"
              value={capital.project_equity_pct}
              max={100}
              tone="var(--ink)"
              onChange={(v) => setCapitalKey('project_equity_pct', v)}
            />
            <CapitalSlider
              label="KEA 융자금"
              hint="한국에너지공단 한도 80%"
              value={capital.kea_loan_pct}
              max={80}
              tone="var(--accent)"
              onChange={(v) => setCapitalKey('kea_loan_pct', v)}
            />
            <CapitalSlider
              label="기타 부채 (Commercial loan)"
              value={capital.other_debt_pct}
              max={100}
              tone="var(--muted)"
              onChange={(v) => setCapitalKey('other_debt_pct', v)}
            />
            <div style={summaryRowStyle}>
              <span>합계</span>
              <span className="num" style={{ fontWeight: 700 }}>
                {(capital.project_equity_pct + capital.kea_loan_pct + capital.other_debt_pct).toFixed(1)}%
              </span>
            </div>
          </InputCard>

          <InputCard title="KEA 융자금 조건">
            <SliderRow
              label="이자율"
              hint="0~5% (default 1.75%)"
              value={keaTerms.interest_rate_pct}
              min={0}
              max={5}
              step={0.05}
              format={(v) => `${v.toFixed(2)}%`}
              onChange={(v) => setKeaTerms({ ...keaTerms, interest_rate_pct: v })}
            />
            <SliderRow
              label="거치 기간"
              value={keaTerms.grace_years}
              min={0}
              max={10}
              step={1}
              format={(v) => `${v}년`}
              onChange={(v) => setKeaTerms({ ...keaTerms, grace_years: v })}
            />
            <SliderRow
              label="상환 기간"
              value={keaTerms.repayment_years}
              min={5}
              max={20}
              step={1}
              format={(v) => `${v}년`}
              onChange={(v) => setKeaTerms({ ...keaTerms, repayment_years: v })}
            />
          </InputCard>

          <InputCard title="시나리오">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {SCENARIO_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setScenario(opt.value)}
                  style={scenarioBtnStyle(scenario === opt.value, opt.tone)}
                  aria-pressed={scenario === opt.value}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{opt.label}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>
                    SMP×{SCENARIOS[opt.value].smp_multiplier.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowSensitivity((s) => !s)}
              style={collapseHeaderStyle}
              aria-expanded={showSensitivity}
            >
              <span>고급 민감도</span>
              <span style={{ fontSize: 11 }}>{showSensitivity ? '▾' : '▸'}</span>
            </button>
            {showSensitivity && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
                <SliderRow
                  label="SMP 단가 변동"
                  value={sensitivity.smp_pct}
                  min={-20}
                  max={20}
                  step={1}
                  format={(v) => `${v >= 0 ? '+' : ''}${v}%`}
                  onChange={(v) => setSensitivity({ ...sensitivity, smp_pct: v })}
                />
                <SliderRow
                  label="REC 단가 변동"
                  value={sensitivity.rec_pct}
                  min={-20}
                  max={20}
                  step={1}
                  format={(v) => `${v >= 0 ? '+' : ''}${v}%`}
                  onChange={(v) => setSensitivity({ ...sensitivity, rec_pct: v })}
                />
                <SliderRow
                  label="발전 효율 변동"
                  value={sensitivity.efficiency_pct}
                  min={-10}
                  max={10}
                  step={1}
                  format={(v) => `${v >= 0 ? '+' : ''}${v}%`}
                  onChange={(v) => setSensitivity({ ...sensitivity, efficiency_pct: v })}
                />
                <SliderRow
                  label="KEA 이자율 변동"
                  value={sensitivity.kea_rate_bps}
                  min={-50}
                  max={50}
                  step={5}
                  format={(v) => `${v >= 0 ? '+' : ''}${v}bps`}
                  onChange={(v) => setSensitivity({ ...sensitivity, kea_rate_bps: v })}
                />
              </div>
            )}
          </InputCard>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={reset} style={secondaryBtnStyle}>
              기본값으로 초기화
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              style={primaryBtnStyle}
              disabled={!result}
            >
              PDF 다운로드
            </button>
          </div>
        </aside>

        <section className="sim-results">
          {!result ? (
            <div style={errorBoxStyle}>
              <strong>입력값 검증 필요</strong>
              <p style={{ margin: '6px 0 0', fontSize: 12 }}>
                {capitalValidation.error ?? '시뮬레이션 입력값을 확인해주세요.'}
              </p>
            </div>
          ) : (
            <>
              <MetricGrid
                investorCapex={investorCapex}
                result={result}
                scenario={scenario}
              />
              <ResultsBody
                result={result}
                capital={capital}
                investorCapex={investorCapex}
                site={site}
                showKeaSchedule={showKeaSchedule}
                setShowKeaSchedule={setShowKeaSchedule}
              />
            </>
          )}
        </section>
      </div>

      <Disclaimers />

      <style>{`
        .sim-layout {
          display: grid;
          grid-template-columns: minmax(280px, 340px) 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .sim-layout { grid-template-columns: 1fr; }
        }
        .sim-inputs { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 16px; }
        @media (max-width: 1024px) {
          .sim-inputs { position: static; }
        }
        .sim-results { display: flex; flex-direction: column; gap: 16px; }
        @media print {
          aside.sim-inputs, .sim-print-hide { display: none !important; }
          .sim-layout { grid-template-columns: 1fr !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Site header
// ────────────────────────────────────────────────────────────────────────────

function SiteHeader({
  site,
  roofMeta,
  regionColor,
  regionName,
}: {
  site: { building_id: string; installed_kw: number; address?: string };
  roofMeta: RoofMeta;
  regionColor: string;
  regionName: string;
}): JSX.Element {
  return (
    <header
      style={{
        background: 'var(--ink)',
        color: '#fff',
        padding: '20px 24px',
        borderRadius: 6,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}
    >
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <span
            style={{
              padding: '3px 9px',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 4,
              background: regionColor,
              color: '#fff',
            }}
          >
            {regionName}
          </span>
          <span style={{ fontSize: 11, opacity: 0.7 }}>FR-O-006 · 투자자 시뮬레이터 v1.3 · 운영발전소</span>
        </div>
        <div
          className="num"
          style={{ fontSize: 28, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '-0.02em' }}
        >
          {site.building_id}
        </div>
        {site.address && (
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{site.address}</div>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, max-content))',
          gap: 18,
          fontSize: 11.5,
          color: 'rgba(255,255,255,0.7)',
        }}
      >
        <SitePill label="설치 용량" value={`${site.installed_kw.toFixed(2)} kW`} />
        <SitePill label="옥상 면적" value={`${roofMeta.roof_area_m2.toFixed(0)} m²`} />
        <SitePill
          label="패널 수"
          value={`${roofMeta.panel_count.toLocaleString('ko-KR')}장`}
        />
        <SitePill label="패널 종류" value={roofMeta.panel_id} />
        <SitePill
          label="총 사업비"
          value={`${((site.installed_kw * BASE_ASSUMPTIONS.capex_won_per_kw) / 100_000_000).toFixed(2)}억`}
        />
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Site search selector — typeahead over BUILDINGS_NATIONWIDE (9,354 entries).
// Lets the investor pivot to another 운영발전소 without leaving the simulator.
// ────────────────────────────────────────────────────────────────────────────

interface SiteOption {
  building_id: string;
  region_office: string;
  city: string;
  district: string;
  installed_kw: number;
  expected_yield_pct?: number;
}

function SiteSearchSelector({
  currentSite,
  onSelect,
}: {
  currentSite: SiteOption;
  onSelect: (b: SiteOption) => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const matches = useMemo<SiteOption[]>(() => {
    const q = query.trim().toLowerCase();
    const all = BUILDINGS_NATIONWIDE as readonly SiteOption[];
    if (q === '') {
      // Empty query — show first 30 ULJN- prefer (Pilot) then by yield desc
      const sorted = [...all].sort((a, b) => {
        const aPilot = a.building_id.startsWith('ULJN-') ? 1 : 0;
        const bPilot = b.building_id.startsWith('ULJN-') ? 1 : 0;
        if (aPilot !== bPilot) return bPilot - aPilot;
        return (b.expected_yield_pct ?? 0) - (a.expected_yield_pct ?? 0);
      });
      return sorted.slice(0, 30);
    }
    const filtered: SiteOption[] = [];
    for (const b of all) {
      const hay = `${b.building_id} ${b.region_office} ${b.city} ${b.district}`.toLowerCase();
      if (hay.includes(q)) {
        filtered.push(b);
        if (filtered.length >= 50) break;
      }
    }
    return filtered;
  }, [query]);

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: '1px solid var(--line, #e5e7eb)',
          borderRadius: 6,
          background: '#fff',
          fontSize: 13,
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{ color: 'var(--muted, #5C6470)', fontSize: 11, fontWeight: 600 }}>
          운영발전소
        </span>
        <span className="num" style={{ fontWeight: 700 }}>{currentSite.building_id}</span>
        <span style={{ color: 'var(--muted-2, #8A93A0)', fontSize: 11.5 }}>
          · {currentSite.region_office} {currentSite.city} {currentSite.district}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--muted, #5C6470)', fontSize: 11 }}>
          {open ? '닫기 ▲' : '다른 발전소 검색 ▼'}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid var(--line, #e5e7eb)',
            borderRadius: 6,
            boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
            zIndex: 50,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <input
            type="search"
            autoFocus
            placeholder="발전소 ID, 지역본부, 시·군·구로 검색 (예: 'ULJN', '대구', '서울')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: '8px 10px',
              border: '1px solid var(--line, #e5e7eb)',
              borderRadius: 4,
              fontSize: 12.5,
              outline: 'none',
            }}
          />
          <div style={{ fontSize: 10.5, color: 'var(--muted, #5C6470)', padding: '0 4px' }}>
            전국 {BUILDINGS_NATIONWIDE.length.toLocaleString('ko-KR')}개 운영발전소 중 매칭{' '}
            <span className="num" style={{ fontWeight: 700, color: 'var(--ink)' }}>
              {matches.length.toLocaleString('ko-KR')}
            </span>
            개{matches.length === 50 ? ' (최대 50개 표시)' : ''}
          </div>
          <div style={{ maxHeight: 320, overflow: 'auto', borderTop: '1px solid var(--line)' }}>
            {matches.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                검색 결과가 없습니다.
              </div>
            ) : (
              matches.map((b) => (
                <button
                  key={b.building_id}
                  type="button"
                  onClick={() => {
                    onSelect(b);
                    setOpen(false);
                    setQuery('');
                  }}
                  style={siteOptionRowStyle(b.building_id === currentSite.building_id)}
                >
                  <span
                    className="num"
                    style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 600, fontSize: 12 }}
                  >
                    {b.building_id}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted, #5C6470)' }}>
                    {b.region_office} · {b.city} {b.district}
                  </span>
                  <span
                    className="num"
                    style={{ fontSize: 11, color: 'var(--ink, #0a0c0f)', textAlign: 'right' }}
                  >
                    {b.installed_kw.toFixed(2)} kW
                  </span>
                  <span
                    className="num"
                    style={{
                      fontSize: 11,
                      color: 'var(--accent, #1264D3)',
                      fontWeight: 600,
                      textAlign: 'right',
                    }}
                  >
                    {(b.expected_yield_pct ?? 0).toFixed(2)}%
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function siteOptionRowStyle(active: boolean): React.CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 80px 60px',
    gap: 12,
    alignItems: 'center',
    padding: '8px 10px',
    border: 'none',
    borderBottom: '1px solid var(--line, #e5e7eb)',
    background: active ? '#EBF2FF' : '#fff',
    color: 'var(--ink, #0a0c0f)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontSize: 12,
  };
}

function SitePill({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span className="num" style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{value}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Metric grid (4 cards)
// ────────────────────────────────────────────────────────────────────────────

function MetricGrid({
  investorCapex,
  result,
  scenario,
}: {
  investorCapex: number;
  result: InvestorResult;
  scenario: ScenarioName;
}): JSX.Element {
  const irrLabel = Number.isNaN(result.equity_irr_pct)
    ? '계산 불가'
    : `${result.equity_irr_pct.toFixed(2)}%`;
  const paybackLabel = !Number.isFinite(result.payback_years)
    ? '회수 불가'
    : `${result.payback_years.toFixed(1)}년`;
  const irrAccent = !Number.isNaN(result.equity_irr_pct) && result.equity_irr_pct >= 5;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}
    >
      <Metric
        overline="누적 분배"
        value={`${(result.cumulative_distribution_won / 100_000_000).toFixed(2)}억`}
        sub={`출자 ${(investorCapex / 100_000_000).toFixed(2)}억 대비`}
      />
      <Metric
        overline="Equity IRR"
        value={irrLabel}
        sub={`시나리오: ${scenario === 'conservative' ? '보수적' : scenario === 'base' ? '기본' : '낙관적'}`}
        accent={irrAccent ? 'var(--accent)' : undefined}
      />
      <Metric
        overline="회수 기간 (Payback)"
        value={paybackLabel}
        sub="누적 분배가 출자액 회수 시점"
      />
      <Metric
        overline="ROI Multiple"
        value={`${result.roi_multiple.toFixed(2)}×`}
        sub={`총 분배 / 출자액`}
        accent={result.roi_multiple >= 1 ? 'var(--accent)' : 'var(--muted)'}
      />
    </div>
  );
}

function Metric({
  overline,
  value,
  sub,
  accent,
}: {
  overline: string;
  value: string;
  sub: string;
  accent?: string;
}): JSX.Element {
  return (
    <div
      className="card"
      style={{
        padding: 16,
        background: '#fff',
        border: '1px solid var(--line, #e5e7eb)',
        borderRadius: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div className="overline" style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {overline}
      </div>
      <div
        className="num"
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: accent ?? 'var(--ink, #0a0c0f)',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted-2, #8A93A0)' }}>{sub}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Results body — capital donut + cashflow chart + KEA table
// ────────────────────────────────────────────────────────────────────────────

function ResultsBody({
  result,
  capital,
  investorCapex,
  site,
  showKeaSchedule,
  setShowKeaSchedule,
}: {
  result: InvestorResult;
  capital: CapitalStructure;
  investorCapex: number;
  site: { installed_kw: number };
  showKeaSchedule: boolean;
  setShowKeaSchedule: (v: boolean) => void;
}): JSX.Element {
  const chartData = result.yearly.map((r) => ({
    year: r.year,
    revenue: r.revenue / 1_000_000,
    distribution: r.investor_distribution / 1_000_000,
    cumulative: (r.investor_cumulative - investorCapex) / 1_000_000,
  }));

  const totalCapex = capital.project_equity_pct > 0
    ? investorCapex / (capital.project_equity_pct / 100)
    : site.installed_kw * BASE_ASSUMPTIONS.capex_won_per_kw;
  const donutData = [
    { name: '자기자본', value: capital.project_equity_pct, color: 'var(--ink, #0a0c0f)' },
    { name: 'KEA 융자금', value: capital.kea_loan_pct, color: 'var(--accent, #1264D3)' },
    { name: '기타 부채', value: capital.other_debt_pct, color: 'var(--muted, #5C6470)' },
  ];

  return (
    <>
      <section
        style={{
          background: '#fff',
          border: '1px solid var(--line, #e5e7eb)',
          borderRadius: 6,
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, margin: 0 }}>자본 구조</h3>
          <span className="num" style={{ fontSize: 12, color: 'var(--muted)' }}>
            총 사업비 {(totalCapex / 100_000_000).toFixed(2)}억
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'center' }}>
          <div style={{ width: 180, height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={50} outerRadius={80} stroke="#fff" strokeWidth={2}>
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: unknown) => [`${(v as number).toFixed(1)}%`]}
                  contentStyle={{ fontSize: 11.5, borderRadius: 4 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {donutData.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                <span style={{ flex: 1 }}>{d.name}</span>
                <span className="num" style={{ fontWeight: 600 }}>{d.value.toFixed(1)}%</span>
                <span className="num" style={{ color: 'var(--muted)', minWidth: 80, textAlign: 'right' }}>
                  {((totalCapex * d.value) / 100 / 100_000_000).toFixed(2)}억
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          background: '#fff',
          border: '1px solid var(--line, #e5e7eb)',
          borderRadius: 6,
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, margin: 0 }}>투자자 현금흐름</h3>
          <span className="num" style={{ fontSize: 11, color: 'var(--muted)' }}>
            연 매출 {(result.project_revenue_year1_won / 1_000_000).toFixed(1)}M (1년차)
          </span>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="year"
                axisLine={{ stroke: 'var(--line-2)' }}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-2)' }}
                tickFormatter={(v) => `${v}년`}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-2)' }}
                tickFormatter={(v) => `${v}M`}
                width={50}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-2)' }}
                tickFormatter={(v) => `${v}M`}
                width={50}
              />
              <Tooltip
                formatter={(v: unknown, name: string) => {
                  const labels: Record<string, string> = {
                    distribution: '연 분배',
                    cumulative: '누적 (출자 차감 후)',
                    revenue: '프로젝트 매출',
                  };
                  return [`${(v as number).toFixed(2)} M원`, labels[name] ?? name];
                }}
                labelFormatter={(v) => `${v}년차`}
                contentStyle={{ fontSize: 11.5, borderRadius: 4, fontFamily: 'Geist Mono, monospace' }}
              />
              <ReferenceLine y={0} yAxisId="right" stroke="var(--ink-2)" />
              <Bar dataKey="distribution" yAxisId="left" fill="var(--accent, #1264D3)" maxBarSize={18} />
              <Line
                dataKey="cumulative"
                yAxisId="right"
                type="monotone"
                stroke="var(--ink, #0a0c0f)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--muted-2)', paddingTop: 8 }}>
          <LegendDot color="var(--accent, #1264D3)" label="연 분배 (좌축)" />
          <LegendDot color="var(--ink, #0a0c0f)" label="누적 분배 - 출자 (우축)" />
        </div>
      </section>

      <section
        style={{
          background: '#fff',
          border: '1px solid var(--line, #e5e7eb)',
          borderRadius: 6,
          padding: 18,
        }}
      >
        <button
          type="button"
          onClick={() => setShowKeaSchedule(!showKeaSchedule)}
          style={{
            ...collapseHeaderStyle,
            margin: 0,
            padding: 0,
            border: 'none',
            background: 'transparent',
          }}
          aria-expanded={showKeaSchedule}
        >
          <span style={{ fontSize: 15, fontWeight: 600 }}>KEA 융자금 상환 일정</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {result.kea_loan_schedule.length}년 ({showKeaSchedule ? '▾' : '▸'})
          </span>
        </button>
        {showKeaSchedule && result.kea_loan_schedule.length > 0 && (
          <div style={{ marginTop: 12, maxHeight: 320, overflow: 'auto', border: '1px solid var(--line)', borderRadius: 4 }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#fafafa', borderBottom: '1px solid var(--line)' }}>
                <tr>
                  <th style={thStyle}>연차</th>
                  <th style={thStyleRight}>이자</th>
                  <th style={thStyleRight}>원금</th>
                  <th style={thStyleRight}>잔액</th>
                </tr>
              </thead>
              <tbody>
                {result.kea_loan_schedule.map((row) => (
                  <tr key={row.year} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={tdStyle}>{row.year}년</td>
                    <td style={tdStyleNum}>{row.interest.toLocaleString('ko-KR')}원</td>
                    <td style={tdStyleNum}>{row.principal.toLocaleString('ko-KR')}원</td>
                    <td style={tdStyleNum}>{row.remaining_balance.toLocaleString('ko-KR')}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Disclaimers (FR-O-006 §처리-12 — both lines mandatory)
// ────────────────────────────────────────────────────────────────────────────

function Disclaimers(): JSX.Element {
  return (
    <section
      style={{
        marginTop: 24,
        padding: 16,
        background: '#fff7ed',
        borderLeft: '3px solid #f59e0b',
        fontSize: 12,
        color: '#7c2d12',
        lineHeight: 1.6,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>중요 고지사항</div>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        <li>본 시뮬레이션은 가정 기반이며 실제 수익을 보장하지 않습니다.</li>
        <li>재생에너지지원사업 융자금 적용은 한국에너지공단 심사 후 확정됩니다.</li>
      </ul>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Form primitives
// ────────────────────────────────────────────────────────────────────────────

function InputCard({
  title,
  children,
  warning,
}: {
  title: string;
  children: React.ReactNode;
  warning?: string;
}): JSX.Element {
  return (
    <div
      style={{
        background: '#fff',
        border: `1px solid ${warning ? '#fca5a5' : 'var(--line, #e5e7eb)'}`,
        borderRadius: 6,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{title}</div>
      {children}
      {warning && (
        <div style={{ fontSize: 11, color: '#b91c1c', background: '#fef2f2', padding: '6px 8px', borderRadius: 3 }}>
          {warning}
        </div>
      )}
    </div>
  );
}

function SliderRow({
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}): JSX.Element {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={labelStyle}>
          {label}
          {hint && <span style={{ color: 'var(--muted-2, #8A93A0)', marginLeft: 4 }}>· {hint}</span>}
        </span>
        <span className="num" style={{ fontSize: 12, fontWeight: 700 }}>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--ink, #0a0c0f)' }}
      />
    </label>
  );
}

function CapitalSlider({
  label,
  hint,
  value,
  max,
  tone,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  max: number;
  tone: string;
  onChange: (v: number) => void;
}): JSX.Element {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={labelStyle}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: tone, marginRight: 6, verticalAlign: 'middle' }} />
          {label}
          {hint && <span style={{ color: 'var(--muted-2, #8A93A0)', marginLeft: 4, fontSize: 10.5 }}>· {hint}</span>}
        </span>
        <span className="num" style={{ fontSize: 12, fontWeight: 700, color: tone }}>{value.toFixed(1)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: tone }}
      />
    </label>
  );
}

function NumberInput({
  label,
  suffix,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}): JSX.Element {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={labelStyle}>{label}</span>
        <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{format(value)}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)));
          }}
          style={{
            flex: 1,
            padding: '6px 8px',
            border: '1px solid var(--line, #e5e7eb)',
            borderRadius: 3,
            fontSize: 12,
            fontFamily: 'Geist Mono, monospace',
          }}
        />
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--ink, #0a0c0f)' }}
      />
    </label>
  );
}

function LegendDot({ color, label }: { color: string; label: string }): JSX.Element {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 14, height: 2, background: color, display: 'inline-block' }} />
      <span>{label}</span>
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 11.5,
  color: 'var(--muted, #5C6470)',
  fontWeight: 500,
};

const summaryRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 12,
  paddingTop: 8,
  borderTop: '1px solid var(--line, #e5e7eb)',
};

const collapseHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  padding: '6px 0',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ink, #0a0c0f)',
  marginTop: 4,
};

function scenarioBtnStyle(active: boolean, tone: string): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'center',
    padding: '8px 4px',
    border: `1px solid ${active ? tone : 'var(--line, #e5e7eb)'}`,
    borderRadius: 4,
    background: active ? tone : '#fff',
    color: active ? '#fff' : 'var(--ink, #0a0c0f)',
    cursor: 'pointer',
  };
}

const primaryBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 12px',
  background: 'var(--ink, #0a0c0f)',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: '10px 12px',
  background: '#fff',
  color: 'var(--ink, #0a0c0f)',
  border: '1px solid var(--line, #e5e7eb)',
  borderRadius: 4,
  fontSize: 12,
  cursor: 'pointer',
};

const errorBoxStyle: React.CSSProperties = {
  padding: 16,
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: 4,
  color: '#991b1b',
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--muted, #5C6470)',
  padding: '8px 10px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const thStyleRight: React.CSSProperties = { ...thStyle, textAlign: 'right' };

const tdStyle: React.CSSProperties = {
  padding: '6px 10px',
  fontSize: 12,
};

const tdStyleNum: React.CSSProperties = {
  ...tdStyle,
  textAlign: 'right',
  fontFamily: 'Geist Mono, monospace',
  fontVariantNumeric: 'tabular-nums',
};
