// FR-M-009 + FR-M-010 v1.3 — resident ESG dashboard + community event feed.
//
// Routes (nested under /portal/:user_id/, auth-gated for resident role):
//   /portal/:user_id/esg        — FR-M-009 monthly kWh / CO₂ / 등가 trees
//   /portal/:user_id/community  — FR-M-010 community events feed + RSVP
//
// Data: DEMO_ESG_IMPACTS (9 snapshots — 3 residents × 3 months) and
// DEMO_EVENTS (2 events: past 한마당 + upcoming 마을투어). Both already pass
// Zod validation in the contracts package.

import {
  computeESGEquivalents,
  type CommunityEvent,
  type ESGImpactSnapshot,
} from '@lucia/contracts/domain';
import { DEMO_ESG_IMPACTS, DEMO_EVENTS } from '@lucia/contracts/fixtures';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const RESIDENT_BY_ID: Record<string, string> = {
  h0001: '홍*동',
  k0014: '김*수',
  e0033: '이*영',
};

// ---------------------------------------------------------------------------
// FR-M-009 — ESG dashboard
// ---------------------------------------------------------------------------

export function ResidentESGDashboard(): JSX.Element {
  const { user_id } = useParams<{ user_id: string }>();
  const residentId = user_id ?? 'h0001';
  const maskedName = RESIDENT_BY_ID[residentId] ?? residentId;

  const snapshots = DEMO_ESG_IMPACTS
    .filter((s) => s.resident_id === residentId)
    .sort((a, b) => a.period.localeCompare(b.period));

  const latest = snapshots[snapshots.length - 1];
  const cumKwh = snapshots.reduce((s, x) => s + x.kwh_generated, 0);
  const cumCo2Kg = snapshots.reduce((s, x) => s + x.co2_saved_kg, 0);
  const cumEquivalents = computeESGEquivalents(cumKwh);

  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: 880, margin: '0 auto' }}>
      <ResidentNav residentId={residentId} active="esg" />

      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, margin: 0, letterSpacing: '-0.02em' }}>
          {maskedName}님의 ESG 임팩트
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          입주하신 단지의 햇빛발전소가 만들어 낸 환경 가치입니다 (FR-M-009 · 누적 {snapshots.length}개월).
        </p>
      </header>

      {snapshots.length === 0 ? (
        <div
          style={{
            padding: 32,
            background: '#fff',
            border: '1px dashed var(--line, #e5e7eb)',
            borderRadius: 6,
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          아직 ESG 데이터가 누적되지 않았습니다.
        </div>
      ) : (
        <>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <ImpactCell
              label="누적 발전량"
              value={`${(cumKwh / 1000).toFixed(2)} MWh`}
              sub={`${snapshots.length}개월 합산`}
            />
            <ImpactCell
              label="CO₂ 회피"
              value={`${(cumCo2Kg / 1000).toFixed(2)} tCO₂e`}
              sub="0.4663 kg/kWh 기준"
              accent="#10b981"
            />
            <ImpactCell
              label="등가 잣나무"
              value={`${cumEquivalents.equivalent_trees.toFixed(0)}그루`}
              sub="20.5 kgCO₂/tree/yr"
              accent="#10b981"
            />
            <ImpactCell
              label="등가 자동차 운행"
              value={`${(cumEquivalents.equivalent_km / 1000).toFixed(0)}천 km`}
              sub="0.21 kgCO₂/km 기준"
            />
          </section>

          <section
            style={{
              padding: 18,
              background: '#fff',
              border: '1px solid var(--line, #e5e7eb)',
              borderRadius: 6,
              marginBottom: 16,
            }}
          >
            <h2 style={{ fontSize: 14, margin: '0 0 12px' }}>월별 임팩트</h2>
            <MonthlyBars snapshots={snapshots} />
          </section>

          {latest && (
            <section
              style={{
                padding: 18,
                background: '#ecfdf5',
                border: '1px solid #d1fae5',
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 11, color: '#065f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {latest.period} 월간 리포트
              </div>
              <p style={{ fontSize: 13, color: '#064e3b', lineHeight: 1.55, marginTop: 8 }}>
                이 달, {maskedName}님이 거주하시는 단지의 햇빛발전소는{' '}
                <strong className="num">{(latest.kwh_generated / 1000).toFixed(2)} MWh</strong>의 전기를
                생산하여 <strong className="num">{(latest.co2_saved_kg / 1000).toFixed(2)} tCO₂e</strong>의
                온실가스를 줄였습니다. 이는 잣나무{' '}
                <strong className="num">{latest.equivalent_trees.toFixed(0)}그루</strong>를 1년간 키운 것과
                같은 효과입니다.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ImpactCell({
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
      <div
        style={{
          fontSize: 10.5,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 700,
        }}
      >
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

function MonthlyBars({ snapshots }: { snapshots: readonly ESGImpactSnapshot[] }): JSX.Element {
  const maxKwh = Math.max(1, ...snapshots.map((s) => s.kwh_generated));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {snapshots.map((s) => {
        const pct = (s.kwh_generated / maxKwh) * 100;
        return (
          <div key={s.period}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
              <span className="num" style={{ color: '#6b7280', fontFamily: 'monospace' }}>{s.period}</span>
              <span className="num" style={{ fontWeight: 600 }}>
                {(s.kwh_generated / 1000).toFixed(2)} MWh · CO₂ {(s.co2_saved_kg / 1000).toFixed(2)}t
              </span>
            </div>
            <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: '#10b981',
                  transition: 'width 200ms ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FR-M-010 — Community feed
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'lucia.events.rsvp.v1';

interface RSVPState {
  [event_id: string]: boolean;
}

function readRSVP(): RSVPState {
  if (typeof globalThis.localStorage === 'undefined') return {};
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    return raw === null ? {} : (JSON.parse(raw) as RSVPState);
  } catch {
    return {};
  }
}

function writeRSVP(state: RSVPState): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function ResidentCommunity(): JSX.Element {
  const { user_id } = useParams<{ user_id: string }>();
  const residentId = user_id ?? 'h0001';
  const maskedName = RESIDENT_BY_ID[residentId] ?? residentId;

  const [rsvp, setRsvp] = useState<RSVPState>(() => readRSVP());

  const sortedEvents = [...DEMO_EVENTS].sort((a, b) =>
    a.datetime.localeCompare(b.datetime),
  );
  const upcoming = sortedEvents.filter((e) => e.status === 'upcoming');
  const past = sortedEvents.filter((e) => e.status === 'past');

  const toggleRSVP = (id: string): void => {
    const next: RSVPState = { ...rsvp, [id]: !rsvp[id] };
    setRsvp(next);
    writeRSVP(next);
  };

  return (
    <div style={{ padding: '32px 24px 80px', maxWidth: 880, margin: '0 auto' }}>
      <ResidentNav residentId={residentId} active="community" />

      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, margin: 0, letterSpacing: '-0.02em' }}>커뮤니티 행사</h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
          {maskedName}님 단지에서 진행하는 햇빛발전소·환경 행사입니다 (FR-M-010).
        </p>
      </header>

      {upcoming.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, margin: '0 0 10px' }}>다가오는 행사</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                rsvp={rsvp[e.id] === true}
                onToggle={() => toggleRSVP(e.id)}
                past={false}
              />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 style={{ fontSize: 14, margin: '0 0 10px', color: '#6b7280' }}>지난 행사</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {past.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                rsvp={rsvp[e.id] === true}
                onToggle={() => toggleRSVP(e.id)}
                past={true}
              />
            ))}
          </div>
        </section>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <div
          style={{
            padding: 32,
            background: '#fff',
            border: '1px dashed var(--line, #e5e7eb)',
            borderRadius: 6,
            textAlign: 'center',
            color: '#6b7280',
          }}
        >
          예정된 커뮤니티 행사가 없습니다.
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  rsvp,
  onToggle,
  past,
}: {
  event: CommunityEvent;
  rsvp: boolean;
  onToggle: () => void;
  past: boolean;
}): JSX.Element {
  const startsAt = new Date(event.datetime);
  const dateLabel = `${startsAt.getFullYear()}년 ${startsAt.getMonth() + 1}월 ${startsAt.getDate()}일`;
  return (
    <div
      style={{
        padding: 16,
        background: '#fff',
        border: '1px solid var(--line, #e5e7eb)',
        borderRadius: 6,
        opacity: past ? 0.7 : 1,
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
              borderRadius: 3,
              color: '#fff',
              background: past ? '#9ca3af' : '#10b981',
            }}
          >
            {past ? '지난 행사' : '모집 중'}
          </span>
        </div>
        <h3 style={{ fontSize: 16, margin: 0 }}>{event.title}</h3>
        <p style={{ fontSize: 12.5, color: '#6b7280', margin: '6px 0 0', lineHeight: 1.55 }}>
          {event.description}
        </p>
        <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: '#9ca3af', marginTop: 10 }}>
          <span>📅 {dateLabel}</span>
          <span>📍 {event.location}</span>
          {event.beneficiary_groups.length > 0 && (
            <span>🏢 {event.beneficiary_groups.length}개 입주 그룹</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {past ? (
          <span style={{ fontSize: 11, color: '#9ca3af' }}>참여 종료</span>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            style={{
              padding: '8px 16px',
              border: `1px solid ${rsvp ? '#10b981' : 'var(--line, #e5e7eb)'}`,
              background: rsvp ? '#10b981' : '#fff',
              color: rsvp ? '#fff' : '#0a0c0f',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {rsvp ? '✓ 참여 신청 완료' : '참여 신청'}
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared resident sub-page nav
// ---------------------------------------------------------------------------

function ResidentNav({
  residentId,
  active,
}: {
  residentId: string;
  active: 'home' | 'esg' | 'community';
}): JSX.Element {
  const tabs = [
    { id: 'home' as const, label: '내 햇빛 정산', to: `/portal/${residentId}` },
    { id: 'esg' as const, label: 'ESG 임팩트', to: `/portal/${residentId}/esg` },
    { id: 'community' as const, label: '커뮤니티', to: `/portal/${residentId}/community` },
  ];
  return (
    <nav
      style={{
        display: 'flex',
        gap: 4,
        marginBottom: 16,
        borderBottom: '1px solid var(--line, #e5e7eb)',
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <Link
            key={t.id}
            to={t.to}
            style={{
              padding: '10px 16px',
              borderBottom: `2px solid ${isActive ? 'var(--ink, #0a0c0f)' : 'transparent'}`,
              color: isActive ? 'var(--ink, #0a0c0f)' : '#6b7280',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              marginBottom: -1,
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
