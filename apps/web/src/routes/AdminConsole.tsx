// FR-O-003 — 관리자 콘솔 (Demo Step 0 controller satisfier).
//
// Sections: 동 관리, 가중치/단가 조정, 이상 상황 주입, 시연 시나리오 제어.
// Anomaly inject calls POST /api/admin/anomaly (engine route lands B5.x).
// Demo scenario controls bind to useDemoController() so admins can drive
// the M+3 storyboard from the same surface as the rest of the console.

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { Icons } from '@/components/Icons';
import { Pill, Btn, fmt } from '@/components/atoms';
import { useDemoController } from '@/demo/DemoController';

interface BuildingRow {
  id: string;
  region: string;
  households: number;
  capacity: number;
  status: 'active' | 'maintenance' | 'offline';
}

const BUILDINGS: BuildingRow[] = [
  { id: 'ULJN-001', region: '경상북도 울진', households: 1643, capacity: 240, status: 'active' },
  { id: 'YESN-014', region: '충청남도 예산', households: 280, capacity: 92, status: 'active' },
  { id: 'BSAN-042', region: '강원도 봉산', households: 916, capacity: 184, status: 'active' },
  { id: 'GWAN-018', region: '광주광역시 광산', households: 648, capacity: 132, status: 'maintenance' },
];

interface SliderState {
  recWeight: number;
  saasFee: number;
  txFee: number;
  smpUnit: number;
}

const ANOMALY_TYPES = [
  { value: 'inverter_fail', label: '인버터 오류' },
  { value: 'mqtt_drop', label: 'MQTT 단절' },
  { value: 'underperform', label: '발전량 저조' },
  { value: 'overheat', label: '온도 초과' },
] as const;

