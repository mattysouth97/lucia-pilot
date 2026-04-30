// 투자 시뮬레이터 — Solar PV installation financial model.
//
// LH operations sizes a candidate rooftop here before approving CAPEX. The
// page is a pure derived-state pro-forma: one parameter object → one model
// object → multiple read-only views (roof layout, CAPEX waterfall, 25-year
// cashflow, NPV/IRR/Payback/LCOE).
//
// Settlement split anchors to FR-S-004 verbatim (LH 64.2 / 국민임대 10.9 /
// 에너지소외 35.8) so the planning surface and the live engine speak the same
// allocation. The simulator is forecasting; the engine is audited truth.
//
// All money is KRW. All energy is kWh. All areas are m².

import { useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Icons } from '@/components/Icons';
import { Pill, fmt } from '@/components/atoms';

// ────────────────────────────────────────────────────────────────────────────
// Reference tables — typed `as const` for noUncheckedIndexedAccess safety.
// ────────────────────────────────────────────────────────────────────────────

const PANELS = [
  { id: '350W', wattage: 350, w: 1.94, h: 0.99, eff: 18.2 },
  { id: '450W', wattage: 450, w: 2.10, h: 1.13, eff: 19.0 },
  { id: '550W', wattage: 550, w: 2.28, h: 1.13, eff: 21.4 },
  { id: '600W', wattage: 600, w: 2.38, h: 1.13, eff: 22.3 },
] as const;
type PanelId = (typeof PANELS)[number]['id'];

// CAPEX components in KRW per kWp installed. Korean rooftop benchmark, 2026.
const CAPEX_BREAKDOWN = [
  { id: 'panels',      label: '모듈',         rate: 580_000 },
  { id: 'inverter',    label: '인버터',       rate: 180_000 },
  { id: 'mounting',    label: '구조·가대',    rate: 250_000 },
  { id: 'wiring',      label: '배선·보호',    rate:  90_000 },
  { id: 'install',     label: '설치 인건비',  rate: 220_000 },
  { id: 'engineer',    label: '인허가·설계',  rate:  90_000 },
  { id: 'grid',        label: '계통 연계',    rate:  60_000 },
  { id: 'contingency', label: '예비비',       rate:  80_000 },
] as const;

const TOTAL_CAPEX_PER_KW = CAPEX_BREAKDOWN.reduce((s, c) => s + c.rate, 0);

// FR-S-004 anchors — kept verbatim per FRD. Visualization only; the engine
// is the source of truth for actual allocation at clearing time.
const SETTLEMENT_ANCHORS = [
  { id: 'lh',     label: 'LH SaaS',     pct: 0.642, color: 'var(--ink)' },
  { id: 'public', label: '국민임대',     pct: 0.109, color: 'var(--accent)' },
  { id: 'energy', label: '에너지소외',   pct: 0.358, color: 'var(--accent-ink)' },
] as const;

// ────────────────────────────────────────────────────────────────────────────
// Parameter state
// ────────────────────────────────────────────────────────────────────────────

interface Params {
  // Site
  roofArea: number;        // m²
  usableFactor: number;    // 0–1, fraction of roof area available for panels
  tilt: number;            // degrees
  azimuth: number;         // degrees from south, ±45 max
  shadingLoss: number;     // 0–0.3
  specificYield: number;   // kWh/kWp/year (Korean rooftop ~1300–1500)

  // System
  panelId: PanelId;
  layoutOverhead: number;  // ≥1.0 multiplier on panel footprint for aisles/setbacks

  // Tariff
  smpPrice: number;        // KRW/kWh
  recPrice: number;        // KRW/kWh-equivalent (i.e. KRW per kWh × weight)
  recWeight: number;       // multiplier on REC

  // Financial
  discountRate: number;    // 0–0.20
  degradation: number;     // 0–0.02 per year
  tariffEscalation: number;// 0–0.05 per year
  opexPerKw: number;       // KRW/kWp/year (O&M + insurance + replacement reserve)
  capexAdjust: number;     // 0.7–1.3 multiplier on benchmark CAPEX
  horizon: number;         // years (typical 25)
}

const DEFAULT_PARAMS: Params = {
  roofArea: 1200,
  usableFactor: 0.72,
  tilt: 28,
  azimuth: 0,
  shadingLoss: 0.06,
  specificYield: 1380,

  panelId: '550W',
  layoutOverhead: 1.4,

  smpPrice: 145,
  recPrice: 58,
  recWeight: 1.2,

  discountRate: 0.055,
  degradation: 0.005,
  tariffEscalation: 0.015,
  opexPerKw: 45_000,
  capexAdjust: 1.0,
  horizon: 25,
};

