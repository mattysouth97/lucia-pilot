// FR-M-001 / FR-S-007 — settlement transaction detail modal.
// Active trigger: ledger row click. Active trigger for 거부됨 rows escalates
// to TamperModal via the (R3) two-modal pattern.

import { Modal } from './Modal.js';

import type { LedgerRow } from '@/routes/Home/ActivityZone';

export interface TxDetailModalProps {
  readonly tx: LedgerRow;
  readonly onClose: () => void;
  readonly onEscalateToRejection?: () => void;
}

const CrossIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 6 12 12M6 18 18 6" />
  </svg>
);

export function TxDetailModal({ tx, onClose, onEscalateToRejection }: TxDetailModalProps) {
  const isRejection = tx.status === 'bad';
  return (
    <Modal open={true} onClose={onClose} width={560}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px',
        borderBottom: '1px solid #E2E5EA',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA0AB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            FR-M-001 · FR-S-007
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em' }}>
            거래 상세
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, fontFamily: 'Geist Mono, ui-monospace, monospace' }}>
            {tx.id}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#F4F5F7', border: 'none',
            borderRadius: 999, width: 32, height: 32,
            color: '#6B7280', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {CrossIcon}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '20px 24px 24px', background: '#FAFBFC', overflow: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <TxRow label="거래 ID"   value={tx.id}                                  mono />
          <TxRow label="동"        value={`${tx.buildingName} (${tx.buildingId})`} />
          <TxRow label="정산 항목" value={tx.service}                             />
          <TxRow label="금액"      value={tx.amount}                              mono bold />
          <TxRow label="상태"      value={tx.statusLabel}                         tone={tx.status} />
          <TxRow label="블록"      value="#184,729"                               mono />
          <TxRow label="해시"      value="0x9f8c4e2a3b1d7e5c6f0a8b9d1e2f3a4b5c6d7e8f" mono small />
          <TxRow label="이전 해시" value="0x8e7b3d1c2a9f6e4b5c7d0a8b9c1d2e3f4a5b6c7d" mono small />
        </div>

        {isRejection && onEscalateToRejection && (
          <button
            type="button"
            onClick={onEscalateToRejection}
            style={{
              marginTop: 20,
              width: '100%',
              padding: '11px 14px',
              background: '#BE123C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '-0.01em',
            }}
          >
            변조 시도 분석 →
          </button>
        )}
      </div>
    </Modal>
  );
}

function TxRow(props: {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
  readonly bold?: boolean;
  readonly small?: boolean;
  readonly tone?: 'good' | 'warn' | 'bad';
}) {
  const color =
    props.tone === 'good' ? 'var(--accent-ink, #047857)'
    : props.tone === 'warn' ? '#B45309'
    : props.tone === 'bad'  ? '#BE123C'
    : '#0E1116';
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '120px 1fr',
      gap: 12,
      alignItems: 'baseline',
      padding: '9px 0',
      borderBottom: '1px solid #F1F3F5',
    }}>
      <span style={{ fontSize: 11, color: '#9AA0AB', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {props.label}
      </span>
      <span style={{
        fontFamily: props.mono ? 'Geist Mono, ui-monospace, monospace' : 'inherit',
        fontSize: props.small ? 11 : 13,
        fontWeight: props.bold ? 700 : 500,
        color,
        wordBreak: 'break-all',
      }}>
        {props.value}
      </span>
    </div>
  );
}
