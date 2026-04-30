# apps/web — CLAUDE.md

## Purpose

`apps/web` is the **Lucia KIE-REMS Lite dashboard + 입주민 portal + admin console
+ Demo Mode runner** for FRD-2026-001.  It is a React single-page application
served by Vite, deployed as a static bundle behind Nginx in the Docker Compose
stack.

FRD reference: FR-M-001..007, FR-O-003, FR-O-004, FR-S-008 (tamper UI),
FR-S-009 (audit trace UI), FR-M-008 (live tx stream).
See also ADR-0005 (state management), ADR-0006 (Demo Mode).

---

## Tech stack

| Concern | Choice | Rationale |
|---|---|---|
| Bundler | Vite + TypeScript | fast HMR; well-known; agents trained on it |
| Framework | React 18 | prototype was React; reuse component logic |
| Routing | React Router v6 | route-level code splitting; typed loaders |
| Server state | TanStack Query (react-query) | typed fetcher; cache invalidation; no Redux |
| UI state | React `useState` / `useReducer` + Context | sufficient; see ADR-0005 |
| WebSocket | `useLuciaStream` custom hook | see below |
| Styling | CSS custom properties + `src/index.css` | ported from prototype's `<style>` block |
| Fonts | Pretendard (Korean), Geist Mono, Manrope | verbatim from prototype |
| Charts | Recharts 2.x | prototype used Recharts; reuse |
| Dev fixtures | `@lucia/contracts/fixtures` | see below |

**No Redux. No Zustand.** This is explicitly prohibited per ADR-0005.  If you
find yourself reaching for a global store, use TanStack Query cache invalidation
or a React Context instead.  Open an ADR amendment if a genuine need arises.

---

## Route structure

| Route | FR ref | Description |
|---|---|---|
| `/` | FR-M-001 | Main KIE-REMS dashboard |
| `/buildings/:id` | FR-M-002 | Building detail + anomaly history |
| `/portal/:user_id` | FR-M-007 | 입주민 portal (mock token auth) |
| `/admin` | FR-O-003 | Admin console (building CRUD, anomaly inject) |
| `/demo` | FR-O-004 | Demo Mode controller |

Route-level code splitting is required — each route uses `React.lazy()` and a
`Suspense` boundary.

---

## Styling conventions

Styling tokens come from `src/index.css`, which is ported verbatim from the
prototype's `<style>` block.  The canonical CSS custom properties are:

```css
--bg, --bg2, --ink, --ink2, --green, --green2, --red, --amber,
--shadow-card, --shadow-heavy, --radius-card
```

Do not introduce Tailwind, styled-components, or CSS Modules — inline
`style={{...}}` with `src/index.css` tokens matches the prototype pattern and
is what the design specifies.  The `.card`, `.mono`, `.num`, `.pulse-dot`,
and `.flow-in` utility classes are defined in `src/index.css`.

Korean copy is intentional throughout — preserve it verbatim from the prototype
unless the user explicitly asks to change it.

---

## WebSocket — useLuciaStream

Live transaction stream (FR-M-008) is consumed via the `useLuciaStream` custom
hook (`src/hooks/useLuciaStream.ts`).  It connects to the engine WebSocket
endpoint at `/ws/transactions`, feeds incoming `TxStreamMessage` payloads into
the TanStack Query cache (invalidates the relevant query keys), and reconnects
with exponential backoff on close/error.  An off-screen circular buffer holds
the last 50 transactions.

Do not bypass this hook to access the WebSocket directly — all reconnect logic
lives there.

---

## Dev-only fixtures

During weeks 2–5 (before real engine endpoints exist), import fixtures from
`@lucia/contracts/fixtures` to drive the UI:

```typescript
import { buildingFixture } from '@lucia/contracts/fixtures';
```

Fixtures are validated against Zod schemas via `pnpm test:fixtures` in CI
(Coherence Guard 3).  Replace fixture usage with real `useQuery` calls as
engine endpoints become available (B9.1 task in the plan).  Fixtures are
**never** shipped in the production bundle.

---

## TanStack Query conventions

- All query keys live in `src/queryKeys.ts` — import from there, never inline.
- Stale time for dashboard data: 30 s (FR-M-001 polling budget).
- Mutations that touch admin-visible state must call `queryClient.invalidateQueries`
  on the relevant key after success.
- Use `suspense: true` only at the route level; card-level components use
  error boundaries locally.

---

## Demo Mode (FR-O-004 / ADR-0006)

The Demo Mode runner lives in `src/demo/`.  The storyboard is a JSON file
(`src/demo/storyboard.json`) with a typed `Step[]` array.  The `DemoController`
component reads the storyboard, sequences actions, and supports pause / resume /
jump-to-step.

Every demo-relevant action must have a corresponding backend admin endpoint
(some engine-only, accessible only via admin auth).  Do not hard-code demo state
in the frontend — actions call real backend endpoints to produce live output.

---

## Links

- ADR-0005: state management — `docs/adr/ADR-0005-frontend-state-management.md`
- ADR-0006: Demo Mode — `docs/adr/ADR-0006-demo-mode-automation.md`
- Plan Track B tasks: `.omc/plans/lucia-pilot-implementation.md` (Track B — Frontend)
- Prototype source: `untitled/project/Lucia 정산 플랫폼.html` (reference only — do not copy structure)
- FRD §13.1 storyboard: `untitled/project/uploads/TheKIE_LH_FRD.docx`
