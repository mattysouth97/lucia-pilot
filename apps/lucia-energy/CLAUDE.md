# apps/lucia-energy — CLAUDE.md

## Purpose

`apps/lucia-energy` is the **LuciaEnergy B2B platform marketing landing**.
It is a separate app from `apps/web` (which serves the LH 햇빛발전소
retail-investor flow at `/invest`). LuciaEnergy targets the wholesale DER
ecosystem — 발전사업자, 자산관리자·EPC, 주민조합원, 중개사업자, 공공발주처,
기업 RE100 — and exists as its own bundle to keep brand, audience, and design
tokens cleanly separated from the LH-anchored `/invest` story.

Spec: [docs/superpowers/specs/2026-05-06-lucia-energy-landing-design.md](../../docs/superpowers/specs/2026-05-06-lucia-energy-landing-design.md)
FRD context: FRD-LuciaEnergy v1.0 — 분산에너지 통합관리 플랫폼 (uploaded in
brainstorm conversation; persistence to `docs/frd/FRD-LuciaEnergy-v1.0.md` is a
follow-up task).

## Tech stack

| Concern | Choice |
|---|---|
| Bundler | Vite + TypeScript |
| Framework | React 18 |
| Routing | React Router v6 (single route initially) |
| Server state | TanStack Query (used by inquiry submission only) |
| Styling | inline `style={{...}}` + CSS custom properties in `src/index.css` |
| Numerals | JetBrains Mono with `font-variant-numeric: tabular-nums` |
| Korean type | Pretendard |
| Validation | Zod via `@lucia/contracts` (`LuciaEnergy.LuciaEnergyInquirySchema`) |
| Tests | Vitest + @testing-library/react |

## Hard rules

- **No MERIDIAN naming** anywhere in source files that ship to the public landing
  — see `~/.claude/projects/c--Users-Nam-Downloads----handoff/memory/meridian_internal_only.md`.
  Refer to AI capabilities as outcomes, not architecture. Specifically: do not
  emit "MERIDIAN", "LangGraph", "Forecaster", "Diagnoser", "Operator", "Bidder",
  "Settler", "CarbonAgent", "CitizenAgent", "SecAgent", or "ComplianceAgent" in
  user-visible strings.
- **No 발전왕 naming** anywhere on the public landing — body copy, headings,
  table cells, alt text, captions, footnotes. Generalize to "기존 단일자산 솔루션".
- **Korean-only copy.** All user-visible strings live in `src/copy.ts`. An
  `_EN` sibling can be added later without refactor.
- **No new state-management library** beyond React `useState` and TanStack Query
  (matches `apps/web` ADR-0005).
- **Inline `style={{...}}` + CSS variables only.** No Tailwind, CSS Modules, or
  styled-components.
- **Build mirror is mandatory.** Every `pnpm` invocation runs from
  `C:/Users/Nam/lucia-build` via `./sync-to-build-mirror.sh exec pnpm <args>`
  (Windows + Korean-path workaround — see root CLAUDE.md).

## Design tokens

LuciaEnergy keeps its own tokens — **NOT** shared with `apps/web`. See
`src/index.css`. Distinct from `apps/web`:

| Token | LuciaEnergy | apps/web |
|---|---|---|
| `--accent` | `#0F766E` (industrial deep teal) | `#10B981` (mint) |
| `--bar` (Topbar) | `#000000` | `#0A0C0F` |
| `--bg` | `#FAFAFA` (cool neutral) | `#FBFBFA` (warm neutral) |
| `--num` | JetBrains Mono | Geist Mono |
| Hero scale `--hero-display` | `clamp(48px, 6vw, 88px)` | `clamp(48px, 6vw, 72px)` |
| Radii `--r-sm/md/lg` | `2 / 4 / 6 px` | `4 / 6 / 8 px` |

## IA — 13 sections (App.tsx)

