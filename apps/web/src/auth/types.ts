// apps/web/src/auth/types.ts
export type Role = 'analyst' | 'operator' | 'resident' | 'investor';

export interface AuthUser {
  readonly id: string;
  readonly role: Role;
  readonly displayName: string;
  readonly subtitle?: string;
  /** Korean honorific suffix (e.g. '처장' → '김지호 처장님'). Optional;
   *  rendered as `${displayName} ${honorific}님` when present. */
  readonly honorific?: string;
}

export interface AuthState {
  readonly user: AuthUser | null;
  readonly status: 'idle' | 'authenticated' | 'logging-out';
}

export interface AuthContextValue extends AuthState {
  login(userId: string): void;
  loginAs(role: Role): void;
  logout(): void;
}
