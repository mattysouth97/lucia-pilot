// FR-R-002 — site detail page (/invest/projects/:siteId).
// Reads from BUILDINGS_NATIONWIDE; surfaces simulator + onboarding entry CTAs.

import { BUILDINGS_NATIONWIDE, REGION_BY_NAME } from '@lucia/contracts';
import { Link, useParams } from 'react-router-dom';

const STATUS_LABEL: Record<string, string> = {
  planned: '계획',
  construction: '시공 중',
  operating: '운영 중',
};

export function SiteDetail(): JSX.Element {
  const { siteId } = useParams<{ siteId: string }>();
  const site = BUILDINGS_NATIONWIDE.find((b) => b.building_id === siteId);

  if (!site) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22 }}>사이트를 찾을 수 없습니다</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>
          요청하신 ID <code style={{ background: '#f3f4f6', padding: '2px 4px' }}>{siteId}</code>가 카탈로그에 없습니다.
        </p>
        <Link to="/invest/projects" style={{ color: '#10b981', textDecoration: 'none' }}>
          ← 카탈로그로 돌아가기
        </Link>
      </div>
    );
  }

  const region = REGION_BY_NAME.get(site.region_office as never);
  const status = site.deployment_status ?? 'operating';
  const yieldPct = site.expected_yield_pct ?? 0;
  const capex = site.est_capex_won ?? site.installed_kw * 4_000_000;
  // Mock 모집 진행도 — Pilot Uljin 진행 중 사례로 우선 표시
  const isPilotUljin = site.building_id.startsWith('ULJN-');
  const fundedPct = isPilotUljin ? 24 : 0;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 980, margin: '0 auto' }}>
      <Link
        to="/invest/projects"
        style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}
      >
        ← 카탈로그
      </Link>

      <header style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              color: '#fff',
              background: region?.color ?? '#6b7280',
            }}
          >
            {site.region_office}
          </span>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{STATUS_LABEL[status]}</span>
        </div>
        <h1 style={{ fontSize: 32, margin: 0, fontFamily: 'var(--font-mono, monospace)' }}>{site.building_id}</h1>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '4px 0 0' }}>
          {site.address}
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Stat label="설치 용량" value={`${site.installed_kw.toFixed(2)} kW`} />
        <Stat
          label="예상 연 수익률"
          value={`${yieldPct.toFixed(2)}%`}
          accent={yieldPct >= 5 ? '#10b981' : '#374151'}
        />
        <Stat label="예상 CAPEX" value={`${(capex / 100_000_000).toFixed(2)}억원`} />
        <Stat label="설치 예정일" value={site.install_date} />
      </section>

      {isPilotUljin && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>모집 진행도</h2>
          <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                width: `${fundedPct}%`,
                height: '100%',
                background: '#10b981',
                transition: 'width 200ms ease',
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0' }}>
            {fundedPct}억 / 100억 모집 중 (Pilot Uljin 진행 사례)
          </p>
        </section>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          marginTop: 24,
        }}
      >
        <Link
          to={`/simulator?site=${site.building_id}`}
          style={{
            display: 'block',
            padding: '14px 16px',
            background: '#10b981',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: 6,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          시뮬레이션 실행 →
        </Link>
        <Link
          to={`/invest/onboarding/re100?site=${site.building_id}`}
          style={{
            display: 'block',
            padding: '14px 16px',
            background: '#0a0c0f',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: 6,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          RE100 출자 의향 제출 →
        </Link>
        <Link
          to={`/invest/onboarding/retail?site=${site.building_id}`}
          style={{
            display: 'block',
            padding: '14px 16px',
            background: 'transparent',
            color: '#0a0c0f',
            textDecoration: 'none',
            border: '1px solid #0a0c0f',
            borderRadius: 6,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          개인 관심 표명 →
        </Link>
      </section>

      <p
        style={{
          marginTop: 24,
          padding: 12,
          background: '#fff7ed',
          borderLeft: '3px solid #f59e0b',
          fontSize: 12,
          color: '#7c2d12',
          lineHeight: 1.5,
        }}
      >
        본 페이지의 좌표·주소·예상 수익률 등은 v1.3 시연용 mock 데이터이며, 실제
        출자 의사결정은 TheKIE BD 팀의 실시점 자료를 통해 별도 검증되어야 합니다.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }): JSX.Element {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--line-soft, #e5e7eb)',
        borderRadius: 6,
        padding: 14,
      }}
    >
      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{label}</div>
      <div
        className="num"
        style={{
          fontFeatureSettings: "'tnum'",
          fontSize: 18,
          fontWeight: 600,
          color: accent ?? '#0a0c0f',
        }}
      >
        {value}
      </div>
    </div>
  );
}
