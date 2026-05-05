# LuciaEnergy Landing — Design Spec

**Date:** 2026-05-06
**Author:** Brainstorm session (Claude + Matt)
**Status:** Awaiting user review → writing-plans
**Related FRD:** [FRD-LuciaEnergy v1.0 — 발전왕Plus / 분산에너지 통합관리 플랫폼](#related-frd) (uploaded in conversation; to be persisted at `docs/frd/FRD-LuciaEnergy-v1.0.md` as a writing-plans Wave 0 task)
**Cross-link:** Originated from the LuciaEnergy tab added to `apps/web/src/routes/Invest/LandingHeader.tsx`

---

## 1. Context & motivation

The `/invest` landing in `apps/web` targets *retail investors* in the LH 매입임대 햇빛발전소 fleet (FRD-2026-001 anchored). LuciaEnergy is a **separate B2B product line** that markets the broader 분산에너지(DER) 통합관리 플랫폼 — what the FRD-LuciaEnergy document calls **발전왕Plus**, a successor / displacement positioning vs. Enlighten's 발전왕 (currently 7GW · ~30,000 plants · 485억 매출).

LuciaEnergy serves a different audience (B2B platform participants), so it gets:
- A **dedicated app** in the monorepo
- A **separate hero** distinct from `/invest`'s retail-investor pitch
- Its **own design tokens** (not shared with `apps/web`)
- A **cross-link** in the existing LandingHeader so users swap between LH 햇빛발전소 and LuciaEnergy

This spec covers the **public landing page** for `apps/lucia-energy`. Product-side functionality (모니터링, AI 운영, 정산, blockchain 연동, etc.) is FRD-LuciaEnergy scope and is out of scope here — the landing markets capabilities, not implements them.

---

## 2. Decisions log

Captured from the brainstorm dialogue (Q1–Q8 + Section approvals):

| # | Decision | Choice | Why |
|---|---|---|---|
| Q1 | Architecture scope | **B — separate app `apps/lucia-energy`** | Clean product separation; cleanly maps to a future `lucia-energy` bounded context |
| Q2 | Audience | **전기구매자 + 발전사업자** (commercial); FRD expanded this to 5+ personas (자산관리자·EPC, 주민조합원, 중개사업자, 공공발주처, 기업 RE100) | Two-sided wholesale platform; FRD §1.2 |
| Q3 | Hero structure | **Single hero for LuciaEnergy** (not per-persona). Persona surfacing handled below the fold. | One narrative entry point; persona detail belongs in form & section chips |
| Q4 | Language | **A — Korean-only** | Domestic Korean RE100 / 직접PPA market; LH ESG audience; reference fidelity |
| Q5 | Plumbing | Approved (env-driven cross-link URLs, dev port 3002, build-mirror PATHS extended) | Defers subdomain-vs-path-prefix ops decision |
| Q5b | Design tokens | **Different per app — NO shared `packages/ui-tokens`** | Distinct brand register; LuciaEnergy = institutional B2B vs `/invest` = retail civic |
| Q6 | Accent color | **B — industrial deep teal `#0F766E`** | Distinct from `/invest`'s mint `#10B981`; sustainability-coded without being twee; avoids 공기업 portal trap |
| Q7 | Hero lead pillar | **A — AI-First** | FRD §4.1 ① ordering signal; deepest technical moat; on.energy gravitas register |
| Q7b | MERIDIAN naming | **MUST NOT appear on any external surface** — replaced with generic "AI 자동화" framing | Not feature-complete; FRD §F flags as internal/NDA-only; saved as durable feedback memory |
| Q8 (Sec 4) | Hero copy direction | **A — Provocation-first** ("사람 손 없이도, 발전소는 멈추지 않습니다.") | Strongest narrative pull in Korean B2B; mirrors enlighten.kr/fs hook discipline |
| Q8 (Sec 5) | Persona UX | **B — Persona-tag chips on each section** (no sticky tab control) | Single content set; demo-readable; upgrade-safe to sticky tabs post-demo |
| Q8 (Sec 6) | Lead-capture | 2-column inquiry split (전기구매자 / 발전사업자); persona dropdown + 관심분야 multiselect | enlighten.kr/fs lead-capture register; matches Q2 commercial framing |
| Q8 (Sec 6) | Demo Mode (FR-O-004) | **OUT OF M+3 SCOPE** | Marketing site, not a demo storyboard step; revisit Phase 2+ |

External references that informed the design:
- **on.energy** (`https://www.on.energy/?ref=a1.gallery`) — visual register: monumental numerals, hardware-grade restraint, no animation, single-CTA-per-section
- **enlighten.kr/fs** (`https://www.enlighten.kr/fs`) — IA backbone: hero claim → mechanism → trust → repeated 문의하기 CTA; numerical asterisk-footnote discipline; Korean B2B semi-formal tone

---

## 3. Architecture

### 3.1 Repo placement
```
apps/
  engine/          existing
  web/             existing — LH 햇빛발전소 retail-investor landing at /invest
  simulator/       existing
  lucia-energy/    NEW — public B2B marketing landing
chain/             existing
packages/
  contracts/       existing — extended with LuciaEnergy inquiry Zod schema (additive, Coherence Guard 2 satisfied)
  db/              existing
  finance/         existing
```

### 3.2 Stack
- Vite + React 18 + TypeScript (matches `apps/web`)
- React Router v6 (single route initially `/`; structure ready for future deep-routes per persona post-demo)
- TanStack Query — only for inquiry submission state (no other server state needed for marketing surface)
- No state-management library beyond React `useState` (per ADR-0005)
- Pretendard (KR) + JetBrains Mono (numerals); fonts shipped same way as `apps/web`

### 3.3 Dev / build
| Concern | Setting |
|---|---|
| Dev port | `3002` (apps/web stays on `3001`) |
| Cross-link URL (apps/web → lucia-energy) | `import.meta.env.VITE_LUCIA_ENERGY_URL ?? '/lucia-energy'`; defaults to `http://localhost:3002` in dev, `https://energy.lucia.kr` placeholder in prod |
| Cross-link URL (lucia-energy → apps/web) | Symmetric `VITE_LUCIA_INVEST_URL` in `apps/lucia-energy`; defaults to `http://localhost:3001` (dev) / `https://lucia.kr/invest` (prod) |
| Build mirror | `sync-to-build-mirror.sh` PATHS array gains `apps/lucia-energy/{src,index.html,vite.config.ts,tsconfig.json,tsconfig.node.json,package.json}` |
| ESLint / Prettier | Inherits root config (`eslint.config.js`); same `import/order` strictness as `apps/web` |
| TypeScript strict | `noUncheckedIndexedAccess: true`; matches `apps/web`'s tsconfig |

### 3.4 Cross-link integration in `apps/web`
The existing site-tab toggle in `apps/web/src/routes/Invest/LandingHeader.tsx` (added earlier this session) needs three adjustments:

1. The two tabs become real `<a href={...}>` elements, not stateful buttons.
2. The `siteTab` `useState` is removed; active state is derived from current URL (`/invest` → `lh` active, `/lucia-energy` → `lucia` active — but since LuciaEnergy is a separate origin, `lucia` is never active *in apps/web*; the active state is entirely on the LuciaEnergy side when there).
3. The LuciaEnergy tab uses `VITE_LUCIA_ENERGY_URL`; the LH 햇빛발전소 tab is plain `/invest`.

Visual treatment of the tab control stays the same (dark Topbar, rgba(255,255,255,0.13) active pill).

### 3.5 Bounded context
`/ddd context create lucia-energy` runs **after** spec approval, before implementation. Creates `apps/lucia-energy/src/{domain,application,infrastructure}/` per the ruflo-ddd skill. Domain layer is small at MVP (just the `InquiryRequest` aggregate from §4.7).

---

## 4. Design

### 4.1 Design tokens (LuciaEnergy-specific)

`apps/lucia-energy/src/index.css` defines its own custom properties. No shared `packages/ui-tokens` package.

```css
:root {
  /* Surface */
  --bg: #FAFAFA;          /* cool neutral; distinct from apps/web's warm #FBFBFA */
  --bg-elevated: #FFFFFF;
  --ink: #0A0A0A;         /* pure cold black */
  --ink-2: rgba(10,10,10,0.72);
  --ink-3: rgba(10,10,10,0.48);
  --line: #E5E5E5;
  --line-soft: #F0F0F0;

  /* Brand */
  --accent: #0F766E;      /* industrial deep teal — Tailwind teal-700 */
  --accent-ink: #0D5A52;  /* hover/pressed */
  --accent-soft: rgba(15,118,110,0.08);

  /* Topbar */
  --bar: #000000;         /* pure black; sharper than apps/web's #0A0C0F */
  --bar-ink: #FFFFFF;
  --bar-ink-2: rgba(255,255,255,0.72);
  --bar-line: rgba(255,255,255,0.10);

  /* Status */
  --positive: #0F766E;
  --warn: #B45309;        /* amber-700, deeper */
  --alert: #B91C1C;       /* red-700, deeper */

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
```

Utility classes mirror `apps/web` conventions: `.card`, `.card-pad`, `.display-metric`, `.kpi-metric`, `.overline`, `.num`, `.grid-stats`. Inline `style={{...}}` continues as the styling pattern (no Tailwind, no CSS Modules — same rule as `apps/web`).

### 4.2 IA — section order

13 sections, top to bottom. Persona-tag chips (per §4.5) appear right under the heading of sections 5/6/7/8 — single content set, no sticky tab swap.

| # | Section | Content | FRD anchor |
|---|---|---|---|
| 1 | **Topbar** | Black bar; left wedge logo + `Lucia · Energy` wordmark; right cluster has 2 cross-link tabs (LH 햇빛발전소 / LuciaEnergy active); primary CTA pill `사업 문의` | shared family |
| 2 | **Hero** | Provocation-first headline + sub-copy + 2 CTAs. Pure typography, no image. | §4.1 ① |
| 3 | **자동화 영역 매트릭스** | 8-cell grid of AI-automated functions (§4.4) | §6.4 + §6.13 (no MERIDIAN) |
| 4 | **Multi-Asset DER 자산** | 6-asset card grid: PV / ESS / EV 충전기 / 히트펌프 / 소수력 / 연료전지 — each with capacity unit + 표준 호환 칩 (SunSpec / IEC 61850-7-420 / OCPP) | §4.1 ② |
| 5 | **Blockchain 정산** | Lucia (TON) 연동 — CxNFT 발행, 햇빛연금 자동분배, MRV 자동화. Lucia 명칭은 FRD §1.3 정식 정의이므로 사용 OK. | §4.1 ③ + §6.7 |
| 6 | **공공·시민 친화** | 영광군 햇빛연금 82억(2024)→정부 5,500억·500개소(2030) 인용; ISMS-P 101개 기준; 망분리 옵션; 누리장터 즉시 등재 | §4.1 ④ + §2.1.4 |
| 7 | **표준 호환 칩 스트립** | SunSpec Modbus, IEC 61850-7-420, DNP3, OCPP 1.6/2.0.1, MQTT 5.0, KPX e-Power Market API — 정렬된 칩 strip | §8 IF-002/006/007 |
| 8 | **로드맵 가로 타임라인** | Phase 0~5 가로 카드 6개. 각 카드: 단계명 / 기간 / 핵심 산출물 / KPI 수치 (예: Yr1 1,000개·0.3GW → Yr5 60,000개·12GW). 모든 KPI에 아스테리스크 + footnote. | §11 + §12 |
| 9 | **차세대 통합 플랫폼 비교 매트릭스** | 2-column 비교 표: "기존 단일자산 솔루션" vs "LuciaEnergy 차세대 통합 플랫폼". **고유명(발전왕)을 직접 명기하지 않음** — 법적 리스크 회피, 일반화 표현 사용. | §4.2 (제3자 명칭 일반화) |
| 10 | **보안·인증** | ISMS-P, CSAP-Hi, IEC 62443, IEC 62351 칩 + 1-line each | §10 |
| 11 | **Pre-footer CTA** | 2-column inquiry split: 전기구매자 문의 / 발전사업자 문의 (§4.7) | enlighten.kr/fs lead-capture |
| 12 | **Footer** | 회사 정보, 법적 고지, 자료실, 문의, copyright. /invest와 톤 매칭, copy는 LuciaEnergy 컨텍스트로 조정. | shared family |
| 13 | (Topbar `사업 문의` repeat — sticky, on scroll past hero) | Mid-page CTA reinforcement | enlighten.kr/fs 3× CTA repetition |

### 4.3 Hero composition (Provocation-first / option A)

```
[Overline] LUCIA ENERGY · 통합 DER 플랫폼
                 (13px Pretendard SemiBold, letter-spacing 0.06em uppercase, color #0F766E)

[Headline]  사람 손 없이도,
            발전소는 멈추지 않습니다.
                 (clamp(48px, 6vw, 88px) Pretendard Bold, letter-spacing -0.03em, color #0A0A0A)
                 (2-line break authored explicitly, not wrap-determined)

[Sub]       AI가 24시간 자동 수행하는 8개 운영 영역.
            발전량 예측·이상 탐지·매전 입찰·정산까지.
                 (18px mobile / 20px desktop, weight 400, color rgba(10,10,10,0.72))
                 (max-width 640px)

[CTAs]      [사업 문의하기]  차별화 살펴보기 →
                 (Primary pill: bg #0F766E, text #FFF, padding 12px 24px, radius 4px)
                 (Secondary text-only: color #0A0A0A, smooth-scroll to section 4)
```

**Hero rules:**
- No hero image. No animation. No gradient. on.energy restraint discipline applies.
- Background: solid `var(--bg)` `#FAFAFA`
- Vertical rhythm: `80px` overline-margin-top / `16px` overline→headline / `24px` headline→sub / `40px` sub→CTAs / `96px` CTAs→section 3
- No mention of MERIDIAN, LangGraph, multi-agent architecture, or any agent name. Outcomes only.
- No mention of 발전왕 by name.

### 4.4 자동화 영역 매트릭스 (Section 3)

8 cells, 4×2 grid on desktop, 2×4 on mobile. Each cell:
- Icon (24px, Lucide-style line, color `var(--accent)`)
- Label (15px Pretendard SemiBold, color `var(--ink)`)
- 1-line description (13px regular, color `var(--ink-2)`)
- No background, 1px bottom border `var(--line-soft)`, padding 24px

Cells (in order, derived from FRD §6.13 capabilities, **not** named agent labels):
1. **발전량 예측** — 기상 데이터 기반 단기·중기·장기 예측 (15분~12개월)
2. **이상 탐지** — 모듈·스트링·인버터 단위 I-V 곡선 + 패턴 기반 자동 진단
3. **운영 워크오더** — 진단 결과 → 우선순위 자동 작성·배분
4. **매전 입찰** — 전일·실시간·예비력 시장 96회 시나리오 입찰
5. **정산 자동화** — SMP·REC·CP·예측정산금·CON/COFF 자동 계산
6. **탄소크레딧** — Lucia 연동 발행·소각·온체인 거래
7. **햇빛연금 분배** — 주민조합 배당 자동 계산·증빙·원천징수
8. **보안 모니터링** — ISMS-P 통제 모니터링·이상행위 탐지

**Important:** these are *capabilities*, not *agent names*. The page never says "에이전트", "MERIDIAN", "LangGraph", "Forecaster", "Diagnoser", etc. The grid header reads `AI가 자동 수행하는 8개 운영 영역` — outcome framing only.

### 4.5 Persona-tag chips (Sections 4–8)

Right under each section heading, before the section's content body:

```
관련 페르소나: [발전사업자] · [자산관리자·EPC] · [공공발주처]
```

- Style: 13px Pretendard, weight 500, color `var(--ink-3)`
- Format: `관련 페르소나:` label + interpunct-separated persona names; each persona is a `<button>` (not a link) that scrolls to the inquiry form (§4.7) and pre-selects the persona dropdown
- No pill backgrounds, no boxes — just text. on.energy restraint.
- Persona-relevance mapping per section:

| Section | Relevant personas |
|---|---|
| 4 (Multi-Asset DER) | 발전사업자 · 자산관리자·EPC · 중개사업자 |
| 5 (Blockchain 정산) | 발전사업자 · 기업 RE100 · 주민조합원 |
| 6 (공공·시민 친화) | 공공발주처 · 주민조합원 · 발전사업자 |
| 7 (표준 호환) | 발전사업자 · 자산관리자·EPC |
| 8 (로드맵) | (no chips — global section) |

The 5+ personas: **발전사업자**, **자산관리자·EPC**, **주민조합원**, **중개사업자**, **공공발주처**, **기업 RE100**.

### 4.6 Numerical claims discipline

| Claim category | Treatment | Examples |
|---|---|---|
| **Aspirational** (FRD §12 Yr1-Yr5 KPI) | Asterisk + small footnote `*Phase X (YYYY) 목표` | `60,000개*` `12 GW*` `MAPE ≤ 2%*` |
| **Government-cited** (FRD §2.1.4) | Inline source citation | `정부 5,500억원·500개소 (2030 햇빛연금 확대 계획, 2025.11.16 국무회의 보고)` |
| **Borrowed-real** (LH 햇빛발전소 116동 베이스라인 from /invest's seed data) | No asterisk; cite as ops baseline | `LH 매입임대 운영 발전소 116동` |

- Numerical typography: `var(--num)` (JetBrains Mono) with `font-variant-numeric: tabular-nums`; mono-only for figures
- Hero numerals (none in this hero), KPI numerals in 로드맵 cards, and Phase counts get `var(--kpi-display)` `clamp(40px, 5vw, 72px)` scale
- Every number has a unit annotation (개·GW·억 원·%·MW·tCO₂eq)
- Footnote text: 11px, weight 400, color `var(--ink-3)`, line-height 1.5

### 4.7 Lead-capture

**Repetition pattern** (mirrors enlighten.kr/fs's 3× CTA repetition):
- Hero (`사업 문의하기` primary pill)
- Topbar (`사업 문의` pill, sticky on scroll past hero)
- Pre-footer Section 11 (full inquiry form, 2-column split)

**Pre-footer split form (Section 11):**

| Left column — 전기구매자 문의 | Right column — 발전사업자 문의 |
|---|---|
| Persona default: 기업 RE100 | Persona default: 발전사업자 |
| Headline: *"검증된 햇빛 전기, 자동 정산으로."* | Headline: *"옥상이 매출이 됩니다. 운영은 AI에게."* |
| Sub: RE100 가입 / 직접PPA / REC 매입 라우팅 | Sub: 발전소 운영 위탁 / 자산 매각 / 다중자산 통합 라우팅 |

**Form schema** (added to `packages/contracts` — additive, Coherence Guard 2 ✓):

```typescript
// packages/contracts/src/lucia-energy/inquiry.ts
import { z } from 'zod';

export const PersonaEnum = z.enum([
  'generator',          // 발전사업자
  'asset_manager',      // 자산관리자·EPC
  'resident',           // 주민조합원·아파트 입주자
  'broker',             // 중개사업자
  'public_procurer',    // 공공발주처
  'corporate_re100',    // 기업 RE100
  'other',
]);

export const InterestEnum = z.enum([
  'rec_purchase',       // REC 매입
  'ppa',                // PPA 체결
  'operations_outsource', // 발전소 운영 위탁
  'asset_sale',         // 자산 매각·M&A
  'haetbit_pension',    // 햇빛연금
  'public_procurement', // 공공발주
  'multi_asset',        // 다중자산 통합 운영
  'other',
]);

export const LuciaEnergyInquirySchema = z.object({
  company: z.string().min(1).max(200),
  contact_name: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(8).max(40),
  persona: PersonaEnum,
  interests: z.array(InterestEnum).min(1),
  message: z.string().max(2000).optional(),
  consent_pii: z.literal(true),  // 개인정보 처리 동의 — required true
  source_url: z.string().url().optional(),  // referrer for analytics
});

export type LuciaEnergyInquiry = z.infer<typeof LuciaEnergyInquirySchema>;
```

**Backend endpoint:** `POST /api/lucia-energy/inquiry`
- **NOT YET IMPLEMENTED.** This is a deferred backend task documented in §6 below.
- For MVP, the form submission has a 3-tier fallback:
  1. If `VITE_INQUIRY_ENDPOINT` is set, POST to that URL
  2. Else, log to `console.info` and surface a "문의가 접수되었습니다 (ops에게 별도 연락드립니다)" success state
  3. Provide a `mailto:` failsafe link below the form: `mailto:hello@lucia.kr?subject=LuciaEnergy 문의 - [회사명]`
- Fixture (per Coherence Guard 3): `packages/contracts/fixtures/lucia-energy/inquiry-fixture.ts` validates against the schema; CI runs `pnpm test:fixtures`

### 4.8 Demo Mode (FR-O-004) scope decision

- `/lucia-energy` is **OUT OF M+3 DEMO STORYBOARD SCOPE**
- The FRD-2026-001 demo storyboard (FR-O-004 / FRD §13) stays focused on `/invest`, the dashboard, and the 입주민 portal
- Post-M+3, a future demo step can navigate from `/invest/admin` → `/lucia-energy` to show the wholesale story; that is Phase 2+ enhancement
- This decision is recorded here so it is not re-litigated mid-implementation

---

## 5. Constraints & guardrails

### 5.1 Coherence Guards (CLAUDE.md §"5 rules")

| Guard | How this design satisfies it |
|---|---|
| **1. Tests pass** | Each new component will have a test in `apps/lucia-energy/tests/`; the inquiry form adds a unit test against the Zod schema |
| **2. Contracts additive-only** | `packages/contracts` gains a new `lucia-energy/inquiry.ts` module — no removals, no renames, no changes to existing exports. ✓ |
| **3. Fixtures validate** | `packages/contracts/fixtures/lucia-energy/inquiry-fixture.ts` will be added; `pnpm test:fixtures` CI validation extended |
| **4. CLAUDE.md current** | New `apps/lucia-energy/CLAUDE.md` to be authored at implementation time, mirroring `apps/web/CLAUDE.md` structure |
| **5. Commit references FR-ID** | Commits will use `feat(lucia-energy): FR-LE-XXX <short>` — FRD-LuciaEnergy is the anchor; specific FR-IDs from that FRD will be cited (§6.13 → FR-AGT, §4.1 → FR pillars) |

### 5.2 Hard rules from this conversation
- **MERIDIAN/LangGraph/named agents must not appear** anywhere on the public landing — saved to memory as durable feedback
- **발전왕 must not be named** anywhere on the public landing — body copy, comparison matrix (§9 in IA), section headings, captions, alt text, or footnotes. Generalize to "기존 단일자산 솔루션" or omit entirely.
- **Korean-only copy** — no English fallback strings, no bilingual toggle. i18n hook (`LUCIA_ENERGY_COPY_KO` constant module mirroring `apps/web/src/routes/Invest/copy.ts`) prepared so a `_EN` sibling can be added later without refactor.
- **No new state-management library** (ADR-0005)
- **Inline `style={{...}}` + CSS custom properties only** — no Tailwind, no CSS Modules, no styled-components (same as `apps/web`)
- **Build mirror is mandatory** — every `pnpm` invocation runs from `C:\Users\Nam\lucia-build` via `./sync-to-build-mirror.sh exec`

### 5.3 Anti-references (carried from `AGENTS.md`)
- 구식 정부 포털 — institutional blue (`#1E40AF`) avoided; teal `#0F766E` chosen instead
- 네온 크립토 — no glow, no animated gradient, no dark-mode-by-default
- SaaS hero-metric template — no "Trusted by [logo grid]" hero, no "10x faster" superlatives

---

## 6. Deferred / out-of-scope

These are recognized as needed but live outside this spec; each gets a callout so the writing-plans pass schedules them appropriately.

| Item | Why deferred | When |
|---|---|---|
| **Backend `POST /api/lucia-energy/inquiry`** | Engine team work; landing ships with mailto fallback first | Engine Phase 1 (FRD §11) |
| **`/ddd context create lucia-energy`** scaffolding | Per HARD-GATE — runs after spec approval, before implementation | Pre-implementation |
| **`apps/lucia-energy/CLAUDE.md`** | Authored as part of implementation, not spec | Wave 1 of impl |
| **Persona deep-link routes** (`/lucia-energy/buyers`, `/lucia-energy/generators`) | Earlier brainstorm flagged "upgrade-safe to option C" — defer until content for 5 personas exists | Post-demo, Phase 2 |
| **i18n EN sibling copy module** | Korean-only for M+3; copy file structure is i18n-safe | Phase 5 (FRD §11.5 글로벌) |
| **Sticky tab control variant of persona surfacing** | Section 5 chose chips (B); upgrade to A if content for 5 personas materializes | Post-demo |
| **Real LiveDB / Real-time generation visualization** | This is a marketing landing, not a product UI | N/A — product side |
| **Cross-link from `/invest/admin` to `/lucia-energy`** for demo storyboard | Out of M+3 scope per §4.8 | Phase 2 demo |

---

## 7. Implementation outline (writing-plans hand-off)

writing-plans will turn this into discrete tasks. Rough waves:

1. **Plumbing** — scaffold `apps/lucia-energy` (Vite + React + TS); register in `pnpm-workspace.yaml`; extend `sync-to-build-mirror.sh`; add `apps/lucia-energy/package.json` with `dev` `build` `typecheck` `lint` scripts
2. **Tokens & shell** — author `src/index.css` with the §4.1 token block; build LuciaEnergy Topbar + Footer skeleton
3. **Contracts** — add `packages/contracts/src/lucia-energy/inquiry.ts` schema + fixture; verify `pnpm test:fixtures` passes
4. **Hero + Section 3 매트릭스** — first 2 sections built end-to-end with copy
5. **Sections 4–7** — Multi-Asset DER, Blockchain 정산, 공공·시민, 표준 호환 칩 strip
6. **Sections 8–10** — 로드맵, 비교 매트릭스, 보안·인증
7. **Section 11 inquiry form** — 2-column split, persona dropdown, 관심분야 multiselect, mailto fallback, console.info handler
8. **Cross-link wiring** — update `apps/web/src/routes/Invest/LandingHeader.tsx` to use `VITE_LUCIA_ENERGY_URL`; mirror tabs in LuciaEnergy Topbar
9. **CLAUDE.md** — new `apps/lucia-energy/CLAUDE.md`
10. **Build & verify** — `pnpm typecheck`, `pnpm lint`, `pnpm build` all green via build mirror; manual smoke test of cross-link in dev
11. **Bounded context** — `/ddd context create lucia-energy` (last, after impl)

---

## 8. Open questions for user review

Pre-flight before writing-plans:
- Is the `사업 문의하기` CTA copy the right register, or do you prefer `상담 신청` / `데모 요청` / something else?
- The pre-footer headline candidates ("검증된 햇빛 전기, 자동 정산으로." / "옥상이 매출이 됩니다. 운영은 AI에게.") — keep, swap, or rewrite?
- The 비교 매트릭스 (Section 9 in IA) — is "기존 단일자산 솔루션 vs LuciaEnergy 차세대 통합 플랫폼" framing safe legally, or do you want to drop the comparison section entirely?
- Should the LuciaEnergy Topbar `사업 문의` pill be present from the top of the page (sticky), or only sticky after scroll past hero?

---

## 9. Related FRD

**FRD-LuciaEnergy v1.0 — 발전왕Plus / 분산에너지 통합관리 플랫폼**, uploaded in this conversation. Persistent storage of the FRD outside this conversation is not yet wired up; if the user wants this spec fully self-contained, copy the FRD into `docs/frd/FRD-LuciaEnergy-v1.0.md` as a sibling to FRD-2026-001.

Key sections referenced:
- §1.2 — 사용자 범위 (5+ personas)
- §2.1.4 — 햇빛연금 정책 (정부 5,500억·500개소·2030)
- §3 — 발전왕 As-Is 분석
- §4.1 — 4대 차별화 축
- §4.2 — 차별화 매트릭스
- §6.4 — 발전량 예측 AI (FR-FCS)
- §6.7 — 블록체인 기반 탄소크레딧 (FR-LCA)
- §6.13 — AI 에이전트 모듈 (FR-AGT) — **capabilities only, not named agents**
- §10 — 보안 요구사항 (ISMS-P, CSAP-Hi, IEC 62443/62351)
- §11 — 단계별 구축 계획 (Phase 0~5)
- §12 — KPI (Yr1/Yr3/Yr5)
- §F — 외부 공개 자료 부재 자산 (MERIDIAN flag — internal-only)
