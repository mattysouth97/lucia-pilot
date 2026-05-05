// 감사 보고서 생성 — 4-step wizard ending in a paper-style document preview.
//   1. period   — pick the settlement month
//   2. buildings — pick the building scope (and region filter)
//   3. generating — 5s progress simulation (FR-O-002 budget)
//   4. done      — render the LH ESG audit report inline
//
// PDF 다운로드 / LH 회계 발송 are stubs that surface a 1.5s confirmation pill
// (real integration lands with FR-O-002).

import { useEffect, useRef, useState } from 'react';

import { Modal } from './Modal.js';

import { Btn } from '@/components/atoms';

interface ReportModalProps {
  onClose: () => void;
}

type Step = 'period' | 'buildings' | 'generating' | 'done';

// ─── Wizard data ─────────────────────────────────────────────────────────────

const PERIODS = ['2026년 4월', '2026년 3월', '2026년 2월', '2026년 1월'] as const;
type Period = (typeof PERIODS)[number];

const REGION_SCOPES = [
  '전체 (116개 건물)',
  '울진군',
  '의정부시',
  '광명시',
  '평택시',
  '시흥시',
  '의왕시',
  '화성시',
] as const;
type RegionScope = (typeof REGION_SCOPES)[number];

const REGION_COUNTS: Record<RegionScope, number | null> = {
  '전체 (116개 건물)': null,
  '울진군': 23,
  '의정부시': 18,
  '광명시': 15,
  '평택시': 14,
  '시흥시': 17,
  '의왕시': 12,
  '화성시': 17,
};

const BUILDING_GROUPS = [
  { id: 'all', label: '전체 116동', count: 116 },
  { id: 'region-a', label: '울진 1구역 (1~40동)', count: 40 },
  { id: 'region-b', label: '울진 2구역 (41~80동)', count: 40 },
  { id: 'region-c', label: '울진 3구역 (81~116동)', count: 36 },
] as const;
type GroupId = (typeof BUILDING_GROUPS)[number]['id'];

// ─── Document fixture (rendered in step 4) ───────────────────────────────────

const REPORT = {
  docNumber: 'LH-ESG-2026-04-001',
  classification: '일반 · 보존 5년',
  publishDate: '2026년 4월 30일',
  org: '한국토지주택공사 / TheKIE',
  title: '매입임대 햇빛발전소 정산 결과 보고서',
  subtitle: '(울진 116동 / 3MW Pilot · 2026년 4월)',
  totalPages: 14,
} as const;

const SUMMARY_ROWS = [
  ['발전 대상', '울진 매입임대 116동 (3,000 kWp)', '정산 기간', '2026-04-01 ~ 2026-04-30'],
  ['총 발전량', '342,827 kWh', '총 매출 (SMP)', '32,356,400원'],
  ['REC 적립', '1,422.4 REC × 1.2', 'PPA 프리미엄', '6,936,540원'],
  ['주거비 환원 (41%)', '13,266,360원', '환원 대상', '2,839세대'],
  ['LH 매입임대 (1,643)', '8,510,925원 / 6,420원·세대', '국민임대 (280)', '1,445,632원 / 7,420원·세대'],
  ['에너지소외 (916)', '3,309,803원 / 18,195원·세대', 'TheKIE SaaS 수수료', '9,280,000원'],
] as const;

const CHAIN_ROWS = [
  ['2026-04-01', '182,140', '0xa14e…b9c2', 'f7a2…3e91', '11,427'],
  ['2026-04-08', '182,891', '0xc302…8d4f', '9b1c…8a30', '11,892'],
  ['2026-04-15', '183,472', '0x52f8…a017', '4d8f…20b1', '11,304'],
  ['2026-04-22', '184,108', '0x7f3e…a92c', '82c1…fe04', '11,651'],
  ['2026-04-30', '184,729', '0x8a44…d215', '1e90…a3c8', '11,840'],
] as const;

const SIGNATURES = [
  { label: '작성', org: 'TheKIE DPC',     stamped: false },
  { label: '검토', org: 'LH ESG 경영실',   stamped: false },
  { label: '승인', org: 'LH 사장',         stamped: true  },
] as const;

// ─── Icons ───────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

type Toast = { kind: 'pdf' | 'send'; text: string } | null;

