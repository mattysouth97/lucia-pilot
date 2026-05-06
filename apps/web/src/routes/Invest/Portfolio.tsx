// FR-R-006 v1.3 — investor portfolio dashboard at /invest/portfolio.
//
// Reads from the FR-R-005 LOI store (localStorage-seeded with DEMO_LOIS) and
// the v1.3 demo investor fixtures. 4 tabs:
//
//   - 출자 현황 (positions): LOI list with status badges + key terms
//   - 정산 내역 (settlements): mock per-month payouts derived from the LOI
//                            terms (no engine wired in Pilot v1.3)
//   - ESG 임팩트 (impact): aggregate kWh / CO₂ tCO₂e using the same
//                         computeESGEquivalents helper as the resident portal
//   - 문서함 (documents): LOI blockchain_hash list with status timestamps
//
// Public route — accepts ?investor=<id>. Defaults to the SK하이닉스 RE100
// fixture so the demo lands on a populated portfolio out of the box.

import { BUILDINGS_NATIONWIDE } from '@lucia/contracts';
import type { LOI, LOIStatus } from '@lucia/contracts/domain';
import { computeESGEquivalents } from '@lucia/contracts/domain';
import { DEMO_INVESTORS } from '@lucia/contracts/fixtures';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { listLOIsByInvestor } from '@/lib/loi';

