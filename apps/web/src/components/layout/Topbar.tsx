import { Icons } from '@/components/Icons';

interface TopbarProps {
  tab: string;
  setTab: (t: string) => void;
}

const TABS = ['개요', '정산 원장', '동별 모니터', '감사·보고', '관리자'];

export function Topbar({ tab, setTab }: TopbarProps) {
  return (
    <div style={{
      height: 64,
      background: '#fff',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 28,
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: 'linear-gradient(135deg, #10B981 0%, #06B6A2 100%)',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
        }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.025em' }}>Lucia</div>
          <div style={{ fontSize: 10.5, color: '#9AA0AB', letterSpacing: '-0.01em', marginTop: -2 }}>
            가상공유거래 정산
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '9px 16px',
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 600,
              background: tab === t ? '#0E1116' : 'transparent',
              color: tab === t ? '#fff' : '#6B7280',
              letterSpacing: '-0.01em',
              transition: 'all .15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#F4F5F7',
        padding: '8px 14px',
        borderRadius: 999,
        width: 280,
        color: '#9AA0AB',
      }}>
        {Icons.Search}
        <span style={{ fontSize: 13 }}>동·정산ID·트랜잭션 검색</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9AA0AB' }} className="mono">
          ⌘K
        </span>
      </div>

      {/* Status pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{ width: 8, height: 8, borderRadius: 999, background: '#10B981' }}
          className="pulse-dot"
        />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#047857' }}>정산엔진 정상</span>
        <span className="mono" style={{ fontSize: 11, color: '#9AA0AB' }}>v1.0.4</span>
      </div>

      {/* Bell */}
      <button style={{
        width: 38,
        height: 38,
        borderRadius: 999,
        background: '#F4F5F7',
        display: 'grid',
        placeItems: 'center',
        color: '#374151',
        position: 'relative',
      }}>
        {Icons.Bell}
        <span style={{
          position: 'absolute',
          top: 7,
          right: 8,
          width: 8,
          height: 8,
          borderRadius: 999,
          background: '#F43F5E',
          border: '2px solid #fff',
        }} />
      </button>

      {/* User */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 14,
        borderLeft: '1px solid var(--line-2)',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 999,
          background: 'linear-gradient(135deg, #6EE7B7, #06B6A2)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 13,
          display: 'grid',
          placeItems: 'center',
          letterSpacing: '-0.02em',
        }}>
          김ESG
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.015em' }}>김지호 처장</div>
          <div style={{ fontSize: 11, color: '#9AA0AB', marginTop: -1 }}>LH ESG 경영실</div>
        </div>
        {Icons.Caret}
      </div>
    </div>
  );
}
