// FR-M-004 — 이상 감지 card
// Compact anomaly list (3 rows): 인버터 오류 / 그늘 영향 / 정산 지연.
// Hardcoded from prototype ANOMALIES; accept optional `anomalies` prop for
// future engine integration via TanStack Query.

import { Pill, Btn } from '@/components/atoms';
import { useLuciaModals } from '@/lib/modals';
import type { BuildingLike } from '@/lib/modals';

// ── demo data (mirrors untitled/project/src/data.jsx ANOMALIES) ──────────────
type Severity = 'critical' | 'warn' | 'info';

interface AnomalyRow {
  id:       string;
  building: string;
  type:     string;
  since:    string;
  drop:     number;   // negative = % generation loss; 0 = queue backlog
  severity: Severity;
}

const DEMO_ANOMALIES: AnomalyRow[] = [
  { id: 'A-2406', building: 'ULJN-042', type: '인버터 오류', since: '12:48', drop: -67.6, severity: 'critical' },
  { id: 'A-2405', building: 'ULJN-058', type: '그늘 영향',   since: '11:32', drop: -21.4, severity: 'warn'     },
  { id: 'A-2404', building: 'ULJN-091', type: '정산 지연',   since: '10:15', drop:    0,  severity: 'info'     },
];

// Building stubs for modal navigation — only required fields.
const BUILDING_STUBS: Record<string, BuildingLike> = {
  'ULJN-042': { id: 'ULJN-042', region: '후포면 후포리', today:  38.2, capacity: 25.86, eff: 32.4, status: 'alert', subsidy: 21 },
  'ULJN-058': { id: 'ULJN-058', region: '북면 부구리',   today:  92.1, capacity: 25.86, eff: 78.6, status: 'warn',  subsidy: 18 },
  'ULJN-091': { id: 'ULJN-091', region: '울진 기타',     today: 100.0, capacity: 25.86, eff: 85.0, status: 'ok',   subsidy: 12 },
};

// ── severity config ───────────────────────────────────────────────────────────
type PillTone = 'rose' | 'amber' | 'sky';
interface SevConfig { tone: PillTone; label: string; color: string; border: string; bg: string }

const SEV_MAP: Record<Severity, SevConfig> = {
  critical: { tone: 'rose',  label: '긴급', color: '#F43F5E', border: '#FFD9DF', bg: '#FFFAFB' },
  warn:     { tone: 'amber', label: '주의', color: '#F59E0B', border: 'var(--line)', bg: '#fff' },
  info:     { tone: 'sky',   label: '정보', color: '#0284C7', border: 'var(--line)', bg: '#fff' },
};

// ── component ────────────────────────────────────────────────────────────────
interface AnomalyCardProps {
  anomalies?: AnomalyRow[];
}

export function AnomalyCard({ anomalies }: AnomalyCardProps) {
  const rows = anomalies ?? DEMO_ANOMALIES;
  const { openBuilding } = useLuciaModals();

  return (
    <div className="card" style={{ padding: 22, height: '100%' }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>이상 감지</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>FR-M-004 · 평균 1분 이내 감지</div>
        </div>
        <Pill tone="rose" dot>3건 활성</Pill>
      </div>

      {/* anomaly rows */}
      <div style={{ display: 'grid', gap: 10 }}>
        {rows.map(a => {
          const sev     = SEV_MAP[a.severity];
          const building = BUILDING_STUBS[a.building] ?? {
            id:       a.building,
            region:   '',
            today:    0,
            capacity: 25.86,
            eff:      0,
            status:   'ok' as const,
            subsidy:  0,
          };

          return (
            <div
              key={a.id}
              onClick={() => openBuilding(building)}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                border: `1px solid ${sev.border}`,
                background: sev.bg,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
              }}
            >
              {/* severity stripe */}
              <div style={{
                width: 4,
                alignSelf: 'stretch',
                borderRadius: 2,
                background: sev.color,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 600, color: '#0E1116' }}>
                    {a.building}
                  </span>
                  <Pill tone={sev.tone}>{sev.label}</Pill>
                </div>
                <div style={{ fontSize: 13, color: '#0E1116', fontWeight: 500 }}>{a.type}</div>
                <div className="num" style={{ fontSize: 11, color: '#9AA0AB', marginTop: 2 }}>
                  {`발생 ${a.since} · ${a.drop !== 0 ? `${a.drop}% 발전 감소` : '정산 큐 적체'}`}
                </div>
              </div>

              <Btn variant="ghost" size="sm">조치</Btn>
            </div>
          );
        })}
      </div>
    </div>
  );
}