// ────────────────────────────────────────────────────────────────────────────
// Model — single derivation pipeline (params → model)
// ────────────────────────────────────────────────────────────────────────────

interface YearRow {
  year: number;
  generationKwh: number;
  revenue: number;
  opex: number;
  netCashflow: number;
  cumulative: number;
  discounted: number;
}

interface Model {
  panel: (typeof PANELS)[number];
  panelArea: number;       // m²
  panelFootprint: number;  // m² with overhead
  usableArea: number;      // m²
  numPanels: number;
  installedKw: number;
  panelGridCols: number;
  panelGridRows: number;

  capexPerKw: number;
  totalCapex: number;
  capexLines: { id: string; label: string; cost: number }[];

  yearOneGeneration: number;
  yearOneRevenue: number;
  effectiveTariff: number; // KRW/kWh year 1

  years: YearRow[];        // index 0 = year 0 outflow; index 1..N = operating years
  npv: number;
  irr: number | null;
  paybackYears: number | null;
  lcoe: number;            // KRW/kWh

  // Settlement split (year 1 anchors)
  yearOneSplit: { id: string; label: string; amount: number; color: string }[];
}

function tiltLossFactor(tilt: number, azimuth: number): number {
  // Quadratic loss vs optimal (tilt=30, azimuth=0). Rough but monotonic.
  const tiltLoss = 0.0003 * Math.pow(tilt - 30, 2);
  const azLoss = 0.0001 * Math.pow(azimuth, 2);
  return Math.max(0.7, 1 - tiltLoss - azLoss);
}

function deriveModel(p: Params): Model {
  const panel = PANELS.find((pk) => pk.id === p.panelId) ?? PANELS[2];
  const panelArea = panel.w * panel.h;
  const panelFootprint = panelArea * p.layoutOverhead;

  const usableArea = p.roofArea * p.usableFactor;
  const numPanels = Math.max(0, Math.floor(usableArea / panelFootprint));
  const installedKw = (numPanels * panel.wattage) / 1000;

  // Visual grid layout — assume ~1.5:1 roof aspect, fit a rectangular grid.
  const aspect = 1.5;
  const cols = Math.max(1, Math.round(Math.sqrt(numPanels * aspect)));
  const rows = numPanels > 0 ? Math.ceil(numPanels / cols) : 0;

  // CAPEX
  const capexPerKw = TOTAL_CAPEX_PER_KW * p.capexAdjust;
  const totalCapex = capexPerKw * installedKw;
  const capexLines = CAPEX_BREAKDOWN.map((c) => ({
    id: c.id,
    label: c.label,
    cost: c.rate * p.capexAdjust * installedKw,
  }));

  // Year-1 generation
  const tiltFactor = tiltLossFactor(p.tilt, p.azimuth);
  const shading = 1 - p.shadingLoss;
  const yearOneGeneration = installedKw * p.specificYield * tiltFactor * shading;
  const effectiveTariff = p.smpPrice + p.recPrice * p.recWeight;
  const yearOneRevenue = yearOneGeneration * effectiveTariff;

  // 0..horizon cashflows. Year 0 = -CAPEX. Years 1..horizon = revenue - opex.
  const years: YearRow[] = [];
  let cumulative = -totalCapex;
  years.push({
    year: 0,
    generationKwh: 0,
    revenue: 0,
    opex: 0,
    netCashflow: -totalCapex,
    cumulative,
    discounted: -totalCapex,
  });

  for (let y = 1; y <= p.horizon; y++) {
    const degradeFactor = Math.pow(1 - p.degradation, y - 1);
    const escalationFactor = Math.pow(1 + p.tariffEscalation, y - 1);
    const generation = yearOneGeneration * degradeFactor;
    const revenue = generation * effectiveTariff * escalationFactor;
    const opex = installedKw * p.opexPerKw;
    const net = revenue - opex;
    cumulative += net;
    const discounted = net / Math.pow(1 + p.discountRate, y);
    years.push({
      year: y,
      generationKwh: generation,
      revenue,
      opex,
      netCashflow: net,
      cumulative,
      discounted,
    });
  }

  const cashflows = years.map((r) => r.netCashflow);
  const npv = years.reduce((s, r) => s + r.discounted, 0);
  const irr = computeIRR(cashflows);
  const paybackYears = computePayback(cashflows);
  const lcoe = computeLCOE(years, totalCapex, p.discountRate);

  const yearOneSplit = SETTLEMENT_ANCHORS.map((a) => ({
    id: a.id,
    label: a.label,
    amount: yearOneRevenue * a.pct,
    color: a.color,
  }));

  return {
    panel,
    panelArea,
    panelFootprint,
    usableArea,
    numPanels,
    installedKw,
    panelGridCols: cols,
    panelGridRows: rows,
    capexPerKw,
    totalCapex,
    capexLines,
    yearOneGeneration,
    yearOneRevenue,
    effectiveTariff,
    years,
    npv,
    irr,
    paybackYears,
    lcoe,
    yearOneSplit,
  };
}

