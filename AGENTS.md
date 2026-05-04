# AGENTS.md

Durable, reusable context for agents working on this repo. Updated incrementally
from prior agent transcripts. See `CLAUDE.md` for the authoritative project
plan, FRD anchors, ADRs, and per-package conventions.

## Learned User Preferences

- Invokes the `impeccable` skill (e.g. `/impeccable …`) for design refinement passes; expects the skill's preflight gates to be honored before any file mutation.
- Design direction is committed: utilitarian, "the number is the hero" — monumental tabular numerals, restrained pure-neutral palette with a single mint `#10B981` accent, 4–6px radii, no shadows on cards, dark Topbar bar.
- Anti-references are firm: 구식 정부 포털, 네온 크립토, SaaS hero-metric template. Take the lessons from reference images (e.g. monumental balance numerals from a crypto dashboard) and reject the surface vibe.
- Keeps `PRODUCT.md` and `DESIGN.md` at the repo root, not under `.agents/context/` or `docs/` — the loader resolves them at root.
- Expects build, typecheck, and lint to all be green at the end of a task; pre-existing strict-mode TS errors surfaced by an unblocked build are in scope to fix.
- Prefers terse, action-oriented summaries with "what changed / where / why" tables over narrative prose.

## Learned Workspace Facts

- Authoritative project = the pnpm workspace under `apps/`, `packages/`, `chain/`. `untitled/` is reference-only (per root `CLAUDE.md`); do not copy its single-page prototype structure.
- `apps/web` design tokens live in `apps/web/src/index.css`. Standard tokens: `--bar`, `--bar-line`, `--ink`, `--green`, `--green-fg`, `--rose`, `--rose-fg`, `--amber-fg`, `--muted`, `--chip`, `--line-soft`, `--radius-modal`. Standard utilities: `.card`, `.card-pad`, `.display-metric`, `.kpi-metric`, `.overline`, `.modal-body`, `.grid-stats`, `.num`.
- Responsive breakpoint system across `apps/web`: `<480 / 480+ / 768+ / 1024+ / 1280+`. The right rail switches at 1280, not 1024, to avoid a pinched main column at iPad-portrait/laptop sizes.
- `BuildingLike` lives in `apps/web/src/lib/modals.tsx` and is intentionally additive-only-with-optionals until FR-M-002 backend wiring lands. Cards pass the trimmed shape; modals consume the richer prototype-extended shape (`building_id`, `city`, `district`, `installed_kw`, `inverter_count`, `lat`, `lng`) and must coalesce missing fields from the trimmed equivalents.
- `BuildingLike.status` union is `'ok' | 'warn' | 'alert' | 'maintenance'`. Card-level `STATUS_TONE` / `STATUS_LABEL` records branch on `'maintenance'` to render a neutral `점검` pill.
- `apps/web` enables `noUncheckedIndexedAccess`. Fixed positional arrays must be typed as `readonly [T, T, …]` tuples (see `SankeyCard`'s `rev` / `mid` / `dst`) or declared `as const` with derived state types via `(typeof X)[number]` (see `ReportModal`'s `Period` / `GroupId`).
- `apps/web/tsconfig.node.json` must set `composite: true` and must NOT set `noEmit: true` — `tsc -b` requires referenced projects to emit. It writes to `dist/node` with `dist/.tsbuildinfo.node`. Includes only `vite.config.ts`.
- `apps/web/src/vite-env.d.ts` provides `/// <reference types="vite/client" />` and is required to type `import.meta.env` in `lib/api.ts`, `demo/DemoController.tsx`, and `routes/AdminConsole.tsx`.
- ESLint `import/order` is strict: blank lines required between groups (external / aliased `@/` / relative). Auto-fix is the canonical resolution: `pnpm --filter web exec eslint src --fix` (use `--ext .tsx,.ts` if running the older path-style invocation).
- Standard `apps/web` commands: `pnpm --filter web build`, `pnpm --filter web typecheck`, `pnpm --filter web lint`, `pnpm --filter web dev` (port 3001). The 500KB chunk-size warning at build time is informational, not a failure.
- Settlement palette is restrained: background `#FBFBFA`, ink `#0A0C0F`, accent `#10B981` reserved for live status dot, positive delta, and primary CTA only. Topbar is a black bar with white type and a single white wedge logo (no gradient).
- Numeric typography standard: Geist Mono with `font-variant-numeric: tabular-nums` on every figure, applied via `.num` / `.display-metric` / `.kpi-metric`. Hero numerals scale fluidly via `clamp()` (e.g. `clamp(48px, 6vw, 72px)` on the `GenerationCard` daily-kWh figure).
