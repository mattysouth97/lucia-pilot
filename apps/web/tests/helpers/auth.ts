// apps/web/tests/helpers/auth.ts
import { findAccount } from '@/auth/demoAccounts';
import type { Role } from '@/auth/types';

export function loginAsForTest(role: Role): void {
  const id = role === 'analyst'  ? 'u_analyst_kim'  :
             role === 'operator' ? 'u_operator_spc' :
             role === 'resident' ? 'h0001'          :
                                   'u_investor_a01';
  if (!findAccount(id)) {
    throw new Error(`No demo account for role: ${role}`);
  }
  sessionStorage.setItem('lucia.auth.userId', id);
}

export function logoutForTest(): void {
  sessionStorage.removeItem('lucia.auth.userId');
}