// IRR — bisection on [-50%, +100%]. Converges to ~0.01% precision in <30 iters.
function computeIRR(cashflows: number[]): number | null {
  if (cashflows.length === 0) return null;
  const npvAt = (rate: number) =>
    cashflows.reduce((s, cf, i) => s + cf / Math.pow(1 + rate, i), 0);

  let low = -0.5;
  let high = 1.0;
  const npvLow = npvAt(low);
  const npvHigh = npvAt(high);
  if (Number.isNaN(npvLow) || Number.isNaN(npvHigh)) return null;
  if (npvLow * npvHigh > 0) return null; // no sign change → no IRR

  for (let i = 0; i < 80; i++) {
    const mid = (low + high) / 2;
    const npvMid = npvAt(mid);
    if (Math.abs(npvMid) < 1) return mid;
    if (npvMid * npvAt(low) < 0) high = mid;
    else low = mid;
  }
  return (low + high) / 2;
}

// Payback — first year where cumulative crosses zero, with linear interpolation.
function computePayback(cashflows: number[]): number | null {
  let cumulative = 0;
  for (let i = 0; i < cashflows.length; i++) {
    const cf = cashflows[i] ?? 0;
    const before = cumulative;
    cumulative += cf;
    if (before < 0 && cumulative >= 0 && cf !== 0) {
      return i - 1 + -before / cf;
    }
  }
  return null;
}

