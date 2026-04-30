import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      {/* Sticky topbar — 64px high, 1440px content max-width (FR-M-001 topbar) */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 64,
          background: 'var(--panel)',
          borderBottom: '1px solid var(--line)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            Lucia
          </span>
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>
            LH 매입임대 햇빛발전소 정산 플랫폼
          </span>
        </div>
      </header>

      {/* Main content area */}
      <main
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '24px 28px 60px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
