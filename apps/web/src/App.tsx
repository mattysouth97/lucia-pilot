import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import { AppShell } from '@/components/AppShell';
import { DemoProvider } from '@/demo/DemoController';
import { ModalProvider } from '@/lib/modals';
import { AdminConsole } from '@/routes/AdminConsole';
import { BuildingDetail } from '@/routes/BuildingDetail';
import { InstallSimulator } from '@/routes/InstallSimulator';
import { MapExplorer } from '@/routes/MapExplorer';
import { ResidentPortal } from '@/routes/ResidentPortal';

const Landing = lazy(() => import('@/routes/Invest').then(m => ({ default: m.Landing })));
const LandingShell = lazy(() =>
  import('@/routes/Invest/LandingShell').then(m => ({ default: m.LandingShell })),
);
const ProjectsPage = lazy(() =>
  import('@/routes/Invest/placeholders/ProjectsPage').then(m => ({ default: m.ProjectsPage })),
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

// FR-M-001 — Topbar tabs map to routes / on-page sections so navigation reflects URL.
//   개요             → /
//   정산 원장        → / (anchor scroll)
//   동별 모니터       → / (anchor scroll, BuildingsCard)
//   감사·보고        → / (anchor scroll, BlockchainCard)
//   후보지 지도       → /map
//   투자 시뮬레이터    → /simulator
//   관리자           → /admin
const TAB_TO_PATH: Record<string, string> = {
  관리자: '/admin',
  '투자 시뮬레이터': '/simulator',
  '후보지 지도': '/map',
};

const TAB_TO_ANCHOR: Record<string, string> = {
  '정산 원장': 'distribution-card',
  '동별 모니터': 'buildings-card',
  '감사·보고': 'blockchain-card',
};

function tabFromPath(path: string): string {
  if (path.startsWith('/admin')) return '관리자';
  if (path.startsWith('/simulator')) return '투자 시뮬레이터';
  if (path.startsWith('/map')) return '후보지 지도';
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
    // Anchor tabs route back to dashboard then scroll to the section.
    if (location.pathname !== '/') navigate('/');
    const anchor = TAB_TO_ANCHOR[t];
    if (anchor) {
      // Defer to next tick so the dashboard mounts before scrolling.
      window.setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
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
                <Route path="projects" element={<ProjectsPage />} />
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
  // QueryClientProvider is mounted in main.tsx; ModalProvider + DemoProvider live here
  // so they can use router hooks (DemoController calls useNavigate).
  return (
    <ModalProvider>
      <DemoProvider>
        <AppInner />
      </DemoProvider>
    </ModalProvider>
  );
}
