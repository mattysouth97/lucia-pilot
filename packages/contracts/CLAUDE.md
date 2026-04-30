# packages/contracts — CLAUDE.md

## Purpose

`@lucia/contracts` is the **shared type + schema package** for the Lucia Pilot
monorepo.  It is the single source of truth for every domain shape that crosses
a package boundary: engine, web, simulator, and chain all import from here.

FRD reference: FRD-2026-001 §11.1 (Entity definitions).
See also:
- ADR-0001 (monorepo layout) — `docs/adr/ADR-0001-monorepo-pnpm-workspaces.md`
- Plan Principle 4 ("Boundaries before features") and Coherence Guard 2/3
  — `.omc/plans/lucia-pilot-implementation.md`

---

## What lives here

```
src/
  domain/          — core FRD §11.1 entity shapes (Zod schemas + TypeScript types)
  external/        — mock external API shapes (KPX, REC, LH 회계, RE100, K-ETS)
  fixtures/        — per-entity fixture objects for dev/test use
```

Every file in `src/domain/` exports:
1. A **Zod schema** (runtime validation, fixture generation)
2. A **TypeScript type** inferred from that schema (compile-time safety)

Example pattern (`building.ts`):
```typescript
export const Building = z.object({ ... });
export type Building = z.infer<typeof Building>;
```

Fixtures in `src/fixtures/` are **derived from the Zod schemas**, not
hand-authored.  They are validated in CI via `pnpm test:fixtures` (Coherence
Guard 3).

---

## Additive-only rule (Principle 4 / Coherence Guard 2)

`packages/contracts` v1 **freezes as additive-only** at the end of week 1.
After that point:

- Adding new optional fields: **allowed**.
- Adding new schemas: **allowed**.
- **Removing or renaming** any exported symbol: **NOT allowed** without an ADR
  amendment and a coordinated revision of every consuming package.
- Changing a field's type: treated as a removal + addition — requires ADR.

This rule exists because the engine and web tracks run in parallel (weeks 2–9)
and drift on contract shapes is the primary failure mode (Risk R-8).

If you are tempted to rename or remove something, open an ADR amendment instead
and wait for both tracks to coordinate before merging.

---

## Fixture validation CI gate (Coherence Guard 3)

Every fixture in `src/fixtures/` must validate against its matching Zod schema:

```bash
pnpm --filter @lucia/contracts test:fixtures
```

This gate runs on every CI push.  If a fixture fails validation, it means either:
(a) the schema changed in a breaking way — revert or amend via ADR, or
(b) the fixture is stale — update the fixture to match the new schema.

Do **not** work around fixture failures by loosening the Zod schema.

---

## Domain entities

| File | FRD ref | Key invariants |
|---|---|---|
| `building.ts` | §11.1 | `building_id` regex `ULJN-\d{3}`; `installed_kw` positive |
| `generation-event.ts` | FR-S-001 | `kwh` in `[0, 10000]`; `ts` is ISO datetime |
| `beneficiary.ts` | FR-S-004 | `SHARE_RATIO_PINNED` and `SUBSIDY_PINNED` exported as const |
| `resident.ts` | FR-M-007 | `masked_name` already masked (e.g. `홍*동`); `mock_login_token` demo-only |
| `settlement.ts` | FR-S-002..006 | `SettlementCashFlow` has 9 revenue/cost fields; `payload_hash` is 64-char hex |
| `blockchain-tx.ts` | FR-S-007 | `tx_id` + `block_height` null until chain-confirmed |
| `anomaly.ts` | FR-M-004 | `AnomalyType` enum; `drop_pct` nullable for non-yield anomalies |
| `subsidy.ts` | FR-S-004 | Per-household KRW amounts |
| `audit-log.ts` | NFR-6 | Every admin action; immutable once written |
| `tx-stream-message.ts` | FR-M-008 | WebSocket broadcast shape for live tx stream |

---

## External API shapes

`src/external/` holds one file per mock external API (ADR-0004).  These shapes
match the FRD-prescribed input/output exactly so Phase 2 adapter swap-ins are
non-breaking.  After week 5, these files are also additive-only.

| File | FR ref | API |
|---|---|---|
| `kpx.ts` | FR-X-001 | KPX SMP hourly price |
| `rec.ts` | FR-X-002 | REC issuance / transfer / burn |
| `lh-accounting.ts` | FR-X-003 | LH 회계 subsidy reporting |
| `re100.ts` | FR-X-004 | RE100 ESG progress |
| `kets.ts` | FR-X-005 | K-ETS carbon credit |

---

## What NOT to do

- Do not add `import type` violations — every type-only import must use
  `import type { ... }` per the project eslint rule.
- Do not add business logic — this package is shapes and constants only.
- Do not use Drizzle ORM here — Drizzle lives in `packages/db`.
- Do not hand-author fixtures — generate them from the Zod schema.
- Do not remove or rename exported symbols after week 1 freeze.

---

## Links

- ADR-0001: `docs/adr/ADR-0001-monorepo-pnpm-workspaces.md`
- Plan Coherence Guards: `.omc/plans/lucia-pilot-implementation.md` (§ Coherence guards)
- FRD §11.1: `untitled/project/uploads/TheKIE_LH_FRD.docx`
