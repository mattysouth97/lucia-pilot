// apps/web/src/routes/Login/AccountCard.tsx
import type { AuthUser } from '@/auth/types';

interface Props {
  account: AuthUser;
  onClick: () => void;
}

export function AccountCard({ account, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`login-account-${account.id}`}
      className="card card-pad"
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        textAlign: 'left', cursor: 'pointer', width: '100%',
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{account.displayName}</div>
        {account.subtitle && (
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{account.subtitle}</div>
        )}
      </div>
      <span style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 }}>로그인 →</span>
    </button>
  );
}
