// ResidentCard — 입주민 환원 미리보기 (sidebar compact)
// FR-M-007 · mock identity 홍*동 / ULJN-001

import { Link } from 'react-router-dom';

import { Pill, Btn } from '@/components/atoms';

export function ResidentCard() {
  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* gradient header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #EBF2FF 0%, #EFF5FF 60%, #fff 100%)',
          padding: '20px 22px 16px',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <Pill tone="indigo">FR-M-007</Pill>
          <span style={{ fontSize: 11, color: '#9AA0AB', fontWeight: 500 }}>Mock 모드</span>
        </div>

        {/* identity row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #6BA8F0, #3B82F6)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            홍
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>홍*동 입주민님</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              LH 매입임대 · ULJN-001
            </div>
          </div>
        </div>

        {/* 이번 달 환원 금액 */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: '#0D4AA0', fontWeight: 600, marginBottom: 4 }}>
            이번 달 환원 금액
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span
              className="num"
              style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em' }}
            >
              6,420
            </span>
            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>원</span>
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                color: '#1264D3',
                fontWeight: 600,
                background: '#DBEAFE',
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              월 자동 정산
            </span>
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ padding: '16px 22px' }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', marginBottom: 10 }}>
          어느 동 발전량에서
        </div>

        <div style={{ display: 'grid', gap: 7, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280' }}>ULJN-001 발전수익 (4월)</span>
            <span className="num" style={{ fontWeight: 600 }}>16,432,180원</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280' }}>주거비 환원 비율 (41%)</span>
            <span className="num" style={{ fontWeight: 600 }}>6,737,194원</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280' }}>LH 매입임대 분배 (64.2%)</span>
            <span className="num" style={{ fontWeight: 600 }}>4,325,278원</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B7280' }}>1,643세대 균등 분배</span>
            <span className="num" style={{ fontWeight: 700, color: '#0D4AA0' }}>
              ÷ 1,643 = 6,420원
            </span>
          </div>
        </div>

        {/* chain tx_id link */}
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px dashed var(--line-2)',
            fontSize: 11,
            color: '#9AA0AB',
          }}
        >
          블록체인 증빙 tx_id:{' '}
          <span
            className="mono"
            style={{ color: '#4F46E5', fontWeight: 600 }}
          >
            0x8a44…d215
          </span>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 14 }}>
          <Link to="/portal/h0001" style={{ textDecoration: 'none' }}>
            <Btn variant="secondary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
              포털 열기 →
            </Btn>
          </Link>
        </div>
      </div>
    </div>
  );
}
