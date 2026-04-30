import { useState, useEffect, useRef } from 'react';

import { Modal } from './Modal.js';

import { Btn } from '@/components/atoms';

interface ReportModalProps {
  onClose: () => void;
}

type Step = 'period' | 'buildings' | 'generating' | 'done';

// `as const` gives these tuple typing so positional access (e.g. PERIODS[0],
// BUILDING_GROUPS[0].id) is non-undefined under noUncheckedIndexedAccess.
const PERIODS = [
  '2026년 4월',
  '2026년 3월',
  '2026년 2월',
  '2026년 1월',
] as const;

const BUILDING_GROUPS = [
  { id: 'all', label: '전체 116동', count: 116 },
  { id: 'region-a', label: '울진 1구역 (1~40동)', count: 40 },
  { id: 'region-b', label: '울진 2구역 (41~80동)', count: 40 },
  { id: 'region-c', label: '울진 3구역 (81~116동)', count: 36 },
] as const;

const DocIcon = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6" />
  </svg>
);

const DownIcon = (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v12m0 0-5-5m5 5 5-5M4 20h16" />
  </svg>
);

const ShareIcon = (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8h16v-8M16 6l-4-4-4 4M12 2v14" />
  </svg>
);

const CrossIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 6 12 12M6 18 18 6" />
  </svg>
);

const CheckIcon = (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

type Period = (typeof PERIODS)[number];
type GroupId = (typeof BUILDING_GROUPS)[number]['id'];

export function ReportModal({ onClose }: ReportModalProps) {
  const [step, setStep] = useState<Step>('period');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(PERIODS[0]);
  const [selectedGroup, setSelectedGroup] = useState<GroupId>(BUILDING_GROUPS[0].id);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate progress when generating
  useEffect(() => {
    if (step !== 'generating') return;
    setProgress(0);
    const start = Date.now();
    const duration = 5000; // 5s per FR-O-002 budget
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStep('done');
      }
    }, 80);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [step]);

  const canAdvance = step === 'period' || step === 'buildings';

  const advance = () => {
    if (step === 'period') setStep('buildings');
    else if (step === 'buildings') setStep('generating');
  };

  const selectedGroupLabel = BUILDING_GROUPS.find((g) => g.id === selectedGroup)?.label ?? '';

  return (
    <Modal open={true} onClose={onClose} width={760}>
      {/* Header */}
      <div style={{
        padding: '20px 26px 16px',
        borderBottom: '1px solid #E2E5EA',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#FAFBFC',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#0E1116', color: '#fff',
            display: 'grid', placeItems: 'center',
          }}>
            {DocIcon}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>감사 보고서 생성</div>
            <div style={{ fontSize: 11.5, color: '#6B7280' }}>
              FR-O-002 · LH ESG 경영실 양식 · 변조 불가 원장 첨부
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {step === 'done' && (
            <>
              <Btn variant="secondary" size="sm" icon={DownIcon}>PDF 다운로드</Btn>
              <Btn variant="primary" size="sm" icon={ShareIcon}>LH 회계 발송</Btn>
            </>
          )}
          <Btn variant="ghost" size="sm" onClick={onClose} icon={CrossIcon} />
        </div>
      </div>

      {/* Step indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '14px 26px',
        borderBottom: '1px solid #E2E5EA',
        background: '#fff',
      }}>
        {(['period', 'buildings', 'generating'] as const).map((s, i) => {
          const labels = ['기간 선택', '동 선택', '생성'];
          const stepOrder: Step[] = ['period', 'buildings', 'generating', 'done'];
          const currentIdx = stepOrder.indexOf(step);
          const thisIdx = stepOrder.indexOf(s);
          const isDone = currentIdx > thisIdx;
          const isActive = currentIdx === thisIdx;

          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 999,
                  background: isDone ? '#10B981' : isActive ? '#0E1116' : '#E2E5EA',
                  color: isDone || isActive ? '#fff' : '#9AA0AB',
                  display: 'grid', placeItems: 'center',
                  fontSize: 11, fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {isDone ? CheckIcon : i + 1}
                </div>
                <span style={{
                  fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0E1116' : isDone ? '#047857' : '#9AA0AB',
                }}>
                  {labels[i]}
                </span>
              </div>
              {i < 2 && (
                <div style={{ width: 32, height: 1, background: '#E2E5EA', margin: '0 12px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ padding: 28, overflow: 'auto' }}>

        {/* Step 1: Period selection */}
        {step === 'period' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              정산 기간 선택
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: `2px solid ${selectedPeriod === p ? '#0E1116' : '#E2E5EA'}`,
                    background: selectedPeriod === p ? '#0E1116' : '#fff',
                    color: selectedPeriod === p ? '#fff' : '#0E1116',
                    fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all .15s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Building group selection */}
        {step === 'buildings' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              대상 동 선택 — {selectedPeriod}
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {BUILDING_GROUPS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    border: `2px solid ${selectedGroup === g.id ? '#0E1116' : '#E2E5EA'}`,
                    background: selectedGroup === g.id ? '#0E1116' : '#fff',
                    color: selectedGroup === g.id ? '#fff' : '#0E1116',
                    fontSize: 14, fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all .15s ease',
                  }}
                >
                  <span>{g.label}</span>
                  <span style={{
                    fontSize: 11.5, fontWeight: 500,
                    color: selectedGroup === g.id ? 'rgba(255,255,255,0.7)' : '#9AA0AB',
                  }}>
                    {g.count}동
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === 'generating' && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 44, height: 44,
                border: '3px solid #ECFDF5',
                borderTopColor: '#10B981',
                borderRadius: 999,
                margin: '0 auto 16px',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>감사 보고서 생성 중…</div>
              <div style={{ fontSize: 12, color: '#9AA0AB' }}>
                {selectedGroupLabel} · {selectedPeriod} · 블록체인 해시 검증 중
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: '#F1F3F5', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: '#10B981',
                borderRadius: 999,
                transition: 'width .1s linear',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#9AA0AB' }}>
              <span>
                {progress < 30 ? '동 데이터 집계 중…' :
                 progress < 60 ? '블록체인 해시 검증 중…' :
                 progress < 85 ? 'PDF 렌더링 중…' :
                 '최종 검증 중…'}
              </span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === 'done' && (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '28px 24px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 999,
              background: '#10B981', color: '#fff',
              display: 'grid', placeItems: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#047857', marginBottom: 6 }}>
              보고서 생성 완료
            </div>
            <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 20 }}>
              {selectedGroupLabel} · {selectedPeriod} · 14페이지 · 블록체인 무결성 검증됨
            </div>
            <div style={{
              background: '#fff', border: '1px solid #E2E5EA', borderRadius: 10,
              padding: '14px 18px', textAlign: 'left',
              fontSize: 11.5, color: '#374151',
              fontFamily: 'monospace',
            }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: '#9AA0AB' }}>문서번호: </span>LH-ESG-2026-04-001
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: '#9AA0AB' }}>체인 Tx: </span>0x8a44…d215
              </div>
              <div>
                <span style={{ color: '#9AA0AB' }}>SHA-256: </span>1e90…a3c8
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        {canAdvance && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {step === 'buildings' && (
              <Btn variant="secondary" onClick={() => setStep('period')}>이전</Btn>
            )}
            <Btn variant="primary" onClick={advance}>
              {step === 'period' ? '다음 — 동 선택' : '생성'}
            </Btn>
          </div>
        )}
      </div>
    </Modal>
  );
}
