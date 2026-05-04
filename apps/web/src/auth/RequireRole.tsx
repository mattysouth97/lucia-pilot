// apps/web/src/auth/RequireRole.tsx
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from './AuthProvider';
import type { Role } from './types';

interface Props {
  roles: ReadonlyArray<Role>;
  children: ReactNode;
}

export function RequireRole({ roles, children }: Props) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  if (!roles.includes(user.role)) {
    return <ForbiddenPage userRole={user.role} requiredRoles={roles} />;
  }
  return <>{children}</>;
}

function ForbiddenPage({ userRole, requiredRoles }: { userRole: Role; requiredRoles: ReadonlyArray<Role> }) {
  const requiredText = requiredRoles.join(', ');
  return (
    <main style={{ padding: '120px 24px', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)' }}>권한이 없습니다</h1>
      <p style={{ color: 'var(--muted)', marginTop: 12 }}>
        이 페이지는 {requiredText} 역할만 접근할 수 있습니다. 현재 역할: <strong>{userRole}</strong>
      </p>
      <a href="/" style={{ marginTop: 24, display: 'inline-block', color: 'var(--accent-ink)', fontWeight: 600 }}>
        ← 내 홈으로
      </a>
    </main>
  );
}