// LCOE = PV(CAPEX + OPEX) / PV(Generation). Standard NREL-style.
function computeLCOE(years: YearRow[], totalCapex: number, discountRate: number): number {
  let pvOpex = 0;
  let pvGen = 0;
  for (const r of years) {
    if (r.year === 0) continue;
    pvOpex += r.opex / Math.pow(1 + discountRate, r.year);
    pvGen += r.generationKwh / Math.pow(1 + discountRate, r.year);
  }
  if (pvGen === 0) return 0;
  return (totalCapex + pvOpex) / pvGen;
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export function InstallSimulator() {
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const model = useMemo(() => deriveModel(params), [params]);

  const update = <K extends keyof Params>(key: K, value: Params[K]) =>
    setParams((p) => ({ ...p, [key]: value }));

  return (
    <>
      <HeroBand model={model} onReset={() => setParams(DEFAULT_PARAMS)} />

      <div className="grid-dashboard" style={{ marginBottom: 24 }}>
        <SiteAndSystemCard params={params} update={update} model={model} />
        <RoofVisualizationCard model={model} />
      </div>

      <div className="grid-card-pair-eq" style={{ marginBottom: 24 }}>
        <CapexCard model={model} params={params} update={update} />
        <RevenueCard model={model} params={params} update={update} />
      </div>

      <CashflowCard model={model} params={params} update={update} />

      <SettlementSplitCard model={model} />

      <Footnote />
    </>
  );
}

/* ===================================================================== *
 * Hero band — NPV is the hero; IRR / payback / LCOE underline it.        *
 * ===================================================================== */

function HeroBand({ model, onReset }: { model: Model; onReset: () => void }) {
  const npvPositive = model.npv >= 0;
  return (
    <section
      className="hero-band"
      style={{ background: npvPositive ? '#0E5E42' : '#3F1D2E' }}
    >
      <div className="hero-band-top">
        <div className="hero-band-meta">
          <span className="num">투자 시뮬레이션 · v1</span>
          <span className="sep">·</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="live-dot" />
            <span>실시간 추산</span>
          </span>
          <span className="sep">·</span>
          <span>FR-S-004 기준</span>
        </div>
        <div className="hero-band-actions">
          <button type="button" className="hero-band-cta" onClick={onReset}>
            <span style={{ display: 'inline-flex' }}>{Icons.Settings}</span>
            기본값으로 초기화
          </button>
        </div>
      </div>

      <div className="hero-headline-figure">
        <div className="hero-headline-label">
          순현재가치 (NPV) · 25년 · 할인율 5.5% 기준
        </div>
        <div className="hero-headline-value">
          <span>
            {npvPositive ? '+' : '−'}₩{Math.abs(model.npv).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
          </span>
          <span
            className="hero-headline-value-delta"
            style={{
              background: npvPositive ? 'rgba(52, 211, 153, 0.18)' : 'rgba(244, 114, 182, 0.18)',
              color: npvPositive ? '#34D399' : '#F472B6',
            }}
          >
            {npvPositive ? '투자 적합' : '재검토 필요'}
          </span>
        </div>
        <div className="hero-headline-meta">
          <span>
            IRR{' '}
            <span className="num">
              {model.irr != null ? `${(model.irr * 100).toFixed(2)}%` : '—'}
            </span>
          </span>
          <span className="sep">·</span>
          <span>
            회수기간{' '}
            <span className="num">
              {model.paybackYears != null ? `${model.paybackYears.toFixed(1)}년` : '회수불가'}
            </span>
          </span>
          <span className="sep">·</span>
          <span>
            LCOE <span className="num">{model.lcoe.toFixed(0)}</span> 원/kWh
          </span>
          <span className="sep">·</span>
          <span>
            설치용량 <span className="num">{model.installedKw.toFixed(1)}</span> kWp
          </span>
          <span className="sep">·</span>
          <span>
            CAPEX <span className="num">₩{(model.totalCapex / 1_000_000).toFixed(1)}M</span>
          </span>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================== *
 * Site & System input card — sliders only, value rendered live           *
 * ===================================================================== */

function SiteAndSystemCard({
  params,
  update,
  model,
}: {
  params: Params;
  update: <K extends keyof Params>(key: K, value: Params[K]) => void;
  model: Model;
}) {
  return (
    <section className="card card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <SectionHead
        overline="입력 파라미터"
        title="부지 · 시스템"
        meta={`${model.numPanels.toLocaleString('ko-KR')}장 · ${model.installedKw.toFixed(1)}kWp`}
      />

      <SubGroup title="옥상">
        <Slider
          label="옥상 면적"
          value={params.roofArea}
          unit="m²"
          min={200}
          max={5000}
          step={50}
          format={(v) => fmt.n(v)}
          onChange={(v) => update('roofArea', v)}
        />
        <Slider
          label="가용 면적 비율"
          value={params.usableFactor}
          unit="%"
          min={0.3}
          max={0.95}
          step={0.01}
          format={(v) => (v * 100).toFixed(0)}
          onChange={(v) => update('usableFactor', v)}
        />
        <Slider
          label="경사각"
          value={params.tilt}
          unit="°"
          min={5}
          max={45}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={(v) => update('tilt', v)}
        />
        <Slider
          label="방위각 (남향=0)"
          value={params.azimuth}
          unit="°"
          min={-60}
          max={60}
          step={1}
          format={(v) => (v >= 0 ? `+${v.toFixed(0)}` : v.toFixed(0))}
          onChange={(v) => update('azimuth', v)}
        />
      </SubGroup>

      <SubGroup title="모듈">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={panelLabelStyle}>모듈 선택</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {PANELS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => update('panelId', p.id)}
                style={panelOptionStyle(params.panelId === p.id)}
              >
                <span style={{ fontWeight: 700, fontSize: 13 }}>{p.id}</span>
                <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>
                  η {p.eff.toFixed(1)}%
                </span>
              </button>
            ))}
          </div>
        </div>
        <Slider
          label="배치 여유 계수"
          value={params.layoutOverhead}
          unit="×"
          min={1.1}
          max={1.8}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={(v) => update('layoutOverhead', v)}
        />
      </SubGroup>

      <SubGroup title="입지">
        <Slider
          label="일조량 (kWh/kWp/년)"
          value={params.specificYield}
          unit=""
          min={1100}
          max={1600}
          step={10}
          format={(v) => fmt.n(v)}
          onChange={(v) => update('specificYield', v)}
        />
        <Slider
          label="음영 손실"
          value={params.shadingLoss}
          unit="%"
          min={0}
          max={0.3}
          step={0.005}
          format={(v) => (v * 100).toFixed(1)}
          onChange={(v) => update('shadingLoss', v)}
        />
      </SubGroup>
    </section>
  );
}

function SubGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          paddingBottom: 6,
          borderBottom: '1px solid var(--line)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

const panelLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--muted)',
  fontWeight: 500,
};

function panelOptionStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '8px 4px',
    background: active ? 'var(--ink)' : 'var(--panel)',
    color: active ? '#fff' : 'var(--ink)',
    border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
    borderRadius: 'var(--r-md)',
    cursor: 'pointer',
    transition: 'background-color .12s, border-color .12s, color .12s',
  };
}

/* ===================================================================== *
 * Slider primitive — label + bar + monumental value                      *
 * ===================================================================== */

interface SliderProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function Slider({ label, value, unit, min, max, step, format, onChange }: SliderProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={panelLabelStyle}>{label}</span>
        <span
          className="num"
          style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}
        >
          {format(value)}
          {unit && (
            <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--muted-2)', fontWeight: 500 }}>
              {unit}
            </span>
          )}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: 'var(--ink)',
          height: 4,
        }}
      />
    </label>
  );
}

/* ===================================================================== *
 * Roof visualization — SVG showing panel grid on a roof rectangle        *
 * ===================================================================== */

function RoofVisualizationCard({ model }: { model: Model }) {
  // Roof rectangle viewbox: assume 1.5:1 aspect.
  const aspect = 1.5;
  const vbW = 600;
  const vbH = vbW / aspect;
  const setbackPct = 0.06;
  const inner = {
    x: vbW * setbackPct,
    y: vbH * setbackPct,
    w: vbW * (1 - 2 * setbackPct),
    h: vbH * (1 - 2 * setbackPct),
  };

  const cols = model.panelGridCols;
  const rows = model.panelGridRows;
  const remainder = model.numPanels - (rows - 1) * cols;
  const panelW = cols > 0 ? inner.w / cols : 0;
  const panelH = rows > 0 ? inner.h / rows : 0;
  const padding = Math.min(panelW, panelH) * 0.08;

  return (
    <section
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <SectionHead
        overline="배치 시각화"
        title={`${model.panel.id} 모듈 ${model.numPanels.toLocaleString('ko-KR')}장`}
        meta={`${model.usableArea.toFixed(0)} m² 가용`}
      />

      <div
        style={{
          background: '#FAFAFA',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-sm)',
          padding: 16,
        }}
      >
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Roof outline */}
          <rect
            x={1}
            y={1}
            width={vbW - 2}
            height={vbH - 2}
            fill="#FFFFFF"
            stroke="var(--line-2)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          {/* Setback shading */}
          <rect
            x={inner.x}
            y={inner.y}
            width={inner.w}
            height={inner.h}
            fill="#F4F5F7"
            stroke="none"
          />
          {/* Panel grid */}
          {Array.from({ length: rows }).flatMap((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const idx = r * cols + c;
              if (idx >= model.numPanels) return null;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={inner.x + c * panelW + padding}
                  y={inner.y + r * panelH + padding}
                  width={panelW - padding * 2}
                  height={panelH - padding * 2}
                  fill="var(--ink)"
                  rx={1}
                />
              );
            }),
          )}
          {/* North arrow */}
          <g transform={`translate(${vbW - 50}, 28)`}>
            <circle cx={0} cy={0} r={14} fill="#fff" stroke="var(--line-2)" />
            <path d="M0 -10 L4 6 L0 2 L-4 6 Z" fill="var(--ink)" />
            <text
              x={0}
              y={-18}
              textAnchor="middle"
              fontSize={9}
              fontFamily="Geist Mono, monospace"
              fill="var(--muted)"
            >
              N
            </text>
          </g>
          {/* Capacity badge */}
          <g transform={`translate(${vbW - 130}, ${vbH - 36})`}>
            <rect
              x={0}
              y={0}
              width={120}
              height={26}
              fill="var(--ink)"
              rx={4}
            />
            <text
              x={60}
              y={17}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fontFamily="Geist Mono, monospace"
              fill="#fff"
              letterSpacing="-0.02em"
            >
              {model.installedKw.toFixed(1)} kWp
            </text>
          </g>
        </svg>
      </div>

      <div className="grid-stats" style={{ borderRadius: 'var(--r-sm)' }}>
        <Cell label="모듈 수" value={fmt.n(model.numPanels)} unit="장" />
        <Cell label="모듈 면적" value={(model.panelArea).toFixed(2)} unit="m²/장" />
        <Cell label="배열 (행 × 열)" value={`${model.panelGridRows} × ${model.panelGridCols}`} unit="" />
        <Cell label="설치 밀도" value={(model.installedKw / Math.max(1, model.usableArea) * 1000).toFixed(0)} unit="W/m²" />
      </div>
      {remainder !== model.panelGridCols && model.numPanels > 0 && (
        <div style={{ fontSize: 11, color: 'var(--muted-2)' }}>
          마지막 행 {remainder}장 · 잔여 공간은 점검 통로 · 안전구역으로 활용.
        </div>
      )}
    </section>
  );
}

