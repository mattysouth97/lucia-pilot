// apps/web/src/auth/demoAccounts.ts
import type { AuthUser, Role } from './types';

export const DEMO_ACCOUNTS: ReadonlyArray<AuthUser> = [
  { id: 'u_analyst_kim',  role: 'analyst',  displayName: '김지호 처장',  subtitle: 'LH ESG 경영실' },
  { id: 'u_operator_spc', role: 'operator', displayName: 'SPC 운영팀',   subtitle: '울진 매입임대 운영' },
  { id: 'h0001',          role: 'resident', displayName: '홍*동',       subtitle: 'ULJN-001 거주 · LH 매입임대 (1,643세대)' },
  { id: 'k0014',          role: 'resident', displayName: '김*수',       subtitle: 'YESN-014 거주 · 국민임대 (280세대)' },
  { id: 'e0042',          role: 'resident', displayName: '이*경',       subtitle: 'BSAN-042 거주 · 에너지소외 (916세대)' },
  { id: 'u_investor_a01', role: 'investor', displayName: 'SK하이닉스 ESG실', subtitle: 'RE100 PPA 매수자 · 약정 180,000 kWh/월' },
];

export function findAccount(userId: string): AuthUser | undefined {
  return DEMO_ACCOUNTS.find(a => a.id === userId);
}

export function firstAccountForRole(role: Role): AuthUser | undefined {
  return DEMO_ACCOUNTS.find(a => a.role === role);
}
