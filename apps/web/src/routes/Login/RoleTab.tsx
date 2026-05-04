// apps/web/src/routes/Login/RoleTab.tsx
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AccountCard } from './AccountCard';
import { LOGIN_QUICK } from './copy';

import { useAuth } from '@/auth/AuthProvider';
import { DEMO_ACCOUNTS } from '@/auth/demoAccounts';
import type { Role } from '@/auth/types';

// FR-A-001 — open-redirect guard. Only honor relative paths beginning with a
// single "/" (rejects "//evil.com" protocol-relative and absolute URLs).
function safeRedirect(raw: string | null): string {
  if (!raw) return '/';
  if (/^\/[^/\\]/.test(raw)) return raw;
  if (raw === '/') return '/';
  return '/';
}

export function RoleTab({ role }: { role: Role }) {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const accounts = DEMO_ACCOUNTS.filter(a => a.role === role);

  const onPicked = (userId: string) => {
    login(userId);
    navigate(safeRedirect(params.get('redirect')));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {accounts.map(account => (
        <AccountCard key={account.id} account={account} onClick={() => onPicked(account.id)} />
      ))}
      {accounts.length > 1 && (
        <button
          type="button"
          onClick={() => {
            loginAs(role);
            navigate(safeRedirect(params.get('redirect')));
          }}
          style={{
            marginTop: 8, fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600,
            textAlign: 'left', alignSelf: 'flex-start',
          }}
        >
          {LOGIN_QUICK}
        </button>
      )}
    </div>
  );
}
