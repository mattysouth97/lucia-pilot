# LuciaEnergy Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `apps/lucia-energy` — a separate Vite+React app for the LuciaEnergy B2B platform landing page — and wire the cross-link tab from `apps/web/LandingHeader.tsx` to it, with the 13-section IA, LuciaEnergy-specific design tokens, and a Zod-validated inquiry form. No MERIDIAN naming. No 발전왕 naming. Korean-only copy.

**Architecture:** New pnpm workspace app at `apps/lucia-energy` (auto-discovered by `apps/*` glob), distinct from `apps/web`. Own `src/index.css` token system (industrial deep teal `#0F766E` accent, JetBrains Mono numerals, sharper radii). React Router v6 single-route page composed of 12 sectioned components plus shared Topbar/Footer. Cross-app navigation via env-driven URL constants (`VITE_LUCIA_ENERGY_URL` in apps/web; `VITE_LUCIA_INVEST_URL` in apps/lucia-energy). Inquiry form uses additive `LuciaEnergyInquirySchema` Zod schema in `packages/contracts` with a 3-tier submission fallback (POST → console.info → mailto:).

**Tech Stack:** Vite 5 + React 18 + TypeScript (strict, `noUncheckedIndexedAccess`), React Router v6, TanStack Query (inquiry state only), Zod 3, Vitest + @testing-library/react, Pretendard (KR) + JetBrains Mono (numerals).

**Spec reference:** `docs/superpowers/specs/2026-05-06-lucia-energy-landing-design.md` (mirrored to `.omc/specs/deep-interview-lucia-energy.md` for autopilot).

**Build environment:** Windows + Korean repo path. **All `pnpm` commands run via `./sync-to-build-mirror.sh exec pnpm <args>`** — never directly from this directory. The mirror lives at `C:/Users/Nam/lucia-build` (configurable via `LUCIA_BUILD_MIRROR`).

---

## File map

**Created:**
- `apps/lucia-energy/package.json`
- `apps/lucia-energy/tsconfig.json`
- `apps/lucia-energy/tsconfig.node.json`
- `apps/lucia-energy/vite.config.ts`
- `apps/lucia-energy/index.html`
- `apps/lucia-energy/.env.example`
- `apps/lucia-energy/src/main.tsx`
- `apps/lucia-energy/src/App.tsx`
- `apps/lucia-energy/src/index.css`
- `apps/lucia-energy/src/vite-env.d.ts`
- `apps/lucia-energy/src/copy.ts`
- `apps/lucia-energy/src/components/Topbar.tsx`
- `apps/lucia-energy/src/components/Footer.tsx`
- `apps/lucia-energy/src/components/PersonaTagChips.tsx`
- `apps/lucia-energy/src/sections/Hero.tsx`
- `apps/lucia-energy/src/sections/AutomationMatrix.tsx`
- `apps/lucia-energy/src/sections/MultiAssetDER.tsx`
- `apps/lucia-energy/src/sections/BlockchainSettlement.tsx`
- `apps/lucia-energy/src/sections/PublicCitizen.tsx`
- `apps/lucia-energy/src/sections/StandardsStrip.tsx`
- `apps/lucia-energy/src/sections/Roadmap.tsx`
- `apps/lucia-energy/src/sections/ComparisonMatrix.tsx`
- `apps/lucia-energy/src/sections/SecurityCertifications.tsx`
- `apps/lucia-energy/src/sections/InquirySplit.tsx`
- `apps/lucia-energy/src/lib/inquiryApi.ts`
- `apps/lucia-energy/CLAUDE.md`
- `apps/lucia-energy/tests/setup.ts`
- `apps/lucia-energy/tests/lib/inquiryApi.test.ts`
- `apps/lucia-energy/tests/components/PersonaTagChips.test.tsx`
- `apps/lucia-energy/tests/sections/InquirySplit.test.tsx`
- `apps/lucia-energy/tests/sections/Hero.test.tsx`
- `apps/lucia-energy/tests/App.test.tsx`
- `packages/contracts/src/lucia-energy/inquiry.ts`
- `packages/contracts/src/lucia-energy/index.ts`
- `packages/contracts/fixtures/lucia-energy/inquiry-fixture.ts`
- `packages/contracts/fixtures/lucia-energy/index.ts`
- `packages/contracts/tests/lucia-energy/inquiry.test.ts`

**Modified:**
- `sync-to-build-mirror.sh` — extend `PATHS` array
- `apps/web/src/routes/Invest/LandingHeader.tsx` — replace state-toggle tabs with env-URL `<a>` cross-links
- `apps/web/.env.example` — add `VITE_LUCIA_ENERGY_URL`
- `packages/contracts/src/index.ts` — re-export new `lucia-energy` namespace (additive)
- `packages/contracts/fixtures/index.ts` — re-export new fixtures (additive)
- `docs/superpowers/specs/2026-05-06-lucia-energy-landing-design.md` — none (already authored)

**Pre-existing TS errors out of scope:** `apps/web/src/routes/Portfolio.tsx` and `apps/web/src/routes/ResidentPortalSubpages.tsx` have type drift between mock data and Zod schemas (16 errors). They predate this work and are not in scope.

---

## Wave 0 — Persist FRD copy

### Task 0.1: Copy LuciaEnergy FRD into the repo

**Files:**
- Create: `docs/frd/FRD-LuciaEnergy-v1.0.md`

- [ ] **Step 1: Create the FRD file from the conversation upload**

The full FRD content was provided in the brainstorming session. Author the file with the exact uploaded markdown body (sections 0–13 of "발전소 차별화 강화된 기능요구사항정의서") preserving the table layouts and Korean copy. The file is large (~1,500 lines); the implementation worker should paste verbatim from the conversation handoff document.

- [ ] **Step 2: Verify the file exists and is non-empty**

Run: `wc -l docs/frd/FRD-LuciaEnergy-v1.0.md`
Expected: line count > 100 (real FRD content)

- [ ] **Step 3: Commit**

```bash
git add docs/frd/FRD-LuciaEnergy-v1.0.md
git commit -m "docs(frd): persist FRD-LuciaEnergy v1.0 — 발전소 차별화 강화 분산에너지 통합관리 플랫폼"
```

---

## Wave 1 — Plumbing: app scaffold

### Task 1.1: Create `apps/lucia-energy/package.json`

**Files:**
- Create: `apps/lucia-energy/package.json`

- [ ] **Step 1: Author package.json mirroring `apps/web` patterns**

```json
{
  "name": "@lucia/energy",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3002",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 3002",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --max-warnings=0",
    "test": "vitest run"
  },
  "dependencies": {
    "@lucia/contracts": "workspace:*",
    "@tanstack/react-query": "^5.56.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "jsdom": "^25.0.1",
    "typescript": "^5.6.2",
    "vite": "^5.4.8",
    "vitest": "^2.1.1"
  }
}
```

### Task 1.2: Create TypeScript configs

**Files:**
- Create: `apps/lucia-energy/tsconfig.json`
- Create: `apps/lucia-energy/tsconfig.node.json`

- [ ] **Step 1: Author tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "outDir": "dist",
    "noEmit": false
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "../../packages/contracts" }
  ]
}
```

- [ ] **Step 2: Author tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "composite": true,
    "outDir": "./dist/node",
    "tsBuildInfoFile": "./dist/.tsbuildinfo.node"
  },
  "include": ["vite.config.ts"]
}
```

### Task 1.3: Create Vite config + index.html + env example

**Files:**
- Create: `apps/lucia-energy/vite.config.ts`
- Create: `apps/lucia-energy/index.html`
- Create: `apps/lucia-energy/.env.example`

- [ ] **Step 1: Author vite.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

- [ ] **Step 2: Author index.html**

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Lucia Energy · 통합 DER 플랫폼</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Author .env.example**

```
# Cross-link back to the LH 햇빛발전소 retail-investor landing in apps/web
VITE_LUCIA_INVEST_URL=http://localhost:3001/invest

# Inquiry form submission endpoint (when backend is ready)
# Leave unset to fall back to console.info + mailto:
# VITE_INQUIRY_ENDPOINT=https://api.lucia.kr/lucia-energy/inquiry
```

### Task 1.4: Create src/main.tsx, App.tsx, vite-env.d.ts (skeleton)

**Files:**
- Create: `apps/lucia-energy/src/main.tsx`
- Create: `apps/lucia-energy/src/App.tsx`
- Create: `apps/lucia-energy/src/vite-env.d.ts`

- [ ] **Step 1: Author vite-env.d.ts**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LUCIA_INVEST_URL?: string;
  readonly VITE_INQUIRY_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 2: Author main.tsx (skeleton — providers will wrap in later waves)**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 3: Author App.tsx (placeholder until Wave 4)**

```typescript
export default function App() {
  return (
    <main style={{ padding: 32, fontFamily: 'Pretendard, system-ui, sans-serif' }}>
      <h1>Lucia Energy — scaffolding</h1>
      <p>Wave 1 placeholder. Sections wire in waves 4–8.</p>
    </main>
  );
}
```

### Task 1.5: Extend the build-mirror script

**Files:**
- Modify: `sync-to-build-mirror.sh:33-63` (the `PATHS` array)

- [ ] **Step 1: Add lucia-energy paths to PATHS array**

Insert these lines into the `PATHS` array, after the `apps/web` block and before the `apps/engine` block:

```bash
  "apps/lucia-energy/src"
  "apps/lucia-energy/tests"
  "apps/lucia-energy/index.html"
  "apps/lucia-energy/tsconfig.json"
  "apps/lucia-energy/tsconfig.node.json"
  "apps/lucia-energy/vite.config.ts"
  "apps/lucia-energy/package.json"
  "apps/lucia-energy/.env.local"
  "apps/lucia-energy/.env.example"
```

### Task 1.6: Install + verify dev server boots

- [ ] **Step 1: Sync + install**

