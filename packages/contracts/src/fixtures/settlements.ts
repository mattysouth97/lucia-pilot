import type { Settlement } from '../domain/settlement.js';

// 5 representative settlements with realistic FR-S-002~006 numbers.
// Math basis: 1 kWh @ SMP 119, REC ×1.2, 41% subsidy split, SaaS 1.65%, txn fee 2.1%.
// Hash values are placeholder sha256 hex strings (64 chars, valid regex).
const ZERO_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
const H1 = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
const H2 = 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3';
const H3 = 'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4';
const H4 = 'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5';
const H5 = 'e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6';

export const SETTLEMENTS: Settlement[] = [
  {
    // ULJN-001: 1.23 kWh — prototype TX_STREAM[0] settle 146.4원
    settlement_id: '11111111-1111-1111-1111-111111111111',
    event_id: 'eeeeeeee-0001-0001-0001-000000000001',
    building_id: 'ULJN-001',
    ts: '2026-04-30T13:24:18.000Z',
    kwh: 1.23,
    cash_flow: {
      smp_revenue: 146.37,   // 1.23 × 119
      rec_amount: 0.001476,  // 1.23 / 1000 × 1.2
      rec_value: 100.93,     // rec_amount × REC market price (≈68,370원/MWh)
      ppa_revenue: 0,
      kets_credit: 0,
      housing_subsidy_lh: 64.15,    // 1.23 × 64.2% of 41% base
      housing_subsidy_kookmin: 10.89, // 1.23 × 10.9%
      housing_subsidy_energy: 35.80,  // 1.23 × 35.8%
      saas_fee_lucia: 2.41,   // 1.23 × 1.65원/kWh × (SMP+REC share)
      saas_fee_kie_rems: 0,
      txn_fee: 2.58,          // 1.23 × 2.1원/kWh
      spc_net: 130.47,
    },
    payload_hash: H1,
    prev_hash: ZERO_HASH,
    tx_id: '0x7f3ea92c',
    block_height: 184729,
  },
  {
    // ULJN-007: 1.34 kWh — prototype TX_STREAM[2] settle 159.5원
    settlement_id: '22222222-2222-2222-2222-222222222222',
    event_id: 'eeeeeeee-0002-0002-0002-000000000002',
    building_id: 'ULJN-007',
    ts: '2026-04-30T13:24:09.000Z',
    kwh: 1.34,
    cash_flow: {
      smp_revenue: 159.46,
      rec_amount: 0.001608,
      rec_value: 109.97,
      ppa_revenue: 0,
      kets_credit: 0,
      housing_subsidy_lh: 69.91,
      housing_subsidy_kookmin: 11.87,
      housing_subsidy_energy: 39.03,
      saas_fee_lucia: 2.63,
      saas_fee_kie_rems: 0,
      txn_fee: 2.81,
      spc_net: 142.19,
    },
    payload_hash: H2,
    prev_hash: H1,
    tx_id: '0x2c8a1e7b',
    block_height: 184727,
  },
  {
    // ULJN-031: 0.98 kWh — prototype TX_STREAM[3] settle 116.6원
    settlement_id: '33333333-3333-3333-3333-333333333333',
    event_id: 'eeeeeeee-0003-0003-0003-000000000003',
    building_id: 'ULJN-031',
    ts: '2026-04-30T13:24:03.000Z',
    kwh: 0.98,
    cash_flow: {
      smp_revenue: 116.62,
      rec_amount: 0.001176,
      rec_value: 80.43,
      ppa_revenue: 0,
      kets_credit: 0,
      housing_subsidy_lh: 51.14,
      housing_subsidy_kookmin: 8.68,
      housing_subsidy_energy: 28.54,
      saas_fee_lucia: 1.92,
      saas_fee_kie_rems: 0,
      txn_fee: 2.06,
      spc_net: 104.06,
    },
    payload_hash: H3,
    prev_hash: H2,
    tx_id: '0x4d5fb903',
    block_height: 184726,
  },
  {
    // ULJN-023: 1.09 kWh — prototype TX_STREAM[5] settle 129.7원
    settlement_id: '44444444-4444-4444-4444-444444444444',
    event_id: 'eeeeeeee-0004-0004-0004-000000000004',
    building_id: 'ULJN-023',
    ts: '2026-04-30T13:23:51.000Z',
    kwh: 1.09,
    cash_flow: {
      smp_revenue: 129.71,
      rec_amount: 0.001308,
      rec_value: 89.45,
      ppa_revenue: 0,
      kets_credit: 0,
      housing_subsidy_lh: 56.90,
      housing_subsidy_kookmin: 9.66,
      housing_subsidy_energy: 31.78,
      saas_fee_lucia: 2.14,
      saas_fee_kie_rems: 0,
      txn_fee: 2.29,
      spc_net: 115.89,
    },
    payload_hash: H4,
    prev_hash: H3,
    tx_id: '0x8a44d215',
    block_height: 184725,
  },
  {
    // ULJN-104: 0.94 kWh — prototype TX_STREAM[7] settle 111.9원
    settlement_id: '55555555-5555-5555-5555-555555555555',
    event_id: 'eeeeeeee-0005-0005-0005-000000000005',
    building_id: 'ULJN-104',
    ts: '2026-04-30T13:23:39.000Z',
    kwh: 0.94,
    cash_flow: {
      smp_revenue: 111.86,
      rec_amount: 0.001128,
      rec_value: 77.14,
      ppa_revenue: 0,
      kets_credit: 0,
      housing_subsidy_lh: 49.05,
      housing_subsidy_kookmin: 8.33,
      housing_subsidy_energy: 27.38,
      saas_fee_lucia: 1.84,
      saas_fee_kie_rems: 0,
      txn_fee: 1.97,
      spc_net: 99.83,
    },
    payload_hash: H5,
    prev_hash: H4,
    tx_id: '0x5b7dab38',
    block_height: 184723,
  },
];