export function AdminConsole() {
  const demo = useDemoController();

  const [sliders, setSliders] = useState<SliderState>({
    recWeight: 1.2,
    saasFee: 0.66,
    txFee: 0.85,
    smpUnit: 119,
  });

  const [anomalyForm, setAnomalyForm] = useState({
    buildingId: BUILDINGS[0]?.id ?? '',
    type: ANOMALY_TYPES[0].value as string,
    durationMin: 5,
  });

  const [injectStatus, setInjectStatus] = useState<string | null>(null);

  const handleInject = async () => {
    setInjectStatus('주입 중…');
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000') + '/api/admin/anomaly',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(anomalyForm),
        },
      );
      setInjectStatus(res.ok ? '✓ 주입 완료' : `✗ 실패 (${res.status})`);
    } catch (e) {
      setInjectStatus(`✗ 엔드포인트 미구현 (${(e as Error).message})`);
    }
  };

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <Pill tone="ink" dot>
          관리자 콘솔
        </Pill>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginTop: 8,
          }}
        >
          시스템 운영 · 시연 제어
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>
          FR-O-003 · 동 관리, 가중치/단가, 이상 주입, 시연 시나리오 통제
        </div>
      </div>

      <div className="grid-card-pair-eq" style={{ marginBottom: 16 }}>
        {/* 동 관리 */}
        <div className="card" style={{ padding: 22 }}>
          <SectionHeader
            title="동 관리"
            subtitle="116개 매입임대 옥상 · CRUD"
            action={
              <Btn variant="primary" size="sm" icon={Icons.Plus}>
                동 추가
              </Btn>
            }
          />
          <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
            {BUILDINGS.map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr 80px 80px 80px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--line)',
                  fontSize: 12.5,
                }}
              >
                <span className="mono" style={{ fontWeight: 700, color: '#0E1116' }}>
                  {b.id}
                </span>
                <span style={{ color: '#374151' }}>{b.region}</span>
                <span className="num" style={{ textAlign: 'right' }}>
                  {fmt.n(b.households)}세대
                </span>
                <span className="num" style={{ textAlign: 'right' }}>
                  {b.capacity} kWp
                </span>
                <span style={{ textAlign: 'right' }}>
                  <Pill tone={b.status === 'active' ? 'green' : 'amber'} dot>
                    {b.status === 'active' ? '운영' : '점검'}
                  </Pill>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 가중치/단가 */}
        <div className="card" style={{ padding: 22 }}>
          <SectionHeader
            title="가중치 · 단가 조정"
            subtitle="REC, SaaS 수수료, 거래수수료, SMP 단가"
          />
          <div style={{ display: 'grid', gap: 16, marginTop: 14 }}>
            <SliderRow
              label="REC 가중치"
              value={sliders.recWeight}
              min={0.8}
              max={1.5}
              step={0.05}
              unit="x"
              onChange={(v) => setSliders((s) => ({ ...s, recWeight: v }))}
            />
            <SliderRow
              label="Lucia SaaS 수수료"
              value={sliders.saasFee}
              min={0.3}
              max={1.5}
              step={0.05}
              unit="%"
              onChange={(v) => setSliders((s) => ({ ...s, saasFee: v }))}
            />
            <SliderRow
              label="거래수수료"
              value={sliders.txFee}
              min={0.3}
              max={1.5}
              step={0.05}
              unit="%"
              onChange={(v) => setSliders((s) => ({ ...s, txFee: v }))}
            />
            <SliderRow
              label="SMP 단가"
              value={sliders.smpUnit}
              min={80}
              max={180}
              step={1}
              unit="원/kWh"
              onChange={(v) => setSliders((s) => ({ ...s, smpUnit: v }))}
            />
          </div>
        </div>
      </div>

      <div className="grid-card-pair-eq">
        {/* 이상 상황 주입 */}
        <div className="card" style={{ padding: 22 }}>
          <SectionHeader
            title="이상 상황 주입"
            subtitle="POST /api/admin/anomaly · 시연용"
          />
          <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
            <FormRow label="대상 동">
              <select
                value={anomalyForm.buildingId}
                onChange={(e) =>
                  setAnomalyForm((f) => ({ ...f, buildingId: e.target.value }))
                }
                style={selectStyle}
              >
                {BUILDINGS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} · {b.region}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="유형">
              <select
                value={anomalyForm.type}
                onChange={(e) => setAnomalyForm((f) => ({ ...f, type: e.target.value }))}
                style={selectStyle}
              >
                {ANOMALY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="지속 시간">
              <input
                type="number"
                min={1}
                max={60}
                value={anomalyForm.durationMin}
                onChange={(e) =>
                  setAnomalyForm((f) => ({
                    ...f,
                    durationMin: Number.parseInt(e.target.value, 10) || 1,
                  }))
                }
                style={{ ...selectStyle, width: 80 }}
              />
              <span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280' }}>분</span>
            </FormRow>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <Btn variant="primary" icon={Icons.Bolt} onClick={handleInject}>
                주입
              </Btn>
              {injectStatus && (
                <span
                  style={{
                    fontSize: 12,
                    color: injectStatus.startsWith('✓')
                      ? '#0D4AA0'
                      : injectStatus.startsWith('✗')
                        ? '#BE123C'
                        : '#6B7280',
                    fontWeight: 600,
                  }}
                >
                  {injectStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 시연 시나리오 제어 */}
        <div className="card" style={{ padding: 22 }}>
          <SectionHeader
            title="시연 시나리오 제어"
            subtitle={`FR-O-004 · 9-step storyboard · ${demo.steps.length}단계`}
            action={
              <Pill tone={demo.running ? 'green' : 'neutral'} dot>
                {demo.running ? '재생 중' : '대기'}
              </Pill>
            }
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 14, marginBottom: 14 }}>
            <Btn variant="primary" size="md" onClick={demo.start} style={{ flex: 1, justifyContent: 'center' }}>
              ▶ 재생 시작
            </Btn>
            <Btn variant="secondary" size="md" onClick={demo.pause}>
              일시정지
            </Btn>
            <Btn variant="secondary" size="md" onClick={demo.resume}>
              재개
            </Btn>
            <Btn variant="ghost" size="md" onClick={demo.reset}>
              리셋
            </Btn>
          </div>

          <div style={{ display: 'grid', gap: 4, maxHeight: 280, overflowY: 'auto' }}>
            {demo.steps.map((step, i) => {
              const isCurrent = i === demo.currentStep;
              const pctOfStep = isCurrent
                ? Math.min(100, (demo.elapsedMs / step.duration_ms) * 100)
                : 0;
              return (
                <button
                  key={step.id}
                  onClick={() => demo.jumpTo(i)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr auto',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: isCurrent ? '#EFF5FF' : 'transparent',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: '#9AA0AB',
                      width: 18,
                      textAlign: 'right',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? '#0E1116' : '#374151',
                      }}
                    >
                      {step.label}
                    </div>
                    {isCurrent && (
                      <div
                        style={{
                          height: 3,
                          background: '#F4F5F7',
                          borderRadius: 999,
                          marginTop: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pctOfStep}%`,
                            background: 'linear-gradient(90deg,#4D91E8,#1264D3)',
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <span className="mono" style={{ fontSize: 10.5, color: '#9AA0AB' }}>
                    {Math.round(step.duration_ms / 1000)}s
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {action}
    </div>
  );
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, unit, onChange }: SliderRowProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 600 }}>{label}</span>
        <span className="num mono" style={{ fontSize: 12.5, color: '#0E1116', fontWeight: 700 }}>
          {value}
          <span style={{ marginLeft: 4, fontSize: 11, color: '#9AA0AB', fontWeight: 500 }}>
            {unit}
          </span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#1264D3' }}
      />
    </div>
  );
}

interface FormRowProps {
  label: string;
  children: ReactNode;
}

function FormRow({ label, children }: FormRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 600, width: 90 }}>
        {label}
      </span>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{children}</div>
    </div>
  );
}

const selectStyle: CSSProperties = {
  border: '1px solid var(--line-2)',
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 13,
  background: '#fff',
  color: '#0E1116',
  outline: 'none',
  fontFamily: 'inherit',
  flex: 1,
};