Run: `./sync-to-build-mirror.sh exec pnpm install`
Expected: install completes; `@lucia/energy` workspace package recognized.

- [ ] **Step 2: Verify typecheck on the empty scaffold**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy typecheck`
Expected: `tsc --noEmit` returns 0 with no errors (file is just a skeleton).

- [ ] **Step 3: Commit Wave 1**

```bash
git add apps/lucia-energy sync-to-build-mirror.sh
git commit -m "feat(lucia-energy): FR-LE-001 scaffold apps/lucia-energy (Vite+React+TS, port 3002)"
```

---

## Wave 2 — Design tokens + shell

### Task 2.1: Author `src/index.css` with LuciaEnergy token block

**Files:**
- Create: `apps/lucia-energy/src/index.css`

- [ ] **Step 1: Write the index.css verbatim from spec §4.1**

```css
:root {
  /* Surface */
  --bg: #FAFAFA;
  --bg-elevated: #FFFFFF;
  --ink: #0A0A0A;
  --ink-2: rgba(10,10,10,0.72);
  --ink-3: rgba(10,10,10,0.48);
  --line: #E5E5E5;
  --line-soft: #F0F0F0;

  /* Brand */
  --accent: #0F766E;
  --accent-ink: #0D5A52;
  --accent-soft: rgba(15,118,110,0.08);

  /* Topbar */
  --bar: #000000;
  --bar-ink: #FFFFFF;
  --bar-ink-2: rgba(255,255,255,0.72);
  --bar-line: rgba(255,255,255,0.10);

  /* Status */
  --positive: #0F766E;
  --warn: #B45309;
  --alert: #B91C1C;

  /* Radii */
  --r-sm: 2px;
  --r-md: 4px;
  --r-lg: 6px;
  --r-modal: 12px;

  /* Type */
  --display: 'Pretendard', system-ui, sans-serif;
  --num: 'JetBrains Mono', ui-monospace, monospace;

  /* Hero scale */
  --hero-display: clamp(48px, 6vw, 88px);
  --kpi-display: clamp(40px, 5vw, 72px);
}

* { box-sizing: border-box; }
html, body, #root { margin: 0; padding: 0; min-height: 100%; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--display);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
button { font-family: inherit; }
a { color: inherit; text-decoration: none; }

.num { font-family: var(--num); font-variant-numeric: tabular-nums; }
.overline {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--line-soft);
  border-radius: var(--r-md);
}
.card-pad { padding: 24px; }

/* Visibility helpers shared with apps/web LandingHeader pattern */
.show-md\+ { display: none; }
.show-mobile { display: inline-flex; }
@media (min-width: 768px) {
  .show-md\+ { display: inline-flex; }
  .show-mobile { display: none; }
}
```

### Task 2.2: Author `src/copy.ts` skeleton

**Files:**
- Create: `apps/lucia-energy/src/copy.ts`

- [ ] **Step 1: Establish the copy module structure**

```typescript
// apps/lucia-energy/src/copy.ts
// All Korean copy for the LuciaEnergy landing. Korean-only per spec Q4.
// i18n-safe structure: an _EN sibling can be added later without refactor.

export const NAV = {
  brand: 'Lucia · Energy',
  tabLh: 'LH 햇빛발전소',
  tabEnergy: 'LuciaEnergy',
  ctaInquiry: '사업 문의',
} as const;

export const HERO = {
  overline: 'LUCIA ENERGY · 통합 DER 플랫폼',
  headlineLine1: '사람 손 없이도,',
  headlineLine2: '발전소는 멈추지 않습니다.',
  sub:
    'AI가 24시간 자동 수행하는 8개 운영 영역 — 발전량 예측·이상 탐지·매전 입찰·정산까지.',
  ctaPrimary: '사업 문의하기',
  ctaSecondary: '차별화 살펴보기',
} as const;

export const AUTOMATION_MATRIX = {
  heading: 'AI가 자동 수행하는 8개 운영 영역',
  cells: [
    { label: '발전량 예측', desc: '기상 데이터 기반 단기·중기·장기 예측 (15분~12개월)' },
    { label: '이상 탐지',   desc: '모듈·스트링·인버터 단위 I-V 곡선 + 패턴 기반 자동 진단' },
    { label: '운영 워크오더', desc: '진단 결과 → 우선순위 자동 작성·배분' },
    { label: '매전 입찰',   desc: '전일·실시간·예비력 시장 96회 시나리오 입찰' },
    { label: '정산 자동화', desc: 'SMP·REC·CP·예측정산금·CON/COFF 자동 계산' },
    { label: '탄소크레딧', desc: 'Lucia 연동 발행·소각·온체인 거래' },
    { label: '햇빛연금 분배', desc: '주민조합 배당 자동 계산·증빙·원천징수' },
    { label: '보안 모니터링', desc: 'ISMS-P 통제 모니터링·이상행위 탐지' },
  ],
} as const;

export const MULTI_ASSET = {
  heading: '한 화면에서, 6대 자산을 한 정산 단위로',
  sub: 'PV에 국한된 단일자산 솔루션을 넘어, ESS·EV·히트펌프·소수력·연료전지까지 통합 운영합니다.',
  relevantPersonas: ['발전사업자', '자산관리자·EPC', '중개사업자'] as const,
  assets: [
    { label: 'PV (태양광)',  unit: 'MW',   standards: 'SunSpec Modbus · IEC 61850-7-420' },
    { label: 'ESS (저장)',  unit: 'MWh',  standards: 'IEC 61850-7-420 · DNP3' },
    { label: 'EV 충전기',   unit: '기',   standards: 'OCPP 1.6 / 2.0.1' },
    { label: '히트펌프',    unit: 'kW',   standards: 'BACnet · MQTT 5.0' },
    { label: '소수력',     unit: 'kW',   standards: 'IEC 61850-7-420' },
    { label: '연료전지',   unit: 'kW',   standards: 'IEC 61850-7-420 · DNP3' },
  ],
} as const;

export const BLOCKCHAIN = {
  heading: '발전소가 블록체인 위에서 정산됩니다',
  sub: 'SMP·REC·햇빛연금·자발적 탄소크레딧을 Lucia(TON 기반) 위에서 자동 토큰화·분배합니다.',
  relevantPersonas: ['발전사업자', '기업 RE100', '주민조합원'] as const,
  bullets: [
    'CxNFT — 톤(tCO₂eq) 단위 자발적 탄소크레딧 자동 발행·소각',
    '햇빛연금 — 주민조합 배당 권리를 토큰화해 자동 분배',
    'MRV 자동화 — IoT 센서→해시 인덱싱(ISO 14064-2 / Verra VM0007 호환 설계)',
    'LEO Wallet 연동 — KYC Level 2+ 사용자만 거래·보유',
  ],
} as const;

export const PUBLIC_CITIZEN = {
  heading: '공공이 도입할 수 있는, 시민이 참여하는 플랫폼',
  sub: '영광군 햇빛연금부터 정부 5,500억원·500개소 확대 계획까지, 시민·공공 친화 기능을 표준 탑재합니다.',
  relevantPersonas: ['공공발주처', '주민조합원', '발전사업자'] as const,
  pillars: [
    {
      title: '햇빛연금 자동분배',
      body: '영광군 2024년 82억원 분배 모델을 표준 모듈로. 정부 5,500억원·500개소 확대 계획(2030, 2025.11.16 국무회의 보고)에 즉시 대응.',
    },
    {
      title: 'ISMS-P · CSAP-Hi · 망분리',
      body: 'ISMS-P 101개 통제 기준 충족, 공공 발주 대비 CSAP 표준등급/상등급(Hi) 옵션, 사무망/인터넷망 분리 옵션.',
    },
    {
      title: '누리장터 즉시 등재',
      body: 'KONEPS(나라장터) BEMS 통합사건대장 등재 준비 완료. 지자체 채택 즉시 발주 가능.',
    },
  ],
} as const;

export const STANDARDS = {
  heading: '국제·국내 표준 호환',
  items: [
    'SunSpec Modbus',
    'IEC 61850-7-420',
    'DNP3',
    'OCPP 1.6 / 2.0.1',
    'MQTT 5.0',
    'KPX e-Power Market API',
  ] as const,
  relevantPersonas: ['발전사업자', '자산관리자·EPC'] as const,
} as const;

export const ROADMAP = {
  heading: '단계별 구축 로드맵',
  phases: [
    { phase: 'Phase 0',  period: '2026.06~08', focus: '프리스탠더',          kpi: '내부 PoC' },
    { phase: 'Phase 1',  period: '2026.09~2027.03', focus: 'MVP — 모니터링·예측·O&M·정산', kpi: '1,000개소 · 0.3 GW' },
    { phase: 'Phase 2',  period: '2027.04~2027.10', focus: 'VPP·입찰',          kpi: 'KPX 등록·운영' },
    { phase: 'Phase 3',  period: '2027.11~2028.04', focus: 'Lucia 블록체인 연동', kpi: 'CxNFT · 햇빛연금 자동분배' },
    { phase: 'Phase 4',  period: '2028.05~2028.12', focus: '공공·다중자산',       kpi: '30,000개소 · 5 GW · 500억 ARR' },
    { phase: 'Phase 5',  period: '2029~',           focus: '글로벌',           kpi: '60,000개소 · 12 GW · 1,500억 ARR' },
  ],
  asteriskNote: '* Phase 1 이후 KPI는 목표치이며, 실제 달성치는 분기별로 갱신 공시합니다.',
} as const;