1. Topbar (cross-link tabs + 사업 문의 pill)
2. Hero (provocation-first headline + CTAs, no image)
3. AutomationMatrix (8-cell grid of AI-automated outcomes)
4. MultiAssetDER (6-asset card grid)
5. BlockchainSettlement (Lucia/TON, CxNFT, 햇빛연금)
6. PublicCitizen (영광군 햇빛연금, ISMS-P, 누리장터)
7. StandardsStrip (SunSpec/IEC/OCPP/MQTT chips)
8. Roadmap (Phase 0–5 horizontal scroll cards)
9. ComparisonMatrix (기존 단일자산 vs LuciaEnergy)
10. SecurityCertifications (ISMS-P/CSAP/IEC chips + body)
11. InquirySplit (전기구매자 / 발전사업자 form split)
12. Footer

## Cross-link

- `apps/web` (LH 햇빛발전소 / `/invest`) → LuciaEnergy via `VITE_LUCIA_ENERGY_URL`
  (default `http://localhost:3002`).
- LuciaEnergy → `apps/web/invest` via `VITE_LUCIA_INVEST_URL`
  (default `http://localhost:3001/invest`).

## Inquiry submission fallback

`src/lib/inquiryApi.ts` has a 3-tier fallback:
1. `fetch(VITE_INQUIRY_ENDPOINT)` if set
2. `console.info` if not (dev / pre-backend)
3. `mailto:hello@lucia.kr` link rendered next to the error state

When the engine endpoint `POST /api/lucia-energy/inquiry` is built, set
`VITE_INQUIRY_ENDPOINT` and the fallback unwinds without code change.

## Persona-tag chips

Section components (`MultiAssetDER`, `BlockchainSettlement`, `PublicCitizen`,
`StandardsStrip`) render a `PersonaTagChips` strip naming the relevant personas
for that section. Clicking a chip:
- Sets `window.location.hash` to `#persona=<key>`
- Smooth-scrolls to `<InquirySplit>`
- The form's `useEffect` reads the hash and pre-selects the persona dropdown

The runtime ↔ schema link is in `src/App.tsx` `PERSONA_LABEL_TO_KEY`. Persona
labels in section copy must match keys in this map; verified by static reading
(no runtime test yet).

## Standard commands (run from build mirror)

```bash
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy dev
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy build
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy typecheck
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy lint
./sync-to-build-mirror.sh exec pnpm --filter @lucia/energy test
```

Dev port: `3002`. `apps/web` stays on `3001`.

## Test conventions

- `tests/setup.ts` wires `afterEach(cleanup)` from `@testing-library/react`. Without this, RTL renders leak across tests (we hit this concretely while building).
- For env-var mocks, use `vi.stubEnv()` + `vi.unstubAllEnvs()`. Direct
  assignment to `import.meta.env` does not propagate in vitest.
- For text that contains `<br />` or other element breaks (e.g. the Hero
  headline split into two lines), use `getByRole('heading', ...)` and assert
  via `textContent` regex — RTL's `getByText` does strict equality on full
  normalized text content.
- Where a literal string appears in multiple places (e.g. `LuciaEnergy` is
  both a topbar tab and a comparison-matrix column header), disambiguate with
  `getByRole('tab', { name: ... })` instead of `getByText`.

## Deferred / out of scope

- **Backend `POST /api/lucia-energy/inquiry`** — engine team work; landing ships with mailto fallback first.
- **Bounded-context scaffold** (`/ddd context create lucia-energy`) — runs after this app is committed; minimal at MVP.
- **Persona deep-link routes** (`/lucia-energy/buyers`, `/lucia-energy/generators`) — defer until content for 5 personas justifies hub-and-spokes.
- **i18n EN sibling copy module** — Korean-only for M+3; copy file structure is i18n-safe so a `copy.en.ts` slot in cleanly later.
- **Demo Mode (FR-O-004) integration** — `/lucia-energy` is a marketing site, not a demo storyboard step. Not in M+3 scope.

## Links

- Spec: [docs/superpowers/specs/2026-05-06-lucia-energy-landing-design.md](../../docs/superpowers/specs/2026-05-06-lucia-energy-landing-design.md)
- Plan (autopilot): [.omc/plans/autopilot-impl.md](../../.omc/plans/autopilot-impl.md)
- Memory: [meridian_internal_only.md](../../../.claude/projects/c--Users-Nam-Downloads----handoff/memory/meridian_internal_only.md)
