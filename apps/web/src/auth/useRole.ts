// apps/web/src/auth/useRole.ts
import { useAuth } from './AuthProvider';
import type { Role } from './types';

export function useRole(): Role | null {
  return useAuth().user?.role ?? null;
}
