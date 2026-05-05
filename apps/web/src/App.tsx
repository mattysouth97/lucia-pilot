import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import { AppShell } from '@/components/AppShell';
import { ModalProvider } from '@/lib/modals';
import { AdminConsole } from '@/routes/AdminConsole';
import { BuildingDetail } from '@/routes/BuildingDetail';
import { InstallSimulator } from '@/routes/InstallSimulator';
import { LedgerPage } from '@/routes/Ledger';
import { MapExplorer } from '@/routes/MapExplorer';
import { MonitorPage } from '@/routes/Monitor';
import { ResidentPortal } from '@/routes/ResidentPortal';

const Landing = lazy(() => import('@/routes/Invest').then(m => ({ default: m.Landing })));
const LandingShell = lazy(() =>
  import('@/routes/Invest/LandingShell').then(m => ({ default: m.LandingShell })),
);
const ProjectsCatalog = lazy(() =>
  import('@/routes/Invest/Projects').then(m => ({ default: m.ProjectsCatalog })),
);
const SiteDetail = lazy(() =>
  import('@/routes/Invest/Projects/SiteDetail').then(m => ({ default: m.SiteDetail })),
);
const OnboardingPage = lazy(() =>
  import('@/routes/Invest/placeholders/OnboardingPage').then(m => ({ default: m.OnboardingPage })),
);
const DisclosurePages = lazy(() =>
  import('@/routes/Invest/placeholders/DisclosurePages').then(m => ({ default: m.DisclosurePages })),
);
const RoleRedirect = lazy(() =>
  import('@/auth/RoleRedirect').then(m => ({ default: m.RoleRedirect })),
);
const RequireRole = lazy(() =>
  import('@/auth/RequireRole').then(m => ({ default: m.RequireRole })),
);
const LoginPage = lazy(() => import('@/routes/Login').then(m => ({ default: m.LoginPage })));
const InvestorHome = lazy(() =>
  import('@/routes/Home/InvestorHome').then(m => ({ default: m.InvestorHome })),
);

// Topbar tabs map to routes; navigation reflects URL.
//   개요             → /
//   정산 원장        → /ledger
//   동별 모니터       → /monitor
//   후보지 지도       → /map
//   투자 시뮬레이터    → /simulator
//   관리자           → /admin
const TAB_TO_PATH: Record<string, string> = {
  관리자: '/admin',
  '투자 시뮬레이터': '/simulator',
  '후보지 지도': '/map',
  '동별 모니터': '/monitor',
  '정산 원장': '/ledger',
};

function tabFromPath(path: string): string {
  if (path.startsWith('/admin')) return '관리자';
  if (path.startsWith('/simulator')) return '투자 시뮬레이터';
  if (path.startsWith('/map')) return '후보지 지도';
  if (path.startsWith('/monitor')) return '동별 모니터';
  if (path.startsWith('/ledger')) return '정산 원장';
  return '개요';
}

function AppInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTabState] = useState<string>(() => tabFromPath(location.pathname));

  // Keep the topbar pill in sync with browser back/forward.
  useEffect(() => {
    setTabState(tabFromPath(location.pathname));
  }, [location.pathname]);

  const setTab = (t: string) => {
    setTabState(t);
    const path = TAB_TO_PATH[t];
    if (path) {
      navigate(path);
      return;
    }
    // 개요 — back to dashboard root.
    if (location.pathname !== '/') navigate('/');
  };

  return (
    <Routes>
      {/* Public — LandingShell */}
      <Route
        path="/login"
        element={
          <Suspense fallback={null}>
            <LandingShell>
              <LoginPage />
            </LandingShell>
          </Suspense>
        }
      />

      {/* Logged-in investor — AppShell */}
      <Route
        path="/invest/dashboard"
        element={
          <Suspense fallback={null}>
            <AppShell tab={tab} setTab={setTab}>
              <RequireRole roles={['investor']}>
                <InvestorHome />
              </RequireRole>
            </AppShell>
          </Suspense>
        }
      />

      {/* Public /invest surfaces — LandingShell */}
      <Route
        path="/invest/*"
        element={
          <Suspense fallback={null}>
            <LandingShell>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="projects" element={<ProjectsCatalog />} />
                <Route path="projects/:siteId" element={<SiteDetail />} />
                <Route path="onboarding" element={<OnboardingPage />} />
                <Route path="disclosures/*" element={<DisclosurePages />} />
              </Routes>
            </LandingShell>
          </Suspense>
        }
      />

      {/* Everything else — AppShell with RequireRole gating */}
      <Route
        path="/*"
        element={
          <AppShell tab={tab} setTab={setTab}>
            <Routes>
              <Route
                path="/"
                element={
                  <Suspense fallback={null}>
                    <RoleRedirect />
                  </Suspense>
                }
              />
              <Route
                path="/buildings/:id"
                element={
                  <Suspense fallback={null}>
                    <RequireRole roles={['analyst', 'operator']}>
                      <BuildingDetail />
                    </RequireRole>
                  </Suspense>
                }
              />
              <Route
                path="/portal/:user_id"
                element={
                  <Suspense fallback={null}>
                    <RequireRole roles={['resident']}>
                      <ResidentPortal />
                    </RequireRole>
                  </Suspense>
                }
              />
              <Route
                path="/simulator"
                element={
                  <Suspense fallback={null}>
                    <RequireRole roles={['analyst', 'operator']}>
                      <InstallSimulator />
                    </RequireRole>
                  </Suspense>
                }
              />
              <Route
                path="/monitor"
                element={
                  <Suspense fallback={null}>
                    <RequireRole roles={['analyst', 'operator']}>
                      <MonitorPage />
                    </RequireRole>
                  </Suspense>
                }
              />
              <Route
                path="/ledger"
                element={
                  <Suspense fallback={null}>
                    <RequireRole roles={['analyst', 'operator']}>
                      <LedgerPage />
                    </RequireRole>
                  </Suspense>
                }
              />
              <Route
                path="/map"
                element={
                  <Suspense fallback={null}>
                    <RequireRole roles={['analyst', 'operator']}>
                      <MapExplorer />
                    </RequireRole>
                  </Suspense>
                }
              />
              <Route
                path="/admin"
                element={
                  <Suspense fallback={null}>
                    <RequireRole roles={['analyst', 'operator']}>
                      <AdminConsole />
                    </RequireRole>
                  </Suspense>
                }
              />
            </Routes>
          </AppShell>
        }
      />
    </Routes>
  );
}

export default function App() {
  // QueryClientProvider is mounted in main.tsx; ModalProvider lives here.
  return (
    <ModalProvider>
      <AppInner />
    </ModalProvider>
  );
}
