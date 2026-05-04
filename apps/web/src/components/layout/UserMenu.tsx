// apps/web/src/components/layout/UserMenu.tsx
import { useAuth } from '@/auth/AuthProvider';

export function UserMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const initial = user.displayName.slice(0, 1);

  return (
    <details style={{ position: 'relative' }}>
      <summary
        data-testid="user-menu-summary"
        style={{
          listStyle: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: 'var(--bar-ink)',
        }}
      >
        <span style={{
          width: 28, height: 28, borderRadius: 4,
          background: '#FFFFFF', color: 'var(--ink)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>
          {initial}
        </span>
        <span className="topbar-user-meta" style={{ fontSize: 12.5, lineHeight: 1.2 }}>
          <span style={{ display: 'block' }}>{user.displayName}</span>
          <span style={{ display: 'block', color: 'var(--bar-ink-2)', fontSize: 11 }}>{user.subtitle ?? user.role}</span>
        </span>
      </summary>
      <div
        role="menu"
        style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--panel)', color: 'var(--ink)',
          border: '1px solid var(--line)', borderRadius: 6,
          minWidth: 180, padding: 4, zIndex: 100,
        }}
      >
        <button
          type="button"
          role="menuitem"
          onClick={logout}
          data-testid="user-menu-logout"
          style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '8px 12px', fontSize: 13, color: 'var(--ink)', borderRadius: 4,
          }}
        >
          로그아웃
        </button>
      </div>
    </details>
  );
}
