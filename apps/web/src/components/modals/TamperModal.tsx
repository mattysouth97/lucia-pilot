import { Modal } from './Modal.js';
import { Pill, Btn } from '@/components/atoms';

interface TamperModalProps {
  onClose: () => void;
}

const LockIcon = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const CrossIcon = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 6 12 12M6 18 18 6" />
  </svg>
);

const SearchIcon = (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export function TamperModal({ onClose }: TamperModalProps) {
  return (
    <Modal open={true} onClose={onClose} width={760}>
      {/* Full-screen-style rose banner header */}
      <div style={{
        background: '#BE123C',
        padding: '28px 28px 24px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}>
            {LockIcon}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
              FR-S-008 · 변조 시도 거부됨
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              변조 시도 거부됨
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
              블록체인 해시 불일치 감지 — 트랜잭션 자동 거부 및 감사 로그 기록 완료
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: 999, width: 32, height: 32,
            color: '#fff', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}
        >
          {CrossIcon}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px 28px', background: '#fff', overflow: 'auto' }}>

        {/* Alert summary row */}
        <div style={{
          background: '#FFF1F3', border: '1px solid #FFD9DF', borderRadius: 12,
          padding: '16px 18px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: '#FECDD3', color: '#BE123C',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            {LockIcon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#BE123C', marginBottom: 3 }}>
              변조 시도 자동 거부 완료
            </div>
            <div style={{ fontSize: 11.5, color: '#9F1239', fontFamily: 'monospace' }}>
              Tx 0xe102…7c4a · 2026-04-30 13:23:58 KST · admin@lucia · IP 10.0.4.21 · hash_mismatch
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#047857',
            background: '#D1FAE5', padding: '4px 10px', borderRadius: 999,
            flexShrink: 0,
          }}>
            원장 무결성 유지
          </span>
        </div>

        {/* Detail grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>

          {/* Attempt details */}
          <div style={{
            background: '#FAFBFC', border: '1px solid #E2E5EA', borderRadius: 12, padding: 18,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA0AB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              변조 시도 상세
            </div>
            {[
              { lbl: '시도 주체', val: 'admin@lucia' },
              { lbl: 'IP 주소',   val: '10.0.4.21' },
              { lbl: '시각',      val: '2026-04-30 13:23:58' },
              { lbl: '대상 블록', val: '#184729' },
              { lbl: '대상 Tx',  val: '0x7f3e…a92c' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0',
                borderBottom: i < 4 ? '1px solid #F1F3F5' : 'none',
                fontSize: 12.5,
              }}>
                <span style={{ color: '#6B7280' }}>{row.lbl}</span>
                <span style={{ fontWeight: 700, color: '#0E1116', fontFamily: 'monospace', fontSize: 12 }}>
                  {row.val}
                </span>
              </div>
            ))}
          </div>

          {/* Hash comparison */}
          <div style={{
            background: '#FAFBFC', border: '1px solid #E2E5EA', borderRadius: 12, padding: 18,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA0AB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
              해시 불일치 증거
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#047857', fontWeight: 600, marginBottom: 6 }}>원본 해시 (원장)</div>
              <div style={{
                background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8,
                padding: '10px 12px', fontFamily: 'monospace', fontSize: 12,
                color: '#047857', fontWeight: 700, wordBreak: 'break-all',
              }}>
                f7a2b9c1d4e83a12…3e91
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#BE123C', fontWeight: 600, marginBottom: 6 }}>시도된 해시 (거부)</div>
              <div style={{
                background: '#FFF1F3', border: '1px solid #FFD9DF', borderRadius: 8,
                padding: '10px 12px', fontFamily: 'monospace', fontSize: 12,
                color: '#BE123C', fontWeight: 700, wordBreak: 'break-all',
              }}>
                8c91f4a2e01b3d9c…7d2e
              </div>
            </div>
          </div>
        </div>

        {/* Chain proof */}
        <div style={{
          background: '#FAFBFC', border: '1px solid #E2E5EA', borderRadius: 12, padding: 18,
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9AA0AB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            체인 거부 기록
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { lbl: '체인 Tx ID',  val: '0xe102…7c4a', tone: 'neutral' as const },
              { lbl: '거부 시각',   val: '13:23:58',     tone: 'rose' as const },
              { lbl: '감사 상태',   val: '로그 기록됨',  tone: 'green' as const },
            ].map((item) => (
              <div key={item.lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#9AA0AB', marginBottom: 6 }}>{item.lbl}</div>
                <Pill tone={item.tone}>{item.val}</Pill>
              </div>
            ))}
          </div>
        </div>

        {/* Verification steps */}
        <div style={{
          background: '#FFF1F3', border: '1px solid #FFD9DF', borderRadius: 12, padding: 18,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9F1239', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            자동 처리 순서
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              '1. Smart Contract endorsement 호출 (Org A + Org B)',
              '2. Hash chain 검증 — 원본 해시와 비교',
              '3. 변경 후 해시: 8c91…7d2e ≠ 원본 f7a2…3e91',
              '4. 트랜잭션 거부 → 알림 발송 + 감사 로그 기록',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 999,
                  background: i < 2 ? '#10B981' : '#F43F5E',
                  display: 'grid', placeItems: 'center',
                  flexShrink: 0,
                }}>
                  {i < 2 ? (
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 12 5 5L20 7" />
                    </svg>
                  ) : (
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 6 12 12M6 18 18 6" />
                    </svg>
                  )}
                </span>
                <span style={{
                  color: i >= 2 ? '#BE123C' : '#0E1116',
                  fontWeight: i >= 2 ? 700 : 500,
                }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ fontSize: 11.5, color: '#9AA0AB', textAlign: 'center', marginBottom: 20 }}>
          본 알림은 LH 본사 시연 시나리오 5단계(05:30~06:30)에 자동 표시됩니다.
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          <Btn variant="secondary" icon={SearchIcon}>감사 로그 보기</Btn>
          <Btn variant="primary" onClick={onClose}>닫기</Btn>
        </div>
      </div>
    </Modal>
  );
}
