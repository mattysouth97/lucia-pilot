// Coherence Guard 3 — every demo fixture in v1-3-demo.ts must validate
// against its respective Zod schema.

import { describe, it } from 'vitest';

import {
  CommunityEvent,
  ESGImpactSnapshot,
  Investor,
  LOI,
  CO2_KG_PER_KWH,
} from '../../domain/index.js';
import {
  DEMO_INVESTORS,
  DEMO_LOIS,
  DEMO_EVENTS,
  DEMO_ESG_IMPACTS,
} from '../v1-3-demo.js';

describe('v1-3-demo — Investor fixtures', () => {
  it('5 investors total (4 RE100 + 1 retail)', ({ expect }) => {
    expect(DEMO_INVESTORS).toHaveLength(5);
    const re100 = DEMO_INVESTORS.filter((i) => i.type === 're100').length;
    const retail = DEMO_INVESTORS.filter((i) => i.type === 'retail').length;
    expect(re100).toBe(4);
    expect(retail).toBe(1);
  });

  it('all parse against Investor schema', () => {
    for (const i of DEMO_INVESTORS) Investor.parse(i);
  });

  it('the 4 expected RE100 companies are present', ({ expect }) => {
    const names = new Set(
      DEMO_INVESTORS.filter((i) => i.type === 're100').map((i) =>
        i.type === 're100' ? i.company_name : '',
      ),
    );
    for (const expected of ['SK하이닉스', '삼성전자', '네이버', '기아']) {
      expect(names.has(expected), `missing ${expected}`).toBe(true);
    }
  });
});

describe('v1-3-demo — LOI fixtures', () => {
  it('3 LOIs in 3 statuses', ({ expect }) => {
    expect(DEMO_LOIS).toHaveLength(3);
    const statuses = new Set(DEMO_LOIS.map((l) => l.status));
    expect(statuses.has('submitted')).toBe(true);
    expect(statuses.has('draft')).toBe(true);
    expect(statuses.has('approved')).toBe(true);
  });

  it('all parse against LOI schema', () => {
    for (const l of DEMO_LOIS) LOI.parse(l);
  });

  it('every investor_id resolves to a known investor', ({ expect }) => {
    const ids = new Set(DEMO_INVESTORS.map((i) => i.id));
    for (const l of DEMO_LOIS) {
      expect(ids.has(l.investor_id), `LOI ${l.id} → unknown investor ${l.investor_id}`).toBe(true);
    }
  });

  it('retail LOI is flagged is_non_binding=true', ({ expect }) => {
    const retailLois = DEMO_LOIS.filter((l) => {
      const investor = DEMO_INVESTORS.find((i) => i.id === l.investor_id);
      return investor?.type === 'retail';
    });
    expect(retailLois.length).toBeGreaterThan(0);
    for (const l of retailLois) expect(l.is_non_binding).toBe(true);
  });

  it('draft LOIs have null pdf_url, blockchain_hash, signed_at', ({ expect }) => {
    for (const l of DEMO_LOIS.filter((x) => x.status === 'draft')) {
      expect(l.pdf_url).toBeNull();
      expect(l.blockchain_hash).toBeNull();
      expect(l.signed_at).toBeNull();
    }
  });
});

describe('v1-3-demo — Community event fixtures', () => {
  it('2 events: 1 past (LH PDF p.5) + 1 upcoming', ({ expect }) => {
    expect(DEMO_EVENTS).toHaveLength(2);
    const past = DEMO_EVENTS.filter((e) => e.status === 'past');
    const upcoming = DEMO_EVENTS.filter((e) => e.status === 'upcoming');
    expect(past).toHaveLength(1);
    expect(upcoming).toHaveLength(1);
  });

  it('all parse against CommunityEvent schema', () => {
    for (const e of DEMO_EVENTS) CommunityEvent.parse(e);
  });

  it('the 25.11.21 탄소중립 한마당 is the past event (LH PDF p.5 spec)', ({ expect }) => {
    const past = DEMO_EVENTS.find((e) => e.status === 'past');
    expect(past?.title).toContain('탄소중립 한마당');
    // Asserts the date is in November 2025
    expect(past?.datetime.startsWith('2025-11-21')).toBe(true);
  });
});

describe('v1-3-demo — ESG impact fixtures', () => {
  it('9 snapshots — 3 residents × 3 months', ({ expect }) => {
    expect(DEMO_ESG_IMPACTS).toHaveLength(9);
  });

  it('all parse against ESGImpactSnapshot schema', () => {
    for (const s of DEMO_ESG_IMPACTS) ESGImpactSnapshot.parse(s);
  });

  it('residents h0001, k0014, e0042 each have 3 snapshots', ({ expect }) => {
    for (const rid of ['h0001', 'k0014', 'e0042']) {
      const count = DEMO_ESG_IMPACTS.filter((s) => s.resident_id === rid).length;
      expect(count, `${rid} should have 3 snapshots, got ${count}`).toBe(3);
    }
  });

  it('co2_saved_kg ≈ kwh_generated × 0.4244 within rounding tolerance', ({ expect }) => {
    for (const s of DEMO_ESG_IMPACTS) {
      const expected = s.kwh_generated * CO2_KG_PER_KWH;
      // Snapshot is rounded to 2 decimals → tolerance 0.02 kg
      expect(Math.abs(s.co2_saved_kg - expected)).toBeLessThan(0.02);
    }
  });

  it('e0042 has highest ranking_pct (largest subsidy → top contribution)', ({ expect }) => {
    const e = DEMO_ESG_IMPACTS.find((s) => s.resident_id === 'e0042')!;
    const h = DEMO_ESG_IMPACTS.find((s) => s.resident_id === 'h0001')!;
    const k = DEMO_ESG_IMPACTS.find((s) => s.resident_id === 'k0014')!;
    expect(e.ranking_pct).toBeGreaterThan(h.ranking_pct);
    expect(h.ranking_pct).toBeGreaterThan(k.ranking_pct);
  });
});