export function ReportModal({ onClose }: ReportModalProps) {
  const [step, setStep] = useState<Step>('period');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>(PERIODS[0]);
  const [selectedGroup, setSelectedGroup] = useState<GroupId>(BUILDING_GROUPS[0].id);
  const [regionScope, setRegionScope] = useState<RegionScope>(REGION_SCOPES[0]);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<Toast>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 3 — simulated progress
  useEffect(() => {
    if (step !== 'generating') return;
    setProgress(0);
    const start = Date.now();
    const duration = 5000; // FR-O-002 budget
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

  function flashToast(t: Toast) {
    setToast(t);
    window.setTimeout(() => setToast(null), 1500);
  }

  function advance() {
    if (step === 'period') setStep('buildings');
    else if (step === 'buildings') setStep('generating');
  }

  const selectedGroupLabel = BUILDING_GROUPS.find((g) => g.id === selectedGroup)?.label ?? '';
  const canAdvance = step === 'period' || step === 'buildings';

  // Header subtitle is contextual: shows the chosen period once it's locked in.
  const headerTitle = step === 'done'
    ? `감사 보고서 생성 — ${selectedPeriod}`
    : '감사 보고서 생성';

  return (
    <Modal open={true} onClose={onClose} width={900}>
      {/* Header */}
      <div
        style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--panel)',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--ink)', color: '#FFFFFF',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}
          >
            {DocIcon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }}>
              {headerTitle}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
              FR-O-002 · LH ESG 경영실 양식 · 변조 불가 원장 첨부
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {step === 'done' && (
            <>
              <Btn
                variant="secondary"
                size="sm"
                icon={DownIcon}
                onClick={() => flashToast({ kind: 'pdf', text: 'PDF 생성 완료' })}
              >
                PDF 다운로드
              </Btn>
              <Btn
                variant="primary"
                size="sm"
                icon={ShareIcon}
                onClick={() => flashToast({ kind: 'send', text: 'LH 회계 발송 완료' })}
              >
                LH 회계 발송
              </Btn>
            </>
          )}
          <Btn variant="ghost" size="sm" onClick={onClose} icon={CrossIcon} />
        </div>
      </div>

      {/* Step indicator (shown for all pre-done states) */}
      {step !== 'done' && <StepIndicator step={step} />}

      {/* Inline confirmation pill */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            top: 76,
            right: 24,
            padding: '8px 14px',
            background: 'var(--accent)',
            color: '#FFFFFF',
            fontSize: 12.5,
            fontWeight: 700,
            borderRadius: 999,
            boxShadow: '0 4px 14px rgba(16,185,129,0.28)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            zIndex: 5,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF"
            strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5L20 7" />
          </svg>
          {toast.text}
        </div>
      )}

      {/* Body */}
      <div
        style={{
          padding: step === 'done' ? '28px 32px 36px' : 28,
          background: step === 'done' ? 'var(--bg)' : '#FFFFFF',
          maxHeight: '78vh',
          overflowY: 'auto',
        }}
      >
        {step === 'period' && (
          <PeriodStep
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            regionScope={regionScope}
            setRegionScope={setRegionScope}
          />
        )}

        {step === 'buildings' && (
          <BuildingsStep
            selectedPeriod={selectedPeriod}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
          />
        )}

        {step === 'generating' && (
          <GeneratingStep
            progress={progress}
            selectedGroupLabel={selectedGroupLabel}
            selectedPeriod={selectedPeriod}
          />
        )}

        {step === 'done' && <DocumentPreview />}

        {/* CTA — only on input steps */}
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

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const labels: ReadonlyArray<{ s: Step; label: string }> = [
    { s: 'period',     label: '기간 선택' },
    { s: 'buildings',  label: '동 선택'   },
    { s: 'generating', label: '생성'      },
  ];
  const order: Step[] = ['period', 'buildings', 'generating', 'done'];
  const currentIdx = order.indexOf(step);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        padding: '14px 26px',
        borderBottom: '1px solid var(--line)',
        background: '#FFFFFF',
      }}
    >
      {labels.map((entry, i) => {
        const thisIdx = order.indexOf(entry.s);
        const isDone = currentIdx > thisIdx;
        const isActive = currentIdx === thisIdx;
        return (
          <div key={entry.s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 24, height: 24, borderRadius: 999,
                  background: isDone ? 'var(--accent)' : isActive ? 'var(--ink)' : 'var(--line-2)',
                  color: isDone || isActive ? '#FFFFFF' : 'var(--muted-2)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 11, fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {isDone ? CheckIcon : i + 1}
              </div>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--ink)' : isDone ? 'var(--accent-ink)' : 'var(--muted-2)',
                }}
              >
                {entry.label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div style={{ width: 32, height: 1, background: 'var(--line-2)', margin: '0 12px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Period & region scope ───────────────────────────────────────────

function PeriodStep({
  selectedPeriod,
  setSelectedPeriod,
  regionScope,
  setRegionScope,
}: {
  selectedPeriod: Period;
  setSelectedPeriod: (p: Period) => void;
  regionScope: RegionScope;
  setRegionScope: (r: RegionScope) => void;
}) {
  return (
    <div>
      <div style={overlineStyle}>정산 기간 선택</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setSelectedPeriod(p)}
            style={pickerCardStyle(selectedPeriod === p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={overlineStyle}>보고서 범위</div>
        <select
          value={regionScope}
          onChange={(e) => setRegionScope(e.target.value as RegionScope)}
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 10,
            border: '1.5px solid var(--line-2)',
            background: '#FFFFFF',
            color: 'var(--ink)',
            fontSize: 13.5,
            fontWeight: 500,
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          {REGION_SCOPES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {regionScope !== '전체 (116개 건물)' && (
          <div
            style={{
              marginTop: 8,
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent)',
              fontSize: 12,
              color: 'var(--accent-ink)',
              fontWeight: 500,
            }}
          >
            해당 지역의 {REGION_COUNTS[regionScope]}개 건물만 포함
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Building scope ──────────────────────────────────────────────────

function BuildingsStep({
  selectedPeriod,
  selectedGroup,
  setSelectedGroup,
}: {
  selectedPeriod: Period;
  selectedGroup: GroupId;
  setSelectedGroup: (g: GroupId) => void;
}) {
  return (
    <div>
      <div style={overlineStyle}>대상 동 선택 — {selectedPeriod}</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {BUILDING_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setSelectedGroup(g.id)}
            style={{
              ...pickerCardStyle(selectedGroup === g.id),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{g.label}</span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 500,
                color:
                  selectedGroup === g.id ? 'rgba(255,255,255,0.7)' : 'var(--muted-2)',
              }}
            >
              {g.count}동
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Generating ──────────────────────────────────────────────────────

function GeneratingStep({
  progress,
  selectedGroupLabel,
  selectedPeriod,
}: {
  progress: number;
  selectedGroupLabel: string;
  selectedPeriod: Period;
}) {
  const phase =
    progress < 30 ? '동 데이터 집계 중…' :
    progress < 60 ? '블록체인 해시 검증 중…' :
    progress < 85 ? 'PDF 렌더링 중…' :
    '최종 검증 중…';

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            width: 44,
            height: 44,
            border: '3px solid var(--line)',
            borderTopColor: 'var(--accent)',
            borderRadius: 999,
            margin: '0 auto 16px',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
          감사 보고서 생성 중…
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>
          {selectedGroupLabel} · {selectedPeriod} · 블록체인 해시 검증 중
        </div>
      </div>

      <div
        style={{
          background: 'var(--panel)',
          borderRadius: 999,
          height: 8,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--accent)',
            borderRadius: 999,
            transition: 'width .1s linear',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11.5,
          color: 'var(--muted-2)',
        }}
      >
        <span>{phase}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{progress}%</span>
      </div>
    </div>
  );
}

// ─── Step 4: Document preview ────────────────────────────────────────────────

function DocumentPreview() {
  return (
    <article
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--line)',
        padding: '36px 44px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        color: 'var(--ink)',
        fontFamily: 'Pretendard, sans-serif',
      }}
    >
      {/* Doc meta header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 18,
          fontSize: 11.5,
          color: 'var(--muted)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span>
            문서번호:{' '}
            <span className="num" style={{ color: 'var(--ink)' }}>{REPORT.docNumber}</span>
          </span>
          <span>분류: {REPORT.classification}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' }}>
          <span>{REPORT.publishDate}</span>
          <span>{REPORT.org}</span>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          borderBottom: '1px solid var(--line-2)',
          paddingBottom: 20,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--ink)',
          }}
        >
          {REPORT.title}
        </h2>
        <div style={{ marginTop: 6, fontSize: 12.5, color: 'var(--muted)' }}>
          {REPORT.subtitle}
        </div>
      </div>

      {/* §1 정산 요약 */}
      <SectionBlock label="1. 정산 요약">
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 12.5,
            tableLayout: 'fixed',
          }}
        >
          <tbody>
            {SUMMARY_ROWS.map((row, i) => (
              <tr key={i}>
                <th style={thLabel}>{row[0]}</th>
                <td style={tdValue}>{row[1]}</td>
                <th style={thLabel}>{row[2]}</th>
                <td style={tdValue}>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBlock>

      {/* §2 블록체인 무결성 증빙 */}
      <SectionBlock label="2. 블록체인 무결성 증빙">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: 'var(--panel)' }}>
              <th style={thHead}>일자</th>
              <th style={thHead}>블록</th>
              <th style={thHead}>트랜잭션 ID</th>
              <th style={thHead}>해시</th>
              <th style={{ ...thHead, textAlign: 'right' }}>건수</th>
            </tr>
          </thead>
          <tbody>
            {CHAIN_ROWS.map((row, i) => (
              <tr key={i}>
                <td style={tdRow}>{row[0]}</td>
                <td className="num" style={tdRow}>{row[1]}</td>
                <td className="num" style={{ ...tdRow, color: 'var(--accent-ink)' }}>{row[2]}</td>
                <td className="num" style={tdRow}>{row[3]}</td>
                <td className="num" style={{ ...tdRow, textAlign: 'right' }}>{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBlock>

      {/* Footnotes */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          fontSize: 11.5,
          color: 'var(--muted)',
          lineHeight: 1.55,
        }}
      >
        <li>
          ※ 본 기간 변조 시도 1건 발생 → 자동 거부 완료 (Tx 0xe102…7c4a, 2026-04-30 13:23:58, IP 10.0.4.21).
        </li>
        <li>
          ※ 모든 정산 트랜잭션은 Hyperledger Fabric 원장에 영구 보존되며, 본 보고서의 해시는 RFC 6920 표준을 따릅니다.
        </li>
      </ul>

      {/* Signatures */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
          marginTop: 16,
          maxWidth: 480,
          marginLeft: 'auto',
        }}
      >
        {SIGNATURES.map((sig) => (
          <div
            key={sig.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--muted-2)', fontWeight: 600 }}>
              {sig.label}
            </span>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                border: sig.stamped ? '2px solid #C2412A' : '1.5px solid var(--line-2)',
                background: '#FFFFFF',
                color: sig.stamped ? '#C2412A' : 'transparent',
                display: 'grid',
                placeItems: 'center',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.04em',
                transform: sig.stamped ? 'rotate(-4deg)' : 'none',
                boxShadow: sig.stamped ? 'inset 0 0 0 1px #C2412A' : 'none',
              }}
            >
              {sig.stamped && '승인'}
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{sig.org}</span>
          </div>
        ))}
      </div>

      {/* KLHC formal seal */}
      <div
        style={{
          borderTop: '1px solid var(--line-2)',
          marginTop: 20,
          paddingTop: 18,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.55em',
          color: 'var(--ink)',
        }}
      >
        한 국 토 지 주 택 공 사
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 4,
          fontSize: 10.5,
          color: 'var(--muted-2)',
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        본 문서는 Lucia 블록체인 정산 플랫폼에서 자동 생성되었으며,{' '}
        <span className="num">FRD-2026-001 v1.0</span> 기준 검증되었습니다 ·
        페이지 <span className="num">1 / {REPORT.totalPages}</span>
      </div>
    </article>
  );
}

// ─── Atoms / styles ──────────────────────────────────────────────────────────

function SectionBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          padding: '8px 12px',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          fontSize: 12.5,
          fontWeight: 700,
          color: 'var(--ink)',
          letterSpacing: '-0.005em',
        }}
      >
        {label}
      </div>
      <div>{children}</div>
    </section>
  );
}

const overlineStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--muted)',
  marginBottom: 14,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

function pickerCardStyle(active: boolean): React.CSSProperties {
  return {
    padding: '14px 18px',
    borderRadius: 12,
    border: `2px solid ${active ? 'var(--ink)' : 'var(--line-2)'}`,
    background: active ? 'var(--ink)' : '#FFFFFF',
    color: active ? '#FFFFFF' : 'var(--ink)',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all .15s ease',
  };
}

const thLabel: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  background: 'var(--panel)',
  border: '1px solid var(--line)',
  fontWeight: 600,
  color: 'var(--ink-2)',
  width: '20%',
  whiteSpace: 'nowrap',
};

const tdValue: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid var(--line)',
  color: 'var(--ink)',
  fontWeight: 500,
};

const thHead: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  border: '1px solid var(--line)',
  fontWeight: 700,
  color: 'var(--ink-2)',
  fontSize: 11.5,
};

const tdRow: React.CSSProperties = {
  padding: '9px 12px',
  border: '1px solid var(--line)',
  color: 'var(--ink)',
};
