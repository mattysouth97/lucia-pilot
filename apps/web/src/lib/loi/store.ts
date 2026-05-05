// FR-R-005 — LOI store
//
// Pilot v1.3 has no backend; LOIs live in localStorage. The seed dataset
// (DEMO_LOIS from @lucia/contracts/fixtures) is loaded on first read so the
// /admin/loi console + FR-R-006 portfolio dashboard always have data even on
// a fresh browser. Subsequent writes (signing, status transitions) merge into
// the same key.

import { LOI, type LOIStatus, canTransition } from '@lucia/contracts/domain';
import { DEMO_LOIS } from '@lucia/contracts/fixtures';

const STORAGE_KEY = 'lucia.loi.store.v1';

// ---------------------------------------------------------------------------
// Internal — read/write the entire collection
// ---------------------------------------------------------------------------

function safeParse(json: string): LOI[] {
  try {
    const data = JSON.parse(json) as unknown;
    if (!Array.isArray(data)) return [];
    const valid: LOI[] = [];
    for (const row of data) {
      const result = LOI.safeParse(row);
      if (result.success) valid.push(result.data);
    }
    return valid;
  } catch {
    return [];
  }
}

function readAll(): LOI[] {
  if (typeof globalThis.localStorage === 'undefined') return [...DEMO_LOIS];
  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    // First read on this device — seed with the demo set.
    const seeded = [...DEMO_LOIS];
    writeAll(seeded);
    return seeded;
  }
  return safeParse(raw);
}

function writeAll(rows: readonly LOI[]): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function listLOIs(): LOI[] {
  return readAll();
}

export function listLOIsByInvestor(investor_id: string): LOI[] {
  return readAll().filter((l) => l.investor_id === investor_id);
}

export function getLOI(id: string): LOI | undefined {
  return readAll().find((l) => l.id === id);
}

export function upsertLOI(loi: LOI): LOI {
  const rows = readAll();
  const idx = rows.findIndex((l) => l.id === loi.id);
  const now = new Date().toISOString();
  const next: LOI = { ...loi, updated_at: now };
  if (idx === -1) rows.push(next);
  else rows[idx] = next;
  writeAll(rows);
  return next;
}

/**
 * Move an LOI to a new status, enforcing the FR-R-005 §6 workflow.
 * Throws if the transition is not allowed by `canTransition`.
 */
export function transitionLOI(id: string, to: LOIStatus): LOI {
  const current = getLOI(id);
  if (current === undefined) throw new Error(`LOI not found: ${id}`);
  if (!canTransition(current.status, to)) {
    throw new Error(
      `LOI ${id}: cannot transition from ${current.status} → ${to} (FR-R-005 §6 workflow)`,
    );
  }
  return upsertLOI({ ...current, status: to });
}

/**
 * Test-only — wipe the store. Used by Vitest setup hooks; do not call from
 * production code.
 */
export function __resetLOIStoreForTests(): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.removeItem(STORAGE_KEY);
}
