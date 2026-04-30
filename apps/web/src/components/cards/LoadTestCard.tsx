// LoadTestCard — 9,354동 부하 테스트 결과
// FR-O-001 · NFR-1: 정산 ≤5s, 대시보드 ≤3s
// AWS m6i.2xlarge · k6 + xk6-mqtt (ADR-0007)

import { Pill } from '@/components/atoms';

interface LoadTestRow {
  scale: string;
  buildings: number;
  settleMs: number;
  dashMs: number;
  tps: number;
}

const LOAD_TEST_DATA: LoadTestRow[] = [
  { scale: '116동',    buildings: 116,  settleMs: 1240, dashMs: 890,  tps: 142 },
  { scale: '1,000동',  buildings: 1000, settleMs: 1840, dashMs: 1320, tps: 148 },
  { scale: '5,000동',  buildings: 5000, settleMs: 3120, dashMs: 2410, tps: 151 },
  { scale: '9,354동',  buildings: 9354, settleMs: 4680, dashMs: 2940, tps: 156 },
];

// NFR-1 thresholds in ms
const NFR_SETTLE_MS = 5000;
const NFR_DASH_MS   = 3000;

function msToS(ms: number): string {
  return (ms / 1000).toFixed(2) + 's';
}

function passColor(ms: number, limit: number): string {
  return ms <= limit ? '#047857' : '#BE123C';
}

export function LoadTestCard() {
  const maxSettle = Math.max(...LOAD_TEST_DATA.map((d) => d.settleMs));

  return (
    <div className="card" style={{ padding: 22 }}>
      {/* header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Pill tone="ink" dot>FR-O-001</Pill>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
            9,354동 부하 테스트
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            전국 확장 시 정산·대시보드 응답 시간
          </div>
        </div>
        <span
          className="num"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#047857',
            background: '#ECFDF5',
            padding: '4px 10px',
            borderRadius: 999,
            whiteSpace: 'nowrap',
          }}
        >
          선형 확장 통과
        </span>
      </div>

      {/* results table */}
      <div>
        {/* column headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 1fr 60px',
            gap: 8,
            marginBottom: 8,
            fontSize: 10.5,
            fontWeight: 600,
            color: '#9AA0AB',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          <span>규모</span>
          <span style={{ textAlign: 'right' }}>정산</span>
          <span style={{ textAlign: 'right' }}>대시보드</span>
          <span style={{ textAlign: 'right' }}>TPS</span>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {LOAD_TEST_DATA.map((d) => {
            const settlePass = d.settleMs <= NFR_SETTLE_MS;
            const dashPass   = d.dashMs   <= NFR_DASH_MS;
            const barFill    = d.settleMs / maxSettle;

            return (
              <div key={d.scale}>
                {/* row values */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 1fr 60px',
                    gap: 8,
                    marginBottom: 5,
                    alignItems: 'baseline',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0E1116' }}>
                    {d.scale}
                  </span>
                  <span
                    className="num"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textAlign: 'right',
                      color: passColor(d.settleMs, NFR_SETTLE_MS),
                    }}
                  >
                    {msToS(d.settleMs)}
                  </span>
                  <span
                    className="num"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textAlign: 'right',
                      color: passColor(d.dashMs, NFR_DASH_MS),
                    }}
                  >
                    {msToS(d.dashMs)}
                  </span>
                  <span
                    className="num"
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      textAlign: 'right',
                      color: '#6B7280',
                    }}
                  >
                    {d.tps}
                  </span>
                </div>

                {/* progress bar */}
                <div style={{ display: 'flex', height: 6, gap: 2 }}>
                  <div
                    style={{
                      flex: barFill,
                      background: settlePass && dashPass
                        ? 'linear-gradient(90deg, #6EE7B7, #10B981)'
                        : 'linear-gradient(90deg, #FCA5A5, #F43F5E)',
                      borderRadius: '999px 0 0 999px',
                    }}
                  />
                  <div
                    style={{
                      flex: 1 - barFill,
                      background: '#F4F5F7',
                      borderRadius: '0 999px 999px 0',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* bottom strip */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px dashed var(--line-2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#6B7280',
        }}
      >
        <span>AWS m6i.2xlarge · k6 + xk6-mqtt</span>
        <span style={{ color: '#047857', fontWeight: 700 }}>
          NFR-1 통과 (4.68s · 2.94s)
        </span>
      </div>
    </div>
  );
}
