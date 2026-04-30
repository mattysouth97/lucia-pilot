import type { ReactNode } from 'react';
import { Topbar } from '@/components/layout/Topbar';

interface AppShellProps {
  children: ReactNode;
  tab: string;
  setTab: (t: string) => void;
}

// FR-M-001 — Lucia outer shell.
// Renders the dotted/gradient app background, the sticky <Topbar>, and the main
// content padding box. Children are the routed pages composed by `App.tsx`.
export function AppShell({ children, tab, setTab }: AppShellProps) {
  return (
    <div className="app-shell">
      <Topbar tab={tab} setTab={setTab} />
      <div className="container-x">{children}</div>
    </div>
  );
}