export const COMPARISON = {
  heading: '기존 단일자산 솔루션 vs LuciaEnergy 차세대 통합 플랫폼',
  rows: [
    { dim: '자산 종류',     legacy: 'PV 단일',                next: 'PV · ESS · EV · 히트펌프 · 소수력 · 연료전지' },
    { dim: 'AI 엔진',      legacy: '평균·이상 비교 + 통계',     next: 'AI 자동화 — 8개 운영 영역 동시 수행' },
    { dim: '예측 모델',    legacy: '단일 알고리즘',           next: '앙상블(통계+ML+물리기반)' },
    { dim: '이상 탐지',    legacy: '임계치 기반',             next: '모듈/스트링 I-V 곡선 + Edge AI' },
    { dim: '결제·정산',    legacy: 'SMP/REC 조회',            next: 'Lucia 온체인 정산 · CxNFT 토큰화 · 스마트 컨트랙트 자동집행' },
    { dim: 'VPP 참여',     legacy: '연동 단계',                next: '입찰 · 실시간 시장 · 예비력 · DR Plus 통합' },
    { dim: '시민참여',     legacy: '미지원',                   next: '햇빛연금 자동배당 · 주민조합 거버넌스 토큰' },
    { dim: '공공 적합성', legacy: '민간 SaaS',                next: 'ISMS-P · CSAP-Hi · 망분리 · 온프레미스 옵션' },
  ],
} as const;

export const SECURITY = {
  heading: '보안·인증',
  items: [
    { name: 'ISMS-P',         desc: '101개 통제 기준 충족 — 관리체계·보호대책·개인정보 처리단계' },
    { name: 'CSAP (Hi)',     desc: '공공 발주 대비 클라우드보안인증 표준/상등급 옵션' },
    { name: 'IEC 62443',      desc: 'OT 운영기술 보안 (산업용 제어시스템)' },
    { name: 'IEC 62351',      desc: '전력시스템 사이버보안' },
    { name: '망분리',           desc: '사무망/인터넷망 분리 + 일방향 데이터 전송(Diode) 옵션' },
    { name: 'EU CRA',          desc: 'Cyber Resilience Act 대응 게이트웨이' },
  ] as const,
} as const;

export const INQUIRY = {
  heading: '지금 사업 문의를 시작하세요',
  buyer: {
    title: '전기구매자 문의',
    sub: '검증된 햇빛 전기, 자동 정산으로. RE100 가입·직접 PPA·REC 매입 라우팅.',
    defaultPersona: 'corporate_re100' as const,
  },
  generator: {
    title: '발전사업자 문의',
    sub: '옥상이 매출이 됩니다. 운영은 AI에게. 운영 위탁·자산 매각·다중자산 통합.',
    defaultPersona: 'generator' as const,
  },
  fields: {
    company: '회사명',
    contact: '담당자',
    email: '이메일',
    phone: '전화',
    persona: '구분',
    interests: '관심분야 (복수선택 가능)',
    message: '자유 메시지 (선택)',
    consent: '개인정보 처리에 동의합니다.',
    submit: '문의 접수',
    success: '문의가 접수되었습니다. ops@lucia.kr 또는 전화로 별도 회신드립니다.',
    fallbackMailto: 'mailto:hello@lucia.kr?subject=LuciaEnergy 문의',
  },
  personaLabels: {
    generator: '발전사업자',
    asset_manager: '자산관리자·EPC',
    resident: '주민조합원·아파트 입주자',
    broker: '중개사업자',
    public_procurer: '공공발주처',
    corporate_re100: '기업 RE100',
    other: '기타',
  } as const,
  interestLabels: {
    rec_purchase: 'REC 매입',
    ppa: 'PPA 체결',
    operations_outsource: '발전소 운영 위탁',
    asset_sale: '자산 매각·M&A',
    haetbit_pension: '햇빛연금',
    public_procurement: '공공발주',
    multi_asset: '다중자산 통합 운영',
    other: '기타',
  } as const,
} as const;

export const FOOTER = {
  copyright: '© 2026 Lucia. 본 페이지는 사업 소개용이며 투자 권유가 아닙니다.',
} as const;
```

### Task 2.3: Implement `Topbar.tsx`

**Files:**
- Create: `apps/lucia-energy/src/components/Topbar.tsx`

- [ ] **Step 1: Implement Topbar with cross-link tabs and CTA pill**

```typescript
// apps/lucia-energy/src/components/Topbar.tsx
// Black bar with cross-link tabs back to LH 햇빛발전소 + LuciaEnergy active.
// `사업 문의` pill on the right-hand side.

import { NAV } from '../copy';

interface TopbarProps {
  onInquiryClick: () => void;
}

export function Topbar({ onInquiryClick }: TopbarProps) {
  const investUrl = import.meta.env.VITE_LUCIA_INVEST_URL ?? '/invest';

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--bar)',
        color: 'var(--bar-ink)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
      }}
    >
      <a
        href="/"
        aria-label="Lucia Energy"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--bar-ink)',
          flexShrink: 0,
        }}
      >
        <svg width={20} height={20} viewBox="0 0 20 20" aria-hidden>
          <path d="M2 16 L10 4 L18 16 Z" fill="#FFFFFF" />
        </svg>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
          {NAV.brand}
        </span>
      </a>

      <div
        role="tablist"
        aria-label="사이트 선택"
        className="show-md+"
        style={{
          marginLeft: 32,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          padding: 2,
          borderRadius: 6,
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        <a
          href={investUrl}
          role="tab"
          aria-selected={false}
          style={tabStyle(false)}
        >
          {NAV.tabLh}
        </a>
        <a
          href="/"
          role="tab"
          aria-selected
          style={tabStyle(true)}
        >
          {NAV.tabEnergy}
        </a>
      </div>

      <div style={{ marginLeft: 'auto' }}>
        <button
          type="button"
          onClick={onInquiryClick}
          style={{
            background: 'var(--accent)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: 'var(--r-md)',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '-0.005em',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {NAV.ctaInquiry}
        </button>
      </div>
    </header>
  );
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    padding: '5px 10px',
    fontSize: 12.5,
    fontWeight: active ? 600 : 400,
    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.72)',
    letterSpacing: '-0.01em',
    borderRadius: 4,
    background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  };
}
```

### Task 2.4: Implement `Footer.tsx`

**Files:**
- Create: `apps/lucia-energy/src/components/Footer.tsx`

- [ ] **Step 1: Implement Footer**

```typescript
// apps/lucia-energy/src/components/Footer.tsx
import { FOOTER } from '../copy';

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bar)',
        color: 'var(--bar-ink-2)',
        padding: '32px 24px',
        marginTop: 96,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', fontSize: 13 }}>
        {FOOTER.copyright}
      </div>
    </footer>
  );
}
```

### Task 2.5: Wire Topbar + Footer into App.tsx

**Files:**
- Modify: `apps/lucia-energy/src/App.tsx`

- [ ] **Step 1: Replace placeholder App.tsx with Topbar+Footer wiring**

```typescript
// apps/lucia-energy/src/App.tsx
import { useRef } from 'react';

import { Footer } from './components/Footer';
import { Topbar } from './components/Topbar';

export default function App() {
  const inquiryRef = useRef<HTMLDivElement | null>(null);
  const scrollToInquiry = () => inquiryRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <Topbar onInquiryClick={scrollToInquiry} />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: 240 }} />
        <p>Wave 2 placeholder. Sections wire in waves 4–8.</p>
        <div ref={inquiryRef} />
      </main>
      <Footer />
    </>
  );
}
```

### Task 2.6: Author tests/setup.ts and a smoke test for App

**Files:**
- Create: `apps/lucia-energy/tests/setup.ts`
- Create: `apps/lucia-energy/tests/App.test.tsx`

- [ ] **Step 1: Author setup.ts**

```typescript
// apps/lucia-energy/tests/setup.ts
import '@testing-library/jest-dom/vitest';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

- [ ] **Step 2: Author App.test.tsx — smoke test**

```typescript
// apps/lucia-energy/tests/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from '../src/App';

describe('App', () => {
  it('renders the LuciaEnergy brand in the topbar', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByText('Lucia · Energy')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the smoke test**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test`
Expected: PASS

- [ ] **Step 4: Commit Wave 2**

```bash
git add apps/lucia-energy
git commit -m "feat(lucia-energy): FR-LE-002 design tokens + Topbar/Footer shell"
```

---

## Wave 3 — Contracts: inquiry schema + fixture

### Task 3.1: Author `packages/contracts/src/lucia-energy/inquiry.ts`

**Files:**
- Create: `packages/contracts/src/lucia-energy/inquiry.ts`
- Create: `packages/contracts/src/lucia-energy/index.ts`

- [ ] **Step 1: Author inquiry.ts (Zod schema + types)**

```typescript
// packages/contracts/src/lucia-energy/inquiry.ts
// FR-LE-INQ — LuciaEnergy public inquiry form schema.
// Additive-only per Coherence Guard 2.

import { z } from 'zod';

export const PersonaEnum = z.enum([
  'generator',
  'asset_manager',
  'resident',
  'broker',
  'public_procurer',
  'corporate_re100',
  'other',
]);
export type Persona = z.infer<typeof PersonaEnum>;

export const InterestEnum = z.enum([
  'rec_purchase',
  'ppa',
  'operations_outsource',
  'asset_sale',
  'haetbit_pension',
  'public_procurement',
  'multi_asset',
  'other',
]);
export type Interest = z.infer<typeof InterestEnum>;

export const LuciaEnergyInquirySchema = z.object({
  company: z.string().min(1).max(200),
  contact_name: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(8).max(40),
  persona: PersonaEnum,
  interests: z.array(InterestEnum).min(1),
  message: z.string().max(2000).optional(),
  consent_pii: z.literal(true),
  source_url: z.string().url().optional(),
});

export type LuciaEnergyInquiry = z.infer<typeof LuciaEnergyInquirySchema>;
```

- [ ] **Step 2: Author the namespace index.ts**

```typescript
// packages/contracts/src/lucia-energy/index.ts
export * from './inquiry.js';
```

### Task 3.2: Re-export from package root

**Files:**
- Modify: `packages/contracts/src/index.ts`

