// TamperingSimCard — "9,354호 변조 시뮬레이션" reliability check
// Mirrors the Figma middle card: hero confidence number + monthly bar chart.

import { Pill } from '@/components/atoms';

interface MonthBar {
  m: string;
  ok: number;
  alert: number;
}

const DEFAULT_MONTHS: MonthBar[] = [
  { m: '2월', ok: 36, alert: 6 },
  { m: '3월', ok: 48, alert: 4 },
  { m: '4월', ok: 64, alert: 8 },
  { m: '5월', ok: 92, alert: 12 },
  { m: '6월', ok: 78, alert: 6 },
  { m: '7월', ok: 54, alert: 5 },
  { m: '8월', ok: 70, alert: 4 },
  { m: '9월', ok: 44, alert: 8 },
];

interface TamperingSimCardProps {
  confidence?: number;
  delta?: number;
  scenario?: string;
  months?: MonthBar[];
  totalSites?: number;
  hostUnits?: number;
}

export function TamperingSimCard({
  confidence = 99.7,
  delta = 0.4,
  scenario = '부하 시나리오',
  months = DEFAULT_MONTHS,
  totalSites = 116,
  hostUnits = 9354,
}: TamperingSimCardProps) {
  const max = Math.max(...months.map((m) => m.ok + m.alert));
  return (
    <div className="card card-pad tampering-card">
      <div className="card-header" style={{ marginBottom: 12, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>
            <span className="num">{hostUnits.toLocaleString()}</span>호 변조 시뮬레이션
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
            신뢰 확정성 · 1m
          </div>
        </div>
        <Pill tone="amber">{scenario}</Pill>
      </div>

      <div className="tampering-hero">
        <span className="num tampering-hero-num">{confidence.toFixed(1)}%</span>
        <span className="tampering-hero-delta">
          ▲ {delta.toFixed(1)}%
        </span>
      </div>
      <div className="tampering-hero-meta">
        실시간 위변조 검사 (5분 자체)
      </div>

      <div className="tampering-range">2026.02 — 2026.09</div>

      <div className="tampering-chart" aria-hidden="true">
        {months.map((m) => {
          const okPct = (m.ok / max) * 100;
          const alertPct = (m.alert / max) * 100;
          return (
            <div key={m.m} className="tampering-col">
              <div className="tampering-bars">
                <span
                  className="tampering-bar tampering-bar--alert"
                  style={{ height: `${alertPct}%` }}
                />
                <span
                  className="tampering-bar tampering-bar--ok"
                  style={{ height: `${okPct}%` }}
                />
              </div>
              <span className="tampering-label">{m.m}</span>
            </div>
          );
        })}
      </div>

      <div className="tampering-footer">
        <span>{totalSites}동 부하 · {hostUnits.toLocaleString()}호 시뮬레이션</span>
        <span className="num">평균 응답 1.5s</span>
      </div>
    </div>
  );
}
