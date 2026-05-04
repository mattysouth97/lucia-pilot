// apps/web/src/routes/Login/index.tsx
import { useState } from 'react';

import { RoleTab } from './RoleTab';
import { LOGIN_OVERLINE, LOGIN_SUBTITLE, LOGIN_TITLE, ROLE_TAB_LABEL } from './copy';

import type { Role } from '@/auth/types';
import { useRouteMeta } from '@/routes/Invest/meta';

const ROLES: ReadonlyArray<Role> = ['analyst', 'operator', 'resident', 'investor'];

export function LoginPage() {
  useRouteMeta({
    title: 'Lucia — 로그인',
    description: '데모용 다중 역할 로그인',
    robots: 'noindex, nofollow',
  });

  const [active, setActive] = useState<Role>('analyst');

  return (
    <main className="landing-section">
      <div className="landing-container" style={{ maxWidth: 640 }}>
        <p className="overline">{LOGIN_OVERLINE}</p>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, letterSpacing: '-0.025em',
          margin: '12px 0 8px', color: 'var(--ink)',
        }}>
          {LOGIN_TITLE}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>
          {LOGIN_SUBTITLE}
        </p>

        <div role="tablist" aria-label="역할 선택" style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)' }}>
          {ROLES.map(role => (
            <button
              key={role}
              role="tab"
              aria-selected={active === role}
              onClick={() => setActive(role)}
              data-testid={`login-tab-${role}`}
              style={{
                padding: '10px 16px', fontSize: 13, fontWeight: 600,
                color: active === role ? 'var(--ink)' : 'var(--muted)',
                borderBottom: active === role ? '2px solid var(--ink)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {ROLE_TAB_LABEL[role]}
            </button>
          ))}
        </div>

        <RoleTab role={active} />
      </div>
    </main>
  );
}