- [ ] **Step 1: Add the re-export**

Append to `packages/contracts/src/index.ts`:

```typescript
export * as LuciaEnergy from './lucia-energy/index.js';
```

(Namespaced re-export keeps inquiry symbols collision-free.)

### Task 3.3: Author the fixture

**Files:**
- Create: `packages/contracts/fixtures/lucia-energy/inquiry-fixture.ts`
- Create: `packages/contracts/fixtures/lucia-energy/index.ts`

- [ ] **Step 1: Author inquiry-fixture.ts**

```typescript
// packages/contracts/fixtures/lucia-energy/inquiry-fixture.ts
import { LuciaEnergyInquirySchema, type LuciaEnergyInquiry } from '../../src/lucia-energy/inquiry.js';

export const inquiryFixture: LuciaEnergyInquiry = LuciaEnergyInquirySchema.parse({
  company: '주식회사 빛나는옥상',
  contact_name: '홍길동',
  email: 'inquiry@example.kr',
  phone: '02-1234-5678',
  persona: 'generator',
  interests: ['operations_outsource', 'multi_asset'],
  message: '서울시 강남구 옥상 4동(합계 약 1,200평) 통합 운영 위탁 가능 여부 문의드립니다.',
  consent_pii: true,
});
```

- [ ] **Step 2: Author the namespace index.ts**

```typescript
// packages/contracts/fixtures/lucia-energy/index.ts
export * from './inquiry-fixture.js';
```

### Task 3.4: Add a Zod-schema test

**Files:**
- Create: `packages/contracts/tests/lucia-energy/inquiry.test.ts`

- [ ] **Step 1: Write a failing test for the schema**

```typescript
// packages/contracts/tests/lucia-energy/inquiry.test.ts
import { describe, expect, it } from 'vitest';

import { LuciaEnergyInquirySchema } from '../../src/lucia-energy/inquiry.js';

describe('LuciaEnergyInquirySchema', () => {
  const base = {
    company: '주식회사 빛나는옥상',
    contact_name: '홍길동',
    email: 'inquiry@example.kr',
    phone: '02-1234-5678',
    persona: 'generator',
    interests: ['operations_outsource'],
    consent_pii: true,
  };

  it('accepts a valid payload', () => {
    expect(() => LuciaEnergyInquirySchema.parse(base)).not.toThrow();
  });

  it('rejects an empty interests array', () => {
    expect(() => LuciaEnergyInquirySchema.parse({ ...base, interests: [] })).toThrow();
  });

  it('rejects an unconsented submission', () => {
    expect(() =>
      LuciaEnergyInquirySchema.parse({ ...base, consent_pii: false }),
    ).toThrow();
  });

  it('rejects an invalid email', () => {
    expect(() =>
      LuciaEnergyInquirySchema.parse({ ...base, email: 'not-an-email' }),
    ).toThrow();
  });

  it('rejects an unknown persona', () => {
    expect(() =>
      LuciaEnergyInquirySchema.parse({ ...base, persona: 'martian' }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run the test (expect FAIL because the schema file may not be wired yet)**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/contracts test -- tests/lucia-energy/inquiry.test.ts`
Expected: file resolved; if any test fails, fix the schema to match.

- [ ] **Step 3: Verify all 5 tests pass**

Run the same command. Expected: 5 pass / 0 fail.

### Task 3.5: Wire fixture into the fixtures index + run fixture validation

**Files:**
- Modify: `packages/contracts/fixtures/index.ts` (add re-export)

- [ ] **Step 1: Append the re-export**

```typescript
export * as LuciaEnergyFixtures from './lucia-energy/index.js';
```

- [ ] **Step 2: Run the fixtures CI gate**

Run: `./sync-to-build-mirror.sh exec pnpm test:fixtures`
Expected: green — every fixture validates against its schema (Coherence Guard 3).

- [ ] **Step 3: Commit Wave 3**

```bash
git add packages/contracts
git commit -m "feat(contracts): FR-LE-INQ add LuciaEnergyInquirySchema + fixture"
```

---

## Wave 4 — Hero + Automation Matrix

### Task 4.1: Implement `Hero.tsx`

**Files:**
- Create: `apps/lucia-energy/src/sections/Hero.tsx`
- Create: `apps/lucia-energy/tests/sections/Hero.test.tsx`

- [ ] **Step 1: Implement Hero.tsx**

```typescript
// apps/lucia-energy/src/sections/Hero.tsx
import { HERO } from '../copy';

interface HeroProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

export function Hero({ onPrimaryClick, onSecondaryClick }: HeroProps) {
  return (
    <section
      aria-label="hero"
      style={{
        background: 'var(--bg)',
        padding: '80px 24px 96px',
      }}
    >
      <div className="overline" style={{ marginBottom: 16 }}>{HERO.overline}</div>
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--hero-display)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--ink)',
          lineHeight: 1.05,
        }}
      >
        {HERO.headlineLine1}
        <br />
        {HERO.headlineLine2}
      </h1>
      <p
        style={{
          marginTop: 24,
          maxWidth: 640,
          fontSize: 20,
          lineHeight: 1.5,
          color: 'var(--ink-2)',
        }}
      >
        {HERO.sub}
      </p>
      <div style={{ marginTop: 40, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onPrimaryClick}
          style={{
            background: 'var(--accent)',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: 'var(--r-md)',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {HERO.ctaPrimary}
        </button>
        <button
          type="button"
          onClick={onSecondaryClick}
          style={{
            background: 'transparent',
            color: 'var(--ink)',
            border: 'none',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {HERO.ctaSecondary} →
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Author Hero smoke test**

```typescript
// apps/lucia-energy/tests/sections/Hero.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Hero } from '../../src/sections/Hero';

