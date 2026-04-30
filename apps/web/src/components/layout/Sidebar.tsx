import { useState } from 'react';
import { Pill } from '@/components/atoms/Pill';
import { Btn } from '@/components/atoms/Btn';
import { Icons } from '@/components/Icons';

interface Step {
  t: string;
  label: string;
  done?: boolean;
  active?: boolean;
}

const STEPS: Step[] = [
  { t: '00:00', label: '대시보드 메인 + 116동 지도',   done: true },
  { t: '01:00', label: 'ULJN-001 동 상세 화면',        done: true },
  { t: '02:30', label: '1 kWh → 28 정산 항목 분배',    done: true },
  { t: '04:00', label: 'Sankey 분배 시각화',           active: true },
  { t: '05:30', label: '입주민 포털 — 홍길동',          done: false },
  { t: '06:30', label: '변조 시도 → 자동 거부',         done: false },
  { t: '07:30', label: 'ULJN-042 인버터 오류 알림',    done: false },
  { t: '08:30', label: '9,354동 부하 테스트',           done: false },
  { t: '09:30', label: '감사 PDF 생성 → 시연 종료',    done: false },
];

export function Sidebar() {
  const [running, setRunning] = useState(false);

  return (
    <div className="card" style={{ padding: 22, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Pill tone="ink" dot>LH 시연 모드</Pill>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 8 }}>
            10분 자동 시나리오
          </div>
          <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2 }}>
            FR-O-004 · M+3 LH 본사 시연용
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="num mono" style={{ fontSize: 11, color: '#9AA0AB' }}>04:18 / 10:00</span>
          <span style={{ fontSize: 11, color: '#047857', fontWeight: 700 }}>43%</span>
        </div>
        <div style={{ height: 4, background: '#F4F5F7', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: '43%',
            background: 'linear-gradient(90deg, #34D399, #10B981)',
          }} />
        </div>
      </div>

      {/* Steps */}
      <div style={{ flex: 1, display: 'grid', gap: 4, overflow: 'auto' }}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '16px auto 1fr',
              gap: 10,
              alignItems: 'center',
              padding: '8px 4px',
              borderRadius: 8,
              background: s.active ? '#F0FDF4' : 'transparent',
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: s.done ? '#10B981' : '#fff',
                border: s.active
                  ? '2px solid #10B981'
                  : `1.5px solid ${s.done ? '#10B981' : '#E2E5EA'}`,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                flexShrink: 0,
              }}
              className={s.active ? 'pulse-dot' : ''}
            >
              {s.done && (
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
              )}
            </span>
            <span className="mono" style={{ fontSize: 10.5, color: '#9AA0AB' }}>{s.t}</span>
            <span style={{
              fontSize: 12.5,
              color: s.done ? '#9AA0AB' : s.active ? '#0E1116' : '#374151',
              fontWeight: s.active ? 700 : 500,
              textDecoration: s.done ? 'line-through' : 'none',
              letterSpacing: '-0.01em',
            }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <Btn
          variant="primary"
          size="md"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setRunning(!running)}
        >
          {running ? '⏸ 일시정지' : '▶ 시연 재생'}
        </Btn>
        <Btn variant="secondary" size="md" icon={Icons.Settings} />
      </div>
    </div>
  );
}
