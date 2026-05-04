// apps/web/src/auth/RoleRedirect.tsx
import { Navigate } from 'react-router-dom';

import { useAuth } from './AuthProvider';

import { AnalystHome } from '@/routes/Home/AnalystHome';
import { OperatorHome } from '@/routes/Home/OperatorHome';

export function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login?redirect=%2F" replace />;
  switch (user.role) {
    case 'analyst':  return <AnalystHome />;
    case 'operator': return <OperatorHome />;
    case 'resident': return <Navigate to={`/portal/${user.id}`} replace />;
    case 'investor': return <Navigate to="/invest/dashboard" replace />;
  }
}