describe('Hero', () => {
  it('renders the provocation headline + CTA', () => {
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    render(<Hero onPrimaryClick={onPrimary} onSecondaryClick={onSecondary} />);
    expect(screen.getByText('사람 손 없이도,')).toBeInTheDocument();
    expect(screen.getByText('발전소는 멈추지 않습니다.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('사업 문의하기'));
    expect(onPrimary).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run the test**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test -- tests/sections/Hero.test.tsx`
Expected: PASS

### Task 4.2: Implement `AutomationMatrix.tsx`

**Files:**
- Create: `apps/lucia-energy/src/sections/AutomationMatrix.tsx`

- [ ] **Step 1: Implement AutomationMatrix**

```typescript
// apps/lucia-energy/src/sections/AutomationMatrix.tsx
// 8-cell grid of AI-automated functions. NO MERIDIAN naming.
// Outcomes only — capabilities, not architecture.

import { AUTOMATION_MATRIX } from '../copy';

export function AutomationMatrix() {
  return (
    <section
      aria-labelledby="automation-heading"
      style={{ padding: '64px 24px', background: 'var(--bg-elevated)' }}
    >
      <h2
        id="automation-heading"
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}
      >
        {AUTOMATION_MATRIX.heading}
      </h2>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 1,
          background: 'var(--line-soft)',
          border: '1px solid var(--line-soft)',
          borderRadius: 'var(--r-md)',
        }}
      >
        {AUTOMATION_MATRIX.cells.map(cell => (
          <div
            key={cell.label}
            style={{
              padding: 24,
              background: 'var(--bg-elevated)',
              minHeight: 160,
            }}
          >
            <div
              aria-hidden
              style={{
                width: 24,
                height: 24,
                borderRadius: 'var(--r-sm)',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              ◆
            </div>
            <div
              style={{
                marginTop: 16,
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {cell.label}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--ink-2)',
              }}
            >
              {cell.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Task 4.3: Wire Hero + AutomationMatrix into App.tsx

**Files:**
- Modify: `apps/lucia-energy/src/App.tsx`

- [ ] **Step 1: Replace App.tsx body with Hero + AutomationMatrix**

```typescript
// apps/lucia-energy/src/App.tsx
import { useRef } from 'react';

import { Footer } from './components/Footer';
import { Topbar } from './components/Topbar';
import { AutomationMatrix } from './sections/AutomationMatrix';
import { Hero } from './sections/Hero';

export default function App() {
  const inquiryRef = useRef<HTMLDivElement | null>(null);
  const automationRef = useRef<HTMLDivElement | null>(null);
  const scrollToInquiry = () => inquiryRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToAutomation = () => automationRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <Topbar onInquiryClick={scrollToInquiry} />
      <main>
        <Hero onPrimaryClick={scrollToInquiry} onSecondaryClick={scrollToAutomation} />
        <div ref={automationRef}>
          <AutomationMatrix />
        </div>
        <div ref={inquiryRef} style={{ height: 80 }} />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Visual smoke check (manual)**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy dev`
Expected: server boots on `http://localhost:3002`. Open in browser; verify hero copy and 8-cell grid render with deep teal accents.

- [ ] **Step 3: Commit Wave 4**

```bash
git add apps/lucia-energy
git commit -m "feat(lucia-energy): FR-LE-003 hero + automation matrix (no MERIDIAN naming)"
```

---

## Wave 5 — PersonaTagChips + Multi-Asset DER + Blockchain

### Task 5.1: Implement `PersonaTagChips.tsx` with TDD

**Files:**
- Create: `apps/lucia-energy/src/components/PersonaTagChips.tsx`
- Create: `apps/lucia-energy/tests/components/PersonaTagChips.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// apps/lucia-energy/tests/components/PersonaTagChips.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PersonaTagChips } from '../../src/components/PersonaTagChips';

describe('PersonaTagChips', () => {
  it('renders interpunct-separated personas', () => {
    render(
      <PersonaTagChips
        personas={['발전사업자', '자산관리자·EPC', '공공발주처']}
        onClick={() => {}}
      />,
    );
    expect(screen.getByText('관련 페르소나:')).toBeInTheDocument();
    expect(screen.getByText('발전사업자')).toBeInTheDocument();
    expect(screen.getByText('자산관리자·EPC')).toBeInTheDocument();
    expect(screen.getByText('공공발주처')).toBeInTheDocument();
  });

  it('invokes onClick with the persona label', () => {
    const onClick = vi.fn();
    render(
      <PersonaTagChips
        personas={['발전사업자']}
        onClick={onClick}
      />,
    );
    fireEvent.click(screen.getByText('발전사업자'));
    expect(onClick).toHaveBeenCalledWith('발전사업자');
  });
});
```

- [ ] **Step 2: Run test (expect FAIL — file does not exist)**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test -- tests/components/PersonaTagChips.test.tsx`
Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement PersonaTagChips.tsx**

```typescript
// apps/lucia-energy/src/components/PersonaTagChips.tsx
interface PersonaTagChipsProps {
  personas: ReadonlyArray<string>;
  onClick: (persona: string) => void;
}

export function PersonaTagChips({ personas, onClick }: PersonaTagChipsProps) {
  return (
    <div
      style={{
        marginTop: 8,
        marginBottom: 24,
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--ink-3)',
      }}
    >
      <span>관련 페르소나: </span>
      {personas.map((p, idx) => (
        <span key={p}>
          <button
            type="button"
            onClick={() => onClick(p)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: 'inherit',
              fontWeight: 'inherit',
              color: 'var(--accent)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            {p}
          </button>
          {idx < personas.length - 1 ? ' · ' : null}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test (expect PASS)**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test -- tests/components/PersonaTagChips.test.tsx`
Expected: 2 pass / 0 fail.

### Task 5.2: Implement `MultiAssetDER.tsx`

**Files:**
- Create: `apps/lucia-energy/src/sections/MultiAssetDER.tsx`

- [ ] **Step 1: Implement section**

```typescript
// apps/lucia-energy/src/sections/MultiAssetDER.tsx
import { PersonaTagChips } from '../components/PersonaTagChips';
import { MULTI_ASSET } from '../copy';

interface MultiAssetDERProps {
  onPersonaClick: (persona: string) => void;
}

export function MultiAssetDER({ onPersonaClick }: MultiAssetDERProps) {
  return (
    <section
      aria-labelledby="multi-asset-heading"
      style={{ padding: '64px 24px', background: 'var(--bg)' }}
    >
      <h2
        id="multi-asset-heading"
        style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}
      >
        {MULTI_ASSET.heading}
      </h2>
      <PersonaTagChips
        personas={MULTI_ASSET.relevantPersonas}
        onClick={onPersonaClick}
      />
      <p style={{ maxWidth: 720, fontSize: 16, color: 'var(--ink-2)' }}>{MULTI_ASSET.sub}</p>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {MULTI_ASSET.assets.map(a => (
          <div
            key={a.label}
            className="card card-pad"
            style={{ minHeight: 140 }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{a.label}</div>
            <div className="num" style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-2)' }}>
              단위: {a.unit}
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)' }}>{a.standards}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Task 5.3: Implement `BlockchainSettlement.tsx`

**Files:**
- Create: `apps/lucia-energy/src/sections/BlockchainSettlement.tsx`

- [ ] **Step 1: Implement section**

```typescript
// apps/lucia-energy/src/sections/BlockchainSettlement.tsx
import { PersonaTagChips } from '../components/PersonaTagChips';
import { BLOCKCHAIN } from '../copy';

interface BlockchainSettlementProps {
  onPersonaClick: (persona: string) => void;
}

export function BlockchainSettlement({ onPersonaClick }: BlockchainSettlementProps) {
  return (
    <section
      aria-labelledby="blockchain-heading"
      style={{ padding: '64px 24px', background: 'var(--bg-elevated)' }}
    >
      <h2
        id="blockchain-heading"
        style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}
      >
        {BLOCKCHAIN.heading}
      </h2>
      <PersonaTagChips personas={BLOCKCHAIN.relevantPersonas} onClick={onPersonaClick} />
      <p style={{ maxWidth: 720, fontSize: 16, color: 'var(--ink-2)' }}>{BLOCKCHAIN.sub}</p>
      <ul
        style={{
          marginTop: 32,
          paddingLeft: 0,
          listStyle: 'none',
          display: 'grid',
          gap: 12,
          maxWidth: 760,
        }}
      >
        {BLOCKCHAIN.bullets.map(b => (
          <li
            key={b}
            style={{
              padding: '12px 16px',
              borderLeft: '3px solid var(--accent)',
              background: 'var(--accent-soft)',
              fontSize: 14,
              color: 'var(--ink)',
            }}
          >
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

### Task 5.4: Wire sections into App.tsx + commit

**Files:**
- Modify: `apps/lucia-energy/src/App.tsx`

- [ ] **Step 1: Add a persona-click handler that scrolls to inquiry + stashes persona via URL hash**

Update App.tsx:

```typescript
// apps/lucia-energy/src/App.tsx
import { useCallback, useRef } from 'react';

import { Footer } from './components/Footer';
import { Topbar } from './components/Topbar';
import { AutomationMatrix } from './sections/AutomationMatrix';
import { BlockchainSettlement } from './sections/BlockchainSettlement';
import { Hero } from './sections/Hero';
import { MultiAssetDER } from './sections/MultiAssetDER';

const PERSONA_LABEL_TO_KEY: Record<string, string> = {
  '발전사업자': 'generator',
  '자산관리자·EPC': 'asset_manager',
  '주민조합원': 'resident',
  '주민조합원·아파트 입주자': 'resident',
  '중개사업자': 'broker',
  '공공발주처': 'public_procurer',
  '기업 RE100': 'corporate_re100',
};

export default function App() {
  const inquiryRef = useRef<HTMLDivElement | null>(null);
  const automationRef = useRef<HTMLDivElement | null>(null);

  const scrollToInquiry = useCallback(() => {
    inquiryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  const scrollToAutomation = useCallback(() => {
    automationRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const onPersonaClick = useCallback(
    (label: string) => {
      const key = PERSONA_LABEL_TO_KEY[label] ?? 'other';
      window.history.replaceState(null, '', `#persona=${key}`);
      scrollToInquiry();
    },
    [scrollToInquiry],
  );

  return (
    <>
      <Topbar onInquiryClick={scrollToInquiry} />
      <main>
        <Hero onPrimaryClick={scrollToInquiry} onSecondaryClick={scrollToAutomation} />
        <div ref={automationRef}>
          <AutomationMatrix />
        </div>
        <MultiAssetDER onPersonaClick={onPersonaClick} />
        <BlockchainSettlement onPersonaClick={onPersonaClick} />
        <div ref={inquiryRef} style={{ height: 80 }} />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Run typecheck + tests**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy typecheck && ./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test`
Expected: typecheck green, all tests pass.

- [ ] **Step 3: Commit Wave 5**

```bash
git add apps/lucia-energy
git commit -m "feat(lucia-energy): FR-LE-004 multi-asset DER + blockchain section + persona chips"
```

---

## Wave 6 — Public/Citizen + Standards Strip + Roadmap

### Task 6.1: Implement `PublicCitizen.tsx`

**Files:**
- Create: `apps/lucia-energy/src/sections/PublicCitizen.tsx`

- [ ] **Step 1: Implement section**

```typescript
// apps/lucia-energy/src/sections/PublicCitizen.tsx
import { PersonaTagChips } from '../components/PersonaTagChips';
import { PUBLIC_CITIZEN } from '../copy';

interface PublicCitizenProps {
  onPersonaClick: (persona: string) => void;
}

export function PublicCitizen({ onPersonaClick }: PublicCitizenProps) {
  return (
    <section
      aria-labelledby="public-citizen-heading"
      style={{ padding: '64px 24px', background: 'var(--bg)' }}
    >
      <h2
        id="public-citizen-heading"
        style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}
      >
        {PUBLIC_CITIZEN.heading}
      </h2>
      <PersonaTagChips personas={PUBLIC_CITIZEN.relevantPersonas} onClick={onPersonaClick} />
      <p style={{ maxWidth: 720, fontSize: 16, color: 'var(--ink-2)' }}>{PUBLIC_CITIZEN.sub}</p>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {PUBLIC_CITIZEN.pillars.map(p => (
          <div key={p.title} className="card card-pad">
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{p.title}</div>
            <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              {p.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Task 6.2: Implement `StandardsStrip.tsx`

**Files:**
- Create: `apps/lucia-energy/src/sections/StandardsStrip.tsx`

- [ ] **Step 1: Implement section**

```typescript
// apps/lucia-energy/src/sections/StandardsStrip.tsx
import { PersonaTagChips } from '../components/PersonaTagChips';
import { STANDARDS } from '../copy';

interface StandardsStripProps {
  onPersonaClick: (persona: string) => void;
}

export function StandardsStrip({ onPersonaClick }: StandardsStripProps) {
  return (
    <section
      aria-labelledby="standards-heading"
      style={{ padding: '48px 24px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}
    >
      <h2
        id="standards-heading"
        style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}
      >
        {STANDARDS.heading}
      </h2>
      <PersonaTagChips personas={STANDARDS.relevantPersonas} onClick={onPersonaClick} />
      <div
        style={{
          marginTop: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {STANDARDS.items.map(item => (
          <span
            key={item}
            className="num"
            style={{
              padding: '6px 12px',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-sm)',
              fontSize: 12.5,
              color: 'var(--ink)',
              background: 'var(--bg)',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
```

### Task 6.3: Implement `Roadmap.tsx`

**Files:**
- Create: `apps/lucia-energy/src/sections/Roadmap.tsx`

- [ ] **Step 1: Implement horizontal-scroll roadmap**

```typescript
// apps/lucia-energy/src/sections/Roadmap.tsx
import { ROADMAP } from '../copy';

export function Roadmap() {
  return (
    <section
      aria-labelledby="roadmap-heading"
      style={{ padding: '64px 24px', background: 'var(--bg)' }}
    >
      <h2
        id="roadmap-heading"
        style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}
      >
        {ROADMAP.heading}
      </h2>
      <div
        style={{
          marginTop: 32,
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 16,
        }}
      >
        {ROADMAP.phases.map(p => (
          <div
            key={p.phase}
            className="card card-pad"
            style={{
              minWidth: 280,
              flexShrink: 0,
            }}
          >
            <div className="overline" style={{ color: 'var(--ink-3)' }}>{p.phase}</div>
            <div className="num" style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-2)' }}>{p.period}</div>
            <div
              style={{
                marginTop: 16,
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {p.focus}
            </div>
            <div
              className="num"
              style={{
                marginTop: 16,
                fontSize: 'var(--kpi-display)',
                fontWeight: 700,
                color: 'var(--accent)',
                lineHeight: 1.05,
              }}
            >
              {p.kpi}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: 'var(--ink-3)',
              }}
            >
              *목표치
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 16, fontSize: 11, color: 'var(--ink-3)' }}>{ROADMAP.asteriskNote}</p>
    </section>
  );
}
```

### Task 6.4: Wire sections + commit

**Files:**
- Modify: `apps/lucia-energy/src/App.tsx`

- [ ] **Step 1: Compose into App.tsx**

Append the three sections after BlockchainSettlement:

```typescript
import { PublicCitizen } from './sections/PublicCitizen';
import { Roadmap } from './sections/Roadmap';
import { StandardsStrip } from './sections/StandardsStrip';

// ...inside the JSX:
<PublicCitizen onPersonaClick={onPersonaClick} />
<StandardsStrip onPersonaClick={onPersonaClick} />
<Roadmap />
```

- [ ] **Step 2: Verify visually + commit**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy typecheck && ./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test`

```bash
git add apps/lucia-energy
git commit -m "feat(lucia-energy): FR-LE-005 public/citizen + standards strip + roadmap"
```

---

## Wave 7 — Comparison Matrix + Security

### Task 7.1: Implement `ComparisonMatrix.tsx`

**Files:**
- Create: `apps/lucia-energy/src/sections/ComparisonMatrix.tsx`

- [ ] **Step 1: Implement comparison table (no 발전왕 naming)**

```typescript
// apps/lucia-energy/src/sections/ComparisonMatrix.tsx
import { COMPARISON } from '../copy';

export function ComparisonMatrix() {
  return (
    <section
      aria-labelledby="comparison-heading"
      style={{ padding: '64px 24px', background: 'var(--bg-elevated)' }}
    >
      <h2
        id="comparison-heading"
        style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}
      >
        {COMPARISON.heading}
      </h2>
      <div
        style={{
          marginTop: 32,
          overflowX: 'auto',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: 720,
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid var(--line)' }}>
              <th style={cellStyle('left', 'var(--ink-3)', 600)}>비교 항목</th>
              <th style={cellStyle('left', 'var(--ink-3)', 600)}>기존 단일자산 솔루션</th>
              <th
                style={{
                  ...cellStyle('left', 'var(--accent)', 700),
                  borderTop: '3px solid var(--accent)',
                }}
              >
                LuciaEnergy
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.rows.map(row => (
              <tr key={row.dim} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                <td style={cellStyle('left', 'var(--ink)', 600)}>{row.dim}</td>
                <td style={cellStyle('left', 'var(--ink-2)', 400)}>{row.legacy}</td>
                <td style={cellStyle('left', 'var(--ink)', 500)}>{row.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function cellStyle(align: 'left' | 'right', color: string, weight: number): React.CSSProperties {
  return {
    padding: '12px 16px',
    textAlign: align,
    color,
    fontWeight: weight,
    verticalAlign: 'top',
  };
}
```

### Task 7.2: Implement `SecurityCertifications.tsx`

**Files:**
- Create: `apps/lucia-energy/src/sections/SecurityCertifications.tsx`

- [ ] **Step 1: Implement chip+description grid**

```typescript
// apps/lucia-energy/src/sections/SecurityCertifications.tsx
import { SECURITY } from '../copy';

export function SecurityCertifications() {
  return (
    <section
      aria-labelledby="security-heading"
      style={{ padding: '64px 24px', background: 'var(--bg)' }}
    >
      <h2
        id="security-heading"
        style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}
      >
        {SECURITY.heading}
      </h2>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {SECURITY.items.map(item => (
          <div key={item.name} className="card card-pad">
            <span
              className="num"
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                borderRadius: 'var(--r-sm)',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              {item.name}
            </span>
            <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Task 7.3: Wire + commit

**Files:**
- Modify: `apps/lucia-energy/src/App.tsx`

- [ ] **Step 1: Add ComparisonMatrix + SecurityCertifications between Roadmap and Inquiry**

```typescript
import { ComparisonMatrix } from './sections/ComparisonMatrix';
import { SecurityCertifications } from './sections/SecurityCertifications';

// ...inside JSX, after <Roadmap />:
<ComparisonMatrix />
<SecurityCertifications />
```

- [ ] **Step 2: Run typecheck + commit**

```bash
git add apps/lucia-energy
git commit -m "feat(lucia-energy): FR-LE-006 comparison matrix + security certifications"
```

---

## Wave 8 — Inquiry Split form

### Task 8.1: Implement `inquiryApi.ts` with TDD (3-tier fallback)

**Files:**
- Create: `apps/lucia-energy/src/lib/inquiryApi.ts`
- Create: `apps/lucia-energy/tests/lib/inquiryApi.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// apps/lucia-energy/tests/lib/inquiryApi.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { submitInquiry } from '../../src/lib/inquiryApi';

const VALID_INQUIRY = {
  company: 'Acme',
  contact_name: '홍길동',
  email: 'a@b.kr',
  phone: '02-0000-0000',
  persona: 'generator' as const,
  interests: ['operations_outsource' as const],
  consent_pii: true as const,
};

describe('submitInquiry', () => {
  let originalEndpoint: string | undefined;

  beforeEach(() => {
    originalEndpoint = import.meta.env.VITE_INQUIRY_ENDPOINT;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (import.meta.env as Record<string, string | undefined>).VITE_INQUIRY_ENDPOINT = originalEndpoint;
  });

  it('falls back to console.info when no endpoint is configured', async () => {
    (import.meta.env as Record<string, string | undefined>).VITE_INQUIRY_ENDPOINT = undefined;
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const result = await submitInquiry(VALID_INQUIRY);
    expect(result).toEqual({ ok: true, mode: 'console' });
    expect(spy).toHaveBeenCalled();
  });

  it('POSTs to the configured endpoint when set', async () => {
    (import.meta.env as Record<string, string | undefined>).VITE_INQUIRY_ENDPOINT =
      'https://api.example.kr/inquiry';
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const result = await submitInquiry(VALID_INQUIRY);
    expect(result).toEqual({ ok: true, mode: 'http' });
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.example.kr/inquiry',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns { ok: false, mode: "http", error } when fetch rejects', async () => {
    (import.meta.env as Record<string, string | undefined>).VITE_INQUIRY_ENDPOINT =
      'https://api.example.kr/inquiry';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    const result = await submitInquiry(VALID_INQUIRY);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.mode).toBe('http');
      expect(result.error).toContain('network down');
    }
  });

  it('rejects an invalid payload before submitting', async () => {
    (import.meta.env as Record<string, string | undefined>).VITE_INQUIRY_ENDPOINT = undefined;
    const result = await submitInquiry({
      ...VALID_INQUIRY,
      email: 'not-an-email',
    } as never);
    expect(result.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test (expect FAIL)**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test -- tests/lib/inquiryApi.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement inquiryApi.ts**

```typescript
// apps/lucia-energy/src/lib/inquiryApi.ts
// 3-tier fallback for inquiry submission:
//   1. POST to VITE_INQUIRY_ENDPOINT if set
//   2. console.info fallback (dev / pre-backend)
//   3. mailto: failsafe (rendered as a link by the form, not invoked here)

import {
  LuciaEnergy,
} from '@lucia/contracts';

export type SubmitInquiryResult =
  | { ok: true; mode: 'http' | 'console' }
  | { ok: false; mode: 'http' | 'validation'; error: string };

export async function submitInquiry(
  payload: unknown,
): Promise<SubmitInquiryResult> {
  const parsed = LuciaEnergy.LuciaEnergyInquirySchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, mode: 'validation', error: parsed.error.message };
  }

  const endpoint = import.meta.env.VITE_INQUIRY_ENDPOINT;
  if (!endpoint) {
    console.info('[lucia-energy] inquiry submitted (console fallback):', parsed.data);
    return { ok: true, mode: 'console' };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      return { ok: false, mode: 'http', error: `HTTP ${res.status}` };
    }
    return { ok: true, mode: 'http' };
  } catch (err) {
    return {
      ok: false,
      mode: 'http',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
```

- [ ] **Step 4: Run test (expect PASS for the 4 cases)**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test -- tests/lib/inquiryApi.test.ts`
Expected: 4 pass / 0 fail.

### Task 8.2: Implement `InquirySplit.tsx` with form

**Files:**
- Create: `apps/lucia-energy/src/sections/InquirySplit.tsx`
- Create: `apps/lucia-energy/tests/sections/InquirySplit.test.tsx`

- [ ] **Step 1: Implement the section + form**

```typescript
// apps/lucia-energy/src/sections/InquirySplit.tsx
import { useEffect, useId, useState } from 'react';

import { LuciaEnergy } from '@lucia/contracts';

import { submitInquiry } from '../lib/inquiryApi';
import { INQUIRY } from '../copy';

type Persona = LuciaEnergy.Persona;
type Interest = LuciaEnergy.Interest;

interface InquirySplitProps {
  initialPersona?: Persona;
}

export function InquirySplit({ initialPersona }: InquirySplitProps) {
  return (
    <section
      aria-labelledby="inquiry-heading"
      style={{ padding: '80px 24px', background: 'var(--bg-elevated)' }}
    >
      <h2
        id="inquiry-heading"
        style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}
      >
        {INQUIRY.heading}
      </h2>
      <div
        style={{
          marginTop: 32,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 24,
        }}
      >
        <InquiryCard
          title={INQUIRY.buyer.title}
          sub={INQUIRY.buyer.sub}
          defaultPersona={initialPersona ?? INQUIRY.buyer.defaultPersona}
        />
        <InquiryCard
          title={INQUIRY.generator.title}
          sub={INQUIRY.generator.sub}
          defaultPersona={initialPersona ?? INQUIRY.generator.defaultPersona}
        />
      </div>
    </section>
  );
}

interface InquiryCardProps {
  title: string;
  sub: string;
  defaultPersona: Persona;
}

function InquiryCard({ title, sub, defaultPersona }: InquiryCardProps) {
  const id = useId();
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [persona, setPersona] = useState<Persona>(defaultPersona);
  const [interests, setInterests] = useState<ReadonlyArray<Interest>>([]);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // honor URL hash #persona=<key>
  useEffect(() => {
    const m = window.location.hash.match(/persona=([a-z_]+)/);
    if (m && m[1]) {
      const guard = LuciaEnergy.PersonaEnum.safeParse(m[1]);
      if (guard.success) setPersona(guard.data);
    }
  }, []);

  const toggleInterest = (i: Interest) => {
    setInterests(prev => (prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const result = await submitInquiry({
      company,
      contact_name: contact,
      email,
      phone,
      persona,
      interests,
      message: message.length > 0 ? message : undefined,
      consent_pii: consent,
      source_url: window.location.href,
    });
    if (result.ok) {
      setStatus('success');
    } else {
      setStatus('error');
      setError(result.error);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="card card-pad"
      style={{ display: 'grid', gap: 12 }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{sub}</div>

      <Field id={`${id}-company`} label={INQUIRY.fields.company} required>
        <input
          id={`${id}-company`}
          type="text"
          required
          value={company}
          onChange={e => setCompany(e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field id={`${id}-contact`} label={INQUIRY.fields.contact} required>
        <input
          id={`${id}-contact`}
          type="text"
          required
          value={contact}
          onChange={e => setContact(e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field id={`${id}-email`} label={INQUIRY.fields.email} required>
        <input
          id={`${id}-email`}
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
      </Field>
      <Field id={`${id}-phone`} label={INQUIRY.fields.phone} required>
        <input
          id={`${id}-phone`}
          type="tel"
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={inputStyle}
        />
      </Field>

      <Field id={`${id}-persona`} label={INQUIRY.fields.persona} required>
        <select
          id={`${id}-persona`}
          value={persona}
          onChange={e => setPersona(e.target.value as Persona)}
          style={inputStyle}
        >
          {(Object.keys(INQUIRY.personaLabels) as ReadonlyArray<Persona>).map(k => (
            <option key={k} value={k}>{INQUIRY.personaLabels[k]}</option>
          ))}
        </select>
      </Field>

      <fieldset style={{ border: 'none', padding: 0 }}>
        <legend style={legendStyle}>{INQUIRY.fields.interests}</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(Object.keys(INQUIRY.interestLabels) as ReadonlyArray<Interest>).map(k => {
            const checked = interests.includes(k);
            return (
              <label
                key={k}
                style={{
                  ...chipStyle,
                  background: checked ? 'var(--accent-soft)' : 'transparent',
                  borderColor: checked ? 'var(--accent)' : 'var(--line)',
                  color: checked ? 'var(--accent)' : 'var(--ink-2)',
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleInterest(k)}
                  style={{ marginRight: 6 }}
                />
                {INQUIRY.interestLabels[k]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field id={`${id}-message`} label={INQUIRY.fields.message}>
        <textarea
          id={`${id}-message`}
          rows={3}
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </Field>

      <label style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', gap: 6 }}>
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
        />
        {INQUIRY.fields.consent}
      </label>

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          marginTop: 8,
          padding: '12px 16px',
          background: 'var(--accent)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 'var(--r-md)',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {status === 'sending' ? '전송 중…' : INQUIRY.fields.submit}
      </button>

      {status === 'success' && (
        <div role="status" style={{ fontSize: 13, color: 'var(--positive)' }}>
          {INQUIRY.fields.success}
        </div>
      )}
      {status === 'error' && (
        <div role="alert" style={{ fontSize: 13, color: 'var(--alert)' }}>
          전송 실패: {error}.{' '}
          <a href={INQUIRY.fields.fallbackMailto} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            메일로 보내기
          </a>
        </div>
      )}
    </form>
  );
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: 4 }}>
      <span style={legendStyle}>
        {label}
        {required ? ' *' : null}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-md)',
  fontSize: 14,
  fontFamily: 'inherit',
  color: 'var(--ink)',
  background: 'var(--bg)',
};

const legendStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--ink-3)',
};

const chipStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid',
  borderRadius: 'var(--r-sm)',
  fontSize: 12.5,
  cursor: 'pointer',
};
```

- [ ] **Step 2: Author InquirySplit smoke test**

```typescript
// apps/lucia-energy/tests/sections/InquirySplit.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InquirySplit } from '../../src/sections/InquirySplit';

describe('InquirySplit', () => {
  it('renders both sides + invokes submit on the buyer card', async () => {
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    render(<InquirySplit />);

    expect(screen.getByText('전기구매자 문의')).toBeInTheDocument();
    expect(screen.getByText('발전사업자 문의')).toBeInTheDocument();

    // fill the buyer (first) card
    const companies = screen.getAllByLabelText(/회사명/);
    fireEvent.change(companies[0]!, { target: { value: '테스트사' } });

    const contacts = screen.getAllByLabelText(/담당자/);
    fireEvent.change(contacts[0]!, { target: { value: '홍길동' } });

    const emails = screen.getAllByLabelText(/이메일/);
    fireEvent.change(emails[0]!, { target: { value: 'a@b.kr' } });

    const phones = screen.getAllByLabelText(/전화/);
    fireEvent.change(phones[0]!, { target: { value: '02-0000-0000' } });

    // pick at least one interest in the buyer card
    const recChips = screen.getAllByLabelText(/REC 매입/);
    fireEvent.click(recChips[0]!);

    // consent
    const consents = screen.getAllByLabelText(/개인정보 처리에 동의합니다/);
    fireEvent.click(consents[0]!);

    // submit (first 문의 접수 button)
    const submits = screen.getAllByRole('button', { name: /문의 접수/ });
    fireEvent.click(submits[0]!);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 3: Run tests**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test`
Expected: all tests pass.

### Task 8.3: Wire Inquiry into App.tsx + commit

**Files:**
- Modify: `apps/lucia-energy/src/App.tsx`

- [ ] **Step 1: Mount InquirySplit at the inquiry anchor**

Replace the `<div ref={inquiryRef} style={{ height: 80 }} />` with:

```typescript
<div ref={inquiryRef}>
  <InquirySplit />
</div>
```

Add `import { InquirySplit } from './sections/InquirySplit';` at the top.

- [ ] **Step 2: Run typecheck + tests + commit**

```bash
git add apps/lucia-energy
git commit -m "feat(lucia-energy): FR-LE-INQ inquiry split form + 3-tier submission fallback"
```

---

## Wave 9 — Cross-link wiring

### Task 9.1: Update `apps/web/src/routes/Invest/LandingHeader.tsx`

**Files:**
- Modify: `apps/web/src/routes/Invest/LandingHeader.tsx`

- [ ] **Step 1: Replace stateful site-tab buttons with env-URL `<a>` cross-links**

Find the existing block:

```typescript
const SITE_TABS: ReadonlyArray<{ value: 'lh' | 'lucia'; label: string }> = [
  { value: 'lh', label: 'LH햇빛발전소' },
  { value: 'lucia', label: 'LuciaEnergy' },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [siteTab, setSiteTab] = useState<'lh' | 'lucia'>('lh');
```

Replace with:

```typescript
const LUCIA_ENERGY_URL =
  import.meta.env.VITE_LUCIA_ENERGY_URL ?? 'http://localhost:3002';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
```

Then replace the existing site-tabs button group (the `role="tablist"` div containing 2 stateful buttons) with:

```typescript
<div
  role="tablist"
  aria-label="사이트 선택"
  className="show-md+"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    padding: 2,
    borderRadius: 6,
    background: 'rgba(255,255,255,0.06)',
  }}
>
  <a
    href="/invest"
    role="tab"
    aria-selected
    style={{
      padding: '5px 10px',
      fontSize: 12.5,
      fontWeight: 600,
      color: '#FFFFFF',
      letterSpacing: '-0.01em',
      borderRadius: 4,
      background: 'rgba(255,255,255,0.13)',
      whiteSpace: 'nowrap',
    }}
  >
    LH햇빛발전소
  </a>
  <a
    href={LUCIA_ENERGY_URL}
    role="tab"
    aria-selected={false}
    style={{
      padding: '5px 10px',
      fontSize: 12.5,
      fontWeight: 400,
      color: 'rgba(255,255,255,0.72)',
      letterSpacing: '-0.01em',
      borderRadius: 4,
      background: 'transparent',
      whiteSpace: 'nowrap',
    }}
  >
    LuciaEnergy
  </a>
</div>
```

The `siteTab` state and `SITE_TABS` constant disappear; the visual state is now a function of which app you're on.

### Task 9.2: Add env var to apps/web

**Files:**
- Modify: `apps/web/.env.example`

- [ ] **Step 1: Append**

```
# Cross-link to the LuciaEnergy B2B platform landing (apps/lucia-energy)
VITE_LUCIA_ENERGY_URL=http://localhost:3002
```

### Task 9.3: Verify both directions

- [ ] **Step 1: Start both apps in parallel**

Run in two terminals (or use `&` if your shell supports backgrounding well):
```bash
./sync-to-build-mirror.sh exec pnpm --filter web dev          # terminal 1 → http://localhost:3001
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy dev  # terminal 2 → http://localhost:3002
```

- [ ] **Step 2: Smoke test both directions**

  - From http://localhost:3001/invest, click `LuciaEnergy` tab in the topbar → confirm browser navigates to http://localhost:3002.
  - From http://localhost:3002/, click `LH 햇빛발전소` tab → confirm navigation to http://localhost:3001/invest.

- [ ] **Step 3: Commit Wave 9**

```bash
git add apps/web/src/routes/Invest/LandingHeader.tsx apps/web/.env.example
git commit -m "feat(web): FR-LE-007 wire LuciaEnergy cross-link via VITE_LUCIA_ENERGY_URL"
```

---

## Wave 10 — CLAUDE.md + verification

### Task 10.1: Author `apps/lucia-energy/CLAUDE.md`

**Files:**
- Create: `apps/lucia-energy/CLAUDE.md`

- [ ] **Step 1: Write per-package CLAUDE.md**

```markdown
# apps/lucia-energy — CLAUDE.md

## Purpose

`apps/lucia-energy` is the **LuciaEnergy B2B platform marketing landing**.
It is a separate app from `apps/web` (which serves the LH 햇빛발전소
retail-investor flow at `/invest`). LuciaEnergy targets the wholesale
DER ecosystem — 발전사업자, 자산관리자·EPC, 주민조합원, 중개사업자,
공공발주처, 기업 RE100 — and exists as its own bundle to keep brand,
audience, and design tokens cleanly separated.

Spec: `docs/superpowers/specs/2026-05-06-lucia-energy-landing-design.md`.
FRD: `docs/frd/FRD-LuciaEnergy-v1.0.md`.

## Tech stack

| Concern | Choice |
|---|---|
| Bundler | Vite + TypeScript |
| Framework | React 18 |
| Routing | React Router v6 (single route initially) |
| Server state | TanStack Query (inquiry submission only) |
| Styling | inline `style={{...}}` + CSS custom properties in `src/index.css` |
| Numerals | JetBrains Mono with `font-variant-numeric: tabular-nums` |
| Korean type | Pretendard |
| Validation | Zod via `@lucia/contracts` |

## Hard rules

- **No MERIDIAN naming** anywhere on the public landing — see memory file
  `meridian_internal_only.md`. Refer to AI capabilities as outcomes, not
  architecture. Specifically: do not say "MERIDIAN", "LangGraph",
  "Forecaster", "Diagnoser", "Operator", "Bidder", "Settler", "CarbonAgent",
  "CitizenAgent", "SecAgent", or "ComplianceAgent" anywhere in this app.
- **No 발전왕 naming** — generalize to "기존 단일자산 솔루션".
- **Korean-only copy.** Copy lives in `src/copy.ts` keyed by section. An
  `_EN` sibling can be added later without refactor.
- **No new state-management library** beyond React `useState` and
  TanStack Query (ADR-0005).
- **Inline `style={{...}}` + CSS variables** only. No Tailwind, no CSS
  Modules, no styled-components.
- **Build mirror is mandatory** — every `pnpm` invocation runs from
  `C:/Users/Nam/lucia-build` via `./sync-to-build-mirror.sh exec`.

## Design tokens

LuciaEnergy keeps its own tokens (no `packages/ui-tokens` extraction).
See `src/index.css`. Distinct from `apps/web`:

| Token | LuciaEnergy | apps/web |
|---|---|---|
| `--accent` | `#0F766E` (industrial deep teal) | `#10B981` (mint) |
| `--bar` | `#000000` | `#0A0C0F` |
| `--num` | JetBrains Mono | Geist Mono |
| Hero scale | `clamp(48px, 6vw, 88px)` | `clamp(48px, 6vw, 72px)` |
| Radii | `2/4/6 px` | `4/6/8 px` |

## Cross-link

`apps/web` → LuciaEnergy via `VITE_LUCIA_ENERGY_URL`
(default `http://localhost:3002` in dev).
LuciaEnergy → `apps/web/invest` via `VITE_LUCIA_INVEST_URL`
(default `http://localhost:3001/invest`).

## Inquiry submission fallback

`src/lib/inquiryApi.ts` has a 3-tier fallback:
1. `fetch(VITE_INQUIRY_ENDPOINT)` if set
2. `console.info` if not
3. `mailto:` link rendered next to the error state

When the engine endpoint `POST /api/lucia-energy/inquiry` is built,
set `VITE_INQUIRY_ENDPOINT` and the fallback unwinds without code change.

## Standard commands (from build mirror)

```bash
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy dev
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy build
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy typecheck
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy lint
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test
```
```

### Task 10.2: Full repo verification

- [ ] **Step 1: Typecheck the whole repo**

Run: `./sync-to-build-mirror.sh exec pnpm typecheck`
Expected: green. *Note:* `apps/web/src/routes/Portfolio.tsx` and `ResidentPortalSubpages.tsx` have pre-existing TS drift errors (16 errors total, unrelated to this work). Those remain out of scope.

- [ ] **Step 2: Lint the new app**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy lint`
Expected: 0 warnings.

- [ ] **Step 3: Build the new app**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy build`
Expected: green.

- [ ] **Step 4: Run all tests in the new app**

Run: `./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test`
Expected: green.

- [ ] **Step 5: Run fixture validation gate**

Run: `./sync-to-build-mirror.sh exec pnpm test:fixtures`
Expected: green.

- [ ] **Step 6: Manual visual smoke**

Open both apps; navigate cross-link in both directions; submit an inquiry on the buyer card with valid data; verify the success state. Optional: try with invalid data to confirm validation error rendering.

- [ ] **Step 7: Commit Wave 10**

```bash
git add apps/lucia-energy/CLAUDE.md
git commit -m "docs(lucia-energy): per-package CLAUDE.md + Wave 10 verification gates"
```

---

## Wave 11 — Bounded context (post-impl)

### Task 11.1: Scaffold `apps/lucia-energy/src/{domain,application,infrastructure}/`

**Files:**
- Create: `apps/lucia-energy/src/domain/.gitkeep`
- Create: `apps/lucia-energy/src/application/.gitkeep`
- Create: `apps/lucia-energy/src/infrastructure/.gitkeep`

- [ ] **Step 1: Invoke ddd context create**

Use `/ddd context create lucia-energy` if the slash command is available, or manually create the three directories with placeholder `.gitkeep` files.

- [ ] **Step 2: Commit**

```bash
git add apps/lucia-energy/src/domain apps/lucia-energy/src/application apps/lucia-energy/src/infrastructure
git commit -m "chore(lucia-energy): bounded-context skeleton (domain/application/infrastructure)"
```

---

## Self-review

**Spec coverage check** — every spec section has at least one task:

| Spec section | Implementing task |
|---|---|
| §3 Architecture (repo, stack, dev/build) | Wave 1 (1.1–1.6) |
| §3.4 Cross-link integration | Wave 9 (9.1–9.3) |
| §3.5 Bounded context | Wave 11 |
| §4.1 Design tokens | Wave 2.1 |
| §4.2 IA section list | Waves 4–8 (one section per task family) |
| §4.3 Hero composition | Wave 4.1 |
| §4.4 Automation matrix (no MERIDIAN) | Wave 4.2, copy in Wave 2.2 |
| §4.5 Persona-tag chips | Wave 5.1 |
| §4.6 Numerical claims discipline | Wave 6.3 (Roadmap renders KPIs with `*목표치` footnote + asteriskNote) |
| §4.7 Lead-capture (3-tier fallback + Zod) | Wave 8 (8.1–8.3) + Wave 3 schema |
| §4.8 Demo Mode out of scope | Acknowledged in CLAUDE.md (Wave 10.1) |
| §5 Coherence Guards 1–5 | Wave 3 (additive contracts), per-wave commits with FR-LE-XXX prefix, fixture gate in 3.5, CLAUDE.md in 10.1, tests across waves |
| §6 Deferred / out-of-scope | Backend POST endpoint deferred (covered by 3-tier fallback in 8.1) |

**Placeholder scan** — no TBD/TODO/FIXME/XXX/`add appropriate ...`/"similar to Task N" patterns. All code shown is concrete.

**Type consistency check:**
- `Persona` and `Interest` types defined in `packages/contracts/src/lucia-energy/inquiry.ts` (Task 3.1). Used downstream:
  - `apps/lucia-energy/src/lib/inquiryApi.ts` imports `LuciaEnergy.LuciaEnergyInquirySchema` (Task 8.1) — name matches.
  - `apps/lucia-energy/src/sections/InquirySplit.tsx` uses `LuciaEnergy.Persona`, `LuciaEnergy.Interest`, `LuciaEnergy.PersonaEnum` (Task 8.2) — names match.
  - `apps/lucia-energy/src/copy.ts` `INQUIRY.personaLabels` and `interestLabels` keys must equal the `PersonaEnum` and `InterestEnum` values respectively (Task 2.2). Verified — both lists match exactly.
- `submitInquiry` returns `SubmitInquiryResult` (Task 8.1). Consumed in `InquirySplit.tsx` via `result.ok` and `result.error` (Task 8.2). Discriminated-union shape verified.

**Note:** Wave 0 (Task 0.1) requires the implementation worker to paste the FRD content from the conversation upload. This is the one task that cannot have its full content embedded in this plan because the FRD is ~1,500 lines of Korean copy that lives in the prior conversation handoff. The worker should consult the conversation message starting "ë°ì ì ì°¨ë³í" (which is the FRD content shown earlier) and decode/paste verbatim. If the worker does not have access to that message, defer Wave 0 to a follow-up commit and proceed to Wave 1.