/* ===================================================================== *
 * CAPEX breakdown — stacked horizontal bar with line items               *
 * ===================================================================== */

function CapexCard({
  model,
  params,
  update,
}: {
  model: Model;
  params: Params;
  update: <K extends keyof Params>(key: K, value: Params[K]) => void;
}) {
  const total = model.totalCapex;
  return (
    <section
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      <SectionHead
        overline="투자비 (CAPEX)"
        title={`₩${(total / 1_000_000).toFixed(1)}M`}
        meta={`₩${fmt.n(model.capexPerKw)}/kWp`}
      />

      {/* Stacked bar */}
      <div
        style={{
          display: 'flex',
          height: 24,
          borderRadius: 'var(--r-sm)',
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}
      >
        {model.capexLines.map((line, i) => {
          const pct = total > 0 ? (line.cost / total) * 100 : 0;
          return (
            <div
              key={line.id}
              title={`${line.label} ₩${fmt.n(line.cost)} (${pct.toFixed(1)}%)`}
              style={{
                width: `${pct}%`,
                background: capexLineColor(i),
                borderRight: i < model.capexLines.length - 1 ? '1px solid #fff' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Line items */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {model.capexLines.map((line, i) => {
          const pct = total > 0 ? (line.cost / total) * 100 : 0;
          return (
            <div
              key={line.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '12px 1fr auto auto',
                gap: 10,
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: i < model.capexLines.length - 1 ? '1px solid var(--line)' : 'none',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: capexLineColor(i),
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{line.label}</span>
              <span className="num" style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                {pct.toFixed(1)}%
              </span>
              <span
                className="num"
                style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', minWidth: 96, textAlign: 'right' }}
              >
                ₩{fmt.n(line.cost)}
              </span>
            </div>
          );
        })}
      </div>

      <Slider
        label="CAPEX 조정 (벤치마크 대비)"
        value={params.capexAdjust}
        unit="×"
        min={0.7}
        max={1.3}
        step={0.01}
        format={(v) => v.toFixed(2)}
        onChange={(v) => update('capexAdjust', v)}
      />
    </section>
  );
}

function capexLineColor(i: number): string {
  const palette = [
    'var(--ink)',
    'var(--ink-2)',
    '#3A4350',
    '#5C6470',
    '#8A93A0',
    '#A8AFB9',
    'var(--accent-ink)',
    'var(--accent)',
  ] as const;
  return palette[i % palette.length] ?? 'var(--ink)';
}

/* ===================================================================== *
 * Revenue / tariff card — year 1 numbers with tariff sliders             *
 * ===================================================================== */

function RevenueCard({
  model,
  params,
  update,
}: {
  model: Model;
  params: Params;
  update: <K extends keyof Params>(key: K, value: Params[K]) => void;
}) {
  return (
    <section
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
    >
      <SectionHead
        overline="연간 매출 · 1년차"
        title={`₩${(model.yearOneRevenue / 1_000_000).toFixed(2)}M`}
        meta={`${fmt.n(Math.round(model.yearOneGeneration))} kWh`}
      />

      <div className="grid-stats" style={{ borderRadius: 'var(--r-sm)' }}>
        <Cell label="발전량" value={fmt.n(Math.round(model.yearOneGeneration))} unit="kWh/년" />
        <Cell label="유효 단가" value={fmt.n(Math.round(model.effectiveTariff))} unit="원/kWh" />
        <Cell
          label="수율 (원/kWp)"
          value={fmt.n(Math.round(model.yearOneRevenue / Math.max(1, model.installedKw)))}
          unit="원"
        />
      </div>

      <Slider
        label="SMP 단가"
        value={params.smpPrice}
        unit="원/kWh"
        min={80}
        max={250}
        step={1}
        format={(v) => v.toFixed(0)}
        onChange={(v) => update('smpPrice', v)}
      />
      <Slider
        label="REC 단가"
        value={params.recPrice}
        unit="원/kWh"
        min={20}
        max={120}
        step={1}
        format={(v) => v.toFixed(0)}
        onChange={(v) => update('recPrice', v)}
      />
      <Slider
        label="REC 가중치"
        value={params.recWeight}
        unit="×"
        min={0.7}
        max={1.5}
        step={0.05}
        format={(v) => v.toFixed(2)}
        onChange={(v) => update('recWeight', v)}
      />

      <div
        style={{
          padding: 12,
          background: 'var(--accent-soft)',
          borderRadius: 'var(--r-sm)',
          fontSize: 11.5,
          color: 'var(--accent-ink)',
          lineHeight: 1.55,
        }}
      >
        SMP({params.smpPrice}) + REC({params.recPrice})×가중치({params.recWeight.toFixed(2)}) ={' '}
        <span className="num" style={{ fontWeight: 700 }}>
          {Math.round(model.effectiveTariff)}
        </span>{' '}
        원/kWh
      </div>
    </section>
  );
}

/* ===================================================================== *
 * 25-year cashflow chart — bar = annual net, line = cumulative           *
 * ===================================================================== */

function CashflowCard({
  model,
  params,
  update,
}: {
  model: Model;
  params: Params;
  update: <K extends keyof Params>(key: K, value: Params[K]) => void;
}) {
  // Tooltip-friendly chart data — drop year 0 outflow from the bar series so it
  // doesn't dominate the chart, but show it as a reference at start.
  const chartData = model.years.map((r) => ({
    year: r.year,
    netCashflow: r.year === 0 ? 0 : r.netCashflow / 1_000_000, // millions
    cumulative: r.cumulative / 1_000_000,
    revenue: r.revenue / 1_000_000,
  }));

  return (
    <section
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <SectionHead
          overline="현금흐름"
          title={`${params.horizon}년 누적 시뮬레이션`}
          meta={`회수기간 ${model.paybackYears != null ? model.paybackYears.toFixed(1) + '년' : '회수불가'}`}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Pill tone={model.npv >= 0 ? 'green' : 'rose'} dot>
            NPV {model.npv >= 0 ? '+' : '−'}₩{Math.abs(model.npv / 1_000_000).toFixed(1)}M
          </Pill>
          <Pill tone="neutral" dot>
            IRR {model.irr != null ? `${(model.irr * 100).toFixed(2)}%` : '—'}
          </Pill>
          <Pill tone="neutral" dot>
            LCOE {model.lcoe.toFixed(0)}원/kWh
          </Pill>
        </div>
      </div>

      <div style={{ width: '100%', height: 320, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="year"
              axisLine={{ stroke: 'var(--line-2)' }}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-2)' }}
              tickFormatter={(v) => (v === 0 ? '투자' : `${v}년`)}
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
              contentStyle={{
                borderRadius: 4,
                border: '1px solid var(--line-2)',
                fontSize: 11.5,
                boxShadow: 'none',
                padding: '8px 10px',
                fontFamily: 'Geist Mono, monospace',
              }}
              formatter={(v: unknown, name: string) => {
                const num = (v as number).toFixed(2);
                const labels: Record<string, string> = {
                  netCashflow: '연간 순현금흐름',
                  cumulative: '누적 현금흐름',
                };
                return [`${num} M원`, labels[name] ?? name];
              }}
              labelFormatter={(v) => (v === 0 ? '투자 시점 (Year 0)' : `${v}년차`)}
            />
            <ReferenceLine
              y={0}
              yAxisId="right"
              stroke="var(--ink-2)"
              strokeWidth={1}
            />
            <Bar
              dataKey="netCashflow"
              yAxisId="left"
              fill="var(--accent)"
              maxBarSize={18}
              radius={[2, 2, 0, 0]}
            />
            <Line
              dataKey="cumulative"
              yAxisId="right"
              type="monotone"
              stroke="var(--ink)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'var(--ink)' }}
            />
            {model.paybackYears != null && (
              <ReferenceLine
                x={model.paybackYears}
                yAxisId="right"
                stroke="var(--accent-ink)"
                strokeDasharray="3 3"
                label={{
                  value: '회수',
                  position: 'top',
                  fill: 'var(--accent-ink)',
                  fontSize: 10,
                  fontFamily: 'Geist Mono, monospace',
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          fontSize: 11,
          color: 'var(--muted-2)',
          display: 'flex',
          gap: 18,
          flexWrap: 'wrap',
          paddingTop: 4,
        }}
      >
        <LegendDot color="var(--accent)" label="연간 순현금흐름 (좌축)" />
        <LegendDot color="var(--ink)" label="누적 현금흐름 (우축)" />
        <LegendDot color="var(--accent-ink)" label="회수 시점" dashed />
      </div>

      <div
        style={{
          display: 'grid',
          gap: 14,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          paddingTop: 12,
          borderTop: '1px solid var(--line)',
        }}
      >
        <Slider
          label="할인율 (WACC)"
          value={params.discountRate}
          unit="%"
          min={0.01}
          max={0.15}
          step={0.005}
          format={(v) => (v * 100).toFixed(2)}
          onChange={(v) => update('discountRate', v)}
        />
        <Slider
          label="모듈 출력 저하율"
          value={params.degradation}
          unit="%/년"
          min={0.002}
          max={0.015}
          step={0.0005}
          format={(v) => (v * 100).toFixed(2)}
          onChange={(v) => update('degradation', v)}
        />
        <Slider
          label="단가 상승률"
          value={params.tariffEscalation}
          unit="%/년"
          min={0}
          max={0.05}
          step={0.0025}
          format={(v) => (v * 100).toFixed(2)}
          onChange={(v) => update('tariffEscalation', v)}
        />
        <Slider
          label="O&M 비용"
          value={params.opexPerKw}
          unit="원/kWp/년"
          min={20_000}
          max={80_000}
          step={1_000}
          format={(v) => fmt.n(v)}
          onChange={(v) => update('opexPerKw', v)}
        />
        <Slider
          label="시뮬레이션 기간"
          value={params.horizon}
          unit="년"
          min={10}
          max={30}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={(v) => update('horizon', v)}
        />
      </div>
    </section>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 14,
          height: 2,
          background: dashed ? 'transparent' : color,
          borderTop: dashed ? `2px dashed ${color}` : 'none',
          display: 'inline-block',
        }}
      />
      <span>{label}</span>
    </span>
  );
}

/* ===================================================================== *
 * Settlement split — FR-S-004 anchors mapped over year-1 revenue          *
 * ===================================================================== */

function SettlementSplitCard({ model }: { model: Model }) {
  return (
    <section
      className="card card-pad"
      style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}
    >
      <SectionHead
        overline="가상공유거래 분배 · FR-S-004"
        title="1년차 매출 분배 anchors"
        meta="LH 64.2 / 국민임대 10.9 / 에너지소외 35.8"
      />

      <div
        style={{
          display: 'flex',
          height: 36,
          borderRadius: 'var(--r-sm)',
          overflow: 'hidden',
          border: '1px solid var(--line)',
        }}
      >
        {model.yearOneSplit.map((s) => (
          <div
            key={s.id}
            style={{
              flex: s.amount,
              minWidth: 0,
              background: s.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              borderRight: '1px solid #fff',
            }}
          >
            {s.label}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 0, border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
        {model.yearOneSplit.map((s, i) => (
          <div
            key={s.id}
            style={{
              padding: 16,
              borderLeft: i > 0 ? '1px solid var(--line)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              background: 'var(--panel)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
              <span className="overline">{s.label}</span>
            </div>
            <div className="kpi-metric" style={{ fontSize: 24 }}>
              ₩{fmt.n(Math.round(s.amount))}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
              비중 <span className="num" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                {(SETTLEMENT_ANCHORS[i]?.pct ?? 0) * 100}%
              </span>{' '}
              · 월 평균 ₩{fmt.n(Math.round(s.amount / 12))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'var(--muted-2)', lineHeight: 1.55 }}>
        * 위 분배 비율은 FR-S-004 기준 anchors입니다. 실제 정산은 정산 엔진에서 매 정산
        주기별로 계산되며, 본 시뮬레이터는 사전 계획 수치만 제공합니다.
      </div>
    </section>
  );
}

/* ===================================================================== *
 * Helpers — section head + grid-stat cell                                *
 * ===================================================================== */

function SectionHead({
  overline,
  title,
  meta,
}: {
  overline: string;
  title: string;
  meta?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span className="overline">{overline}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span
          className="kpi-metric"
          style={{ fontSize: 22, letterSpacing: '-0.025em' }}
        >
          {title}
        </span>
        {meta && (
          <span
            className="num"
            style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}
          >
            {meta}
          </span>
        )}
      </div>
    </div>
  );
}

function Cell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="overline">{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
        <span className="kpi-metric" style={{ fontSize: 18 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 11, color: 'var(--muted-2)', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

function Footnote() {
  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid var(--line)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '6px 16px',
        fontSize: 11,
        color: 'var(--muted-2)',
        letterSpacing: '-0.005em',
      }}
    >
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span>벤치마크: 한국 옥상형 PV 1,550,000원/kWp · 일조량 1,380kWh/kWp/년</span>
        <span>FR-S-004 · FR-O-003 anchors</span>
      </div>
      <div className="mono" style={{ fontSize: 10.5 }}>
        sim v1.0 · pre-CAPEX planning surface
      </div>
    </div>
  );
}