const TABS = [
  { id: 'positions', label: '출자 현황' },
  { id: 'settlements', label: '정산 내역' },
  { id: 'impact', label: 'ESG 임팩트' },
  { id: 'documents', label: '문서함' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const STATUS_LABEL: Record<LOIStatus, string> = {
  draft: '작성 중',
  submitted: '제출됨',
  under_review: '검토 중',
  approved: '승인',
  rejected: '반려',
  contract: '계약 체결',
};
const STATUS_TONE: Record<LOIStatus, string> = {
  draft: '#9ca3af',
  submitted: '#1264D3',
  under_review: '#f59e0b',
  approved: '#10b981',
  rejected: '#dc2626',
  contract: '#7c3aed',
};

export function PortfolioDashboard(): JSX.Element {
  const [params, setParams] = useSearchParams();
  const investorId = params.get('investor') ?? 'i_re100_skh';
  const [tab, setTab] = useState<TabId>('positions');

  const investor = DEMO_INVESTORS.find((i) => i.id === investorId) ?? DEMO_INVESTORS[0]!;
  const lois = useMemo<LOI[]>(() => listLOIsByInvestor(investor.id), [investor.id]);

  const totalCapex = lois
    .filter((l) => l.status !== 'draft' && l.status !== 'rejected')
    .reduce((s, l) => s + l.capex_won, 0);

  const totalSites = new Set(lois.flatMap((l) => l.sites)).size;
  const investorLabel = investor.type === 're100' ? investor.company_name : investor.individual_name;

  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <header
        style={{
          background: 'var(--ink, #0a0c0f)',
          color: '#fff',
          padding: '24px 28px',
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', fontSize: 11, opacity: 0.75 }}>
          <span style={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            FR-R-006 · 투자자 포트폴리오
          </span>
          <span>·</span>
          <span style={{ padding: '2px 8px', borderRadius: 3, background: investor.type === 're100' ? '#10b981' : '#f59e0b' }}>
            {investor.type === 're100' ? 'RE100' : 'Retail'}
          </span>
        </div>
        <h1 style={{ fontSize: 28, margin: 0, letterSpacing: '-0.02em' }}>{investorLabel}</h1>
        <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 12 }}>
          <Stat label="제출 LOI" value={`${lois.length}건`} />
          <Stat label="누적 출자 (active)" value={`${(totalCapex / 100_000_000).toFixed(2)}억`} />
          <Stat label="투자 사이트" value={`${totalSites}개`} />
        </div>
      </header>

      <InvestorSwitcher current={investor.id} onChange={(id) => setParams({ investor: id })} />

      <nav
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 16,
          borderBottom: '1px solid var(--line, #e5e7eb)',
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 18px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${active ? 'var(--ink, #0a0c0f)' : 'transparent'}`,
                color: active ? 'var(--ink, #0a0c0f)' : '#6b7280',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === 'positions' && <PositionsTab lois={lois} />}
      {tab === 'settlements' && <SettlementsTab lois={lois} />}
      {tab === 'impact' && <ImpactTab lois={lois} />}
      {tab === 'documents' && <DocumentsTab lois={lois} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>{label}</span>
      <span className="num" style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{value}</span>
    </div>
  );
}

function InvestorSwitcher({
  current,
  onChange,
}: {
  current: string;
  onChange: (id: string) => void;
}): JSX.Element {
  return (
    <div
      style={{
        marginBottom: 16,
        padding: '10px 14px',
        background: '#fff',
        border: '1px dashed var(--line, #e5e7eb)',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 12,
      }}
    >
      <span style={{ color: '#6b7280', fontSize: 11, fontWeight: 600 }}>데모 투자자 전환:</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '4px 8px',
          border: '1px solid var(--line, #e5e7eb)',
          borderRadius: 3,
          fontSize: 12,
        }}
      >
        {DEMO_INVESTORS.map((i) => (
          <option key={i.id} value={i.id}>
            [{i.type === 're100' ? 'RE100' : 'Retail'}] {i.type === 're100' ? i.company_name : i.individual_name}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1 — Positions
// ---------------------------------------------------------------------------

function PositionsTab({ lois }: { lois: LOI[] }): JSX.Element {
  if (lois.length === 0) return <EmptyState text="제출된 LOI가 아직 없습니다." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {lois.map((loi) => {
        const tone = STATUS_TONE[loi.status];
        const label = STATUS_LABEL[loi.status];
        return (
          <div
            key={loi.id}
            style={{
              padding: 16,
              background: '#fff',
              border: '1px solid var(--line, #e5e7eb)',
              borderRadius: 6,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#fff',
                    background: tone,
                    borderRadius: 3,
                  }}
                >
                  {label}
                </span>
                {loi.is_non_binding && (
                  <span style={{ fontSize: 10.5, color: '#92400e', fontWeight: 600 }}>· 비구속력</span>
                )}
                <span className="num" style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
                  {loi.id}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12.5 }}>
                <span>출자액 <strong className="num">{(loi.capex_won / 100_000_000).toFixed(2)}억</strong></span>
                <span>기간 <strong className="num">{loi.terms.years}년</strong></span>
                <span>자기자본 <strong className="num">{loi.terms.equity_ratio_pct.toFixed(1)}%</strong></span>
                <span>목표 수익률 <strong className="num" style={{ color: '#10b981' }}>{loi.terms.expected_yield_pct.toFixed(2)}%</strong></span>
              </div>
              <div style={{ marginTop: 6, fontSize: 11.5, color: '#6b7280' }}>
                사이트: {loi.sites.join(', ')}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', fontSize: 11, color: '#9ca3af' }}>
              <span>제출 {fmtDate(loi.signed_at ?? loi.created_at)}</span>
              {loi.blockchain_hash && (
                <span className="num" style={{ fontFamily: 'monospace', color: '#374151' }}>
                  hash · {loi.blockchain_hash.slice(0, 12)}…
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2 — Settlements (mock; engine not wired yet)
// ---------------------------------------------------------------------------

function SettlementsTab({ lois }: { lois: LOI[] }): JSX.Element {
  // Mock 12-month payout — derived from LOI terms.
  // Real source (Phase 2): GET /api/settlements?investor_id=…
  const monthly = useMemo(() => {
    const active = lois.filter((l) => l.status === 'approved' || l.status === 'contract');
    if (active.length === 0) return [];
    const yearly = active.reduce((s, l) => s + (l.capex_won * l.terms.expected_yield_pct) / 100, 0);
    const monthlyAmt = yearly / 12;
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return {
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        amount: Math.round(monthlyAmt * (0.85 + Math.random() * 0.3)), // ±15% noise
      };
    });
  }, [lois]);

  if (monthly.length === 0) {
    return (
      <EmptyState text="승인된 LOI가 없어 정산 내역이 없습니다. LOI 승인 후 월별 분배 내역이 표시됩니다." />
    );
  }

  const total = monthly.reduce((s, m) => s + m.amount, 0);

  return (
    <div>
      <div
        style={{
          padding: 16,
          background: '#fff',
          border: '1px solid var(--line, #e5e7eb)',
          borderRadius: 6,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
          12개월 누적 분배 (Mock)
        </div>
        <div className="num" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
          {total.toLocaleString('ko-KR')}원
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
          * Pilot v1.3은 정산 엔진 미연결 — Phase 2의 FR-S-002~009 정산 결과로 교체됩니다.
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--line, #e5e7eb)', borderRadius: 6, overflow: 'hidden' }}>
        {monthly.map((m, i) => (
          <div
            key={m.month}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 140px',
              padding: '10px 14px',
              borderBottom: i < monthly.length - 1 ? '1px solid var(--line, #e5e7eb)' : 'none',
              fontSize: 12.5,
            }}
          >
            <span className="num" style={{ color: '#6b7280', fontFamily: 'monospace' }}>{m.month}</span>
            <span style={{ color: '#374151' }}>월 분배</span>
            <span className="num" style={{ textAlign: 'right', fontWeight: 600 }}>
              {m.amount.toLocaleString('ko-KR')}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3 — ESG impact
// ---------------------------------------------------------------------------

function ImpactTab({ lois }: { lois: LOI[] }): JSX.Element {
  const aggregateKw = useMemo(() => {
    const siteIds = new Set(lois.flatMap((l) => l.sites));
    let kw = 0;
    for (const id of siteIds) {
      const b = BUILDINGS_NATIONWIDE.find((x) => x.building_id === id);
      if (b) kw += b.installed_kw;
    }
    return kw;
  }, [lois]);

  // Approximate annual kWh: kW × 3.6 hours × 365
  const annualKwh = aggregateKw * 3.6 * 365;
  const equivalents = computeESGEquivalents(annualKwh);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
      <ImpactCard label="투자 발전 용량" value={`${aggregateKw.toFixed(2)} kW`} sub={`${lois.length}건 LOI 합산`} />
      <ImpactCard
        label="연간 발전량 (예상)"
        value={`${(annualKwh / 1000).toFixed(0)} MWh`}
        sub="installed_kw × 3.6h × 365"
      />
      <ImpactCard
        label="CO₂ 회피"
        value={`${(equivalents.co2_saved_kg / 1000).toFixed(2)} tCO₂e`}
        sub="0.4244 kg/kWh"
        accent="#10b981"
      />
      <ImpactCard
        label="등가 잣나무 식수"
        value={`${equivalents.equivalent_trees.toLocaleString('ko-KR')}그루`}
        sub="22 kgCO₂/tree/yr"
        accent="#10b981"
      />
      <ImpactCard
        label="등가 자동차 운행 회피"
        value={`${(equivalents.equivalent_km / 1000).toFixed(0)}천 km`}
        sub="0.21 kgCO₂/km 기준"
      />
    </div>
  );
}

function ImpactCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: string;
}): JSX.Element {
  return (
    <div
      style={{
        padding: 16,
        background: '#fff',
        border: '1px solid var(--line, #e5e7eb)',
        borderRadius: 6,
      }}
    >
      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
        {label}
      </div>
      <div
        className="num"
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginTop: 4,
          letterSpacing: '-0.02em',
          color: accent ?? '#0a0c0f',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 4 — Documents (LOI hashes + download)
// ---------------------------------------------------------------------------

function DocumentsTab({ lois }: { lois: LOI[] }): JSX.Element {
  const signed = lois.filter((l) => l.blockchain_hash !== null);
  if (signed.length === 0) {
    return <EmptyState text="서명된 LOI 문서가 아직 없습니다." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {signed.map((loi) => (
        <div
          key={loi.id}
          style={{
            padding: 14,
            background: '#fff',
            border: '1px solid var(--line, #e5e7eb)',
            borderRadius: 6,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              {STATUS_LABEL[loi.status]} · {loi.id}
            </div>
            <div className="num" style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              SHA-256: {loi.blockchain_hash}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              서명 시점: {fmtDate(loi.signed_at ?? loi.updated_at)} · 사이트: {loi.sites.join(', ')}
            </div>
          </div>
          <Link
            to={`/admin/loi/${loi.id}`}
            style={{
              padding: '8px 14px',
              border: '1px solid var(--line, #e5e7eb)',
              borderRadius: 4,
              fontSize: 12,
              color: '#0a0c0f',
              textDecoration: 'none',
            }}
          >
            상세 보기 →
          </Link>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function EmptyState({ text }: { text: string }): JSX.Element {
  return (
    <div
      style={{
        padding: 32,
        background: '#fff',
        border: '1px dashed var(--line, #e5e7eb)',
        borderRadius: 6,
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}

function fmtDate(iso: string | null): string {
  if (iso === null) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
