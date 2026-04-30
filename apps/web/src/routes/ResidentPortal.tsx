// FR-M-007 — 입주민 포털 (Demo Step 5 satisfier).
//
// Mock token auth: user_id from URL maps to a hardcoded resident in MOCK_RESIDENTS.
// Engine endpoint /api/portal/:user_id replaces this in B9.x.

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Icons } from '@/components/Icons';
import { Pill, Btn, fmt } from '@/components/atoms';

interface Resident {
  id: string;
  maskedName: string;
  buildingId: string;
  buildingLabel: string;
  region: string;
  households: number;
  group: 'lh' | 'kookmin' | 'energy';
  groupLabel: string;
  groupRatioPct: number;
  monthlySubsidyKrw: number;
  buildingMonthlyGenKwh: number;
  buildingMonthlyRevenueKrw: number;
  reservationKrw: number;
  groupShareKrw: number;
}

const MOCK_RESIDENTS: Record<string, Resident> = {
  h0001: {
    id: 'h0001',
    maskedName: '홍*동',
    buildingId: 'ULJN-001',
    buildingLabel: 'ULJN-001 옥상 햇빛발전소',
    region: '경상북도 울진',
    households: 1643,
    group: 'lh',
    groupLabel: 'LH 매입임대',
    groupRatioPct: 64.2,
    monthlySubsidyKrw: 6420,
    buildingMonthlyGenKwh: 318420,
    buildingMonthlyRevenueKrw: 16432180,
    reservationKrw: 6737194,
    groupShareKrw: 4325278,
  },
  k0014: {
    id: 'k0014',
    maskedName: '김*수',
    buildingId: 'YESN-014',
    buildingLabel: 'YESN-014 옥상 햇빛발전소',
    region: '충청남도 예산',
    households: 280,
    group: 'kookmin',
    groupLabel: '국민임대',
    groupRatioPct: 10.9,
    monthlySubsidyKrw: 7420,
    buildingMonthlyGenKwh: 184220,
    buildingMonthlyRevenueKrw: 10812040,
    reservationKrw: 4432936,
    groupShareKrw: 483090,
  },
  e0042: {
    id: 'e0042',
    maskedName: '이*경',
    buildingId: 'BSAN-042',
    buildingLabel: 'BSAN-042 옥상 햇빛발전소',
    region: '강원도 봉산',
    households: 916,
    group: 'energy',
    groupLabel: '에너지소외계층',
    groupRatioPct: 35.8,
    monthlySubsidyKrw: 18195,
    buildingMonthlyGenKwh: 412600,
    buildingMonthlyRevenueKrw: 21940220,
    reservationKrw: 8995490,
    groupShareKrw: 3220385,
  },
};

const MONTHS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
] as const;

const GROUP_PILL_TONE: Record<Resident['group'], 'green' | 'sky' | 'amber'> = {
  lh: 'green',
  kookmin: 'sky',
  energy: 'amber',
};

export function ResidentPortal() {
  const { user_id } = useParams<{ user_id: string }>();
  const lookupId = user_id ?? 'h0001';
  const resident = MOCK_RESIDENTS[lookupId] ?? MOCK_RESIDENTS['h0001'];
  const [month, setMonth] = useState<string>('4월');
  const [chainOpen, setChainOpen] = useState<boolean>(false);

  if (!resident) {
    return (
      <div className="card" style={{ padding: 40 }}>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>입주민 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const txId = `0x8a44${resident.id.slice(-2).padStart(2, '0')}…d215`;

  return (
    <>
      {/* Header */}
      <div className="hero-header">
        <div>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: '#6B7280',
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            <span style={{ transform: 'rotate(180deg)', display: 'inline-block' }}>
              {Icons.Arrow}
            </span>
            대시보드로 돌아가기
          </Link>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            안녕하세요, {resident.maskedName} 입주민님
          </div>
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginTop: 8,
              fontSize: 13,
              color: '#6B7280',
              alignItems: 'center',
            }}
          >
            <Pill tone={GROUP_PILL_TONE[resident.group]} dot>
              {resident.groupLabel}
            </Pill>
            <span>
              {resident.region} · {resident.buildingLabel}
            </span>
          </div>
        </div>

        {/* Month picker */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
            border: '1px solid var(--line-2)',
            padding: '6px 10px',
            borderRadius: 999,
            height: 40,
          }}
        >
          {Icons.Clock}
          <span style={{ fontSize: 12.5, color: '#6B7280', marginRight: 4 }}>2026년</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: 13,
              fontWeight: 600,
              color: '#0E1116',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero subsidy card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        <div
          style={{
            background:
              'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 60%, #fff 100%)',
            padding: '28px 30px 22px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div style={{ fontSize: 12.5, color: '#047857', fontWeight: 700, marginBottom: 8 }}>
            {month} 환원 금액
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              className="num"
              style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}
            >
              {fmt.n(resident.monthlySubsidyKrw)}
            </span>
            <span style={{ fontSize: 18, color: '#6B7280', fontWeight: 500 }}>원</span>
            <span
              style={{
                marginLeft: 8,
                fontSize: 11.5,
                color: '#059669',
                fontWeight: 600,
                background: '#D1FAE5',
                padding: '3px 10px',
                borderRadius: 999,
              }}
            >
              월 자동 정산
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 6 }}>
            {resident.buildingId}에서 발전된{' '}
            <span className="num" style={{ color: '#0E1116', fontWeight: 700 }}>
              {fmt.n(resident.buildingMonthlyGenKwh)} kWh
            </span>{' '}
            × 분배율 = 본인 환원 금액
          </div>
        </div>

        {/* Derivation steps */}
        <div style={{ padding: '20px 30px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 12 }}>
            계산 내역
          </div>
          <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
            <DerivRow
              label={`${resident.buildingId} 발전수익 (${month})`}
              value={fmt.won(resident.buildingMonthlyRevenueKrw)}
            />
            <DerivRow
              label="주거비 환원 비율 (41%)"
              value={fmt.won(resident.reservationKrw)}
            />
            <DerivRow
              label={`${resident.groupLabel} 분배 (${resident.groupRatioPct}%)`}
              value={fmt.won(resident.groupShareKrw)}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 10,
                borderTop: '1px dashed var(--line-2)',
              }}
            >
              <span style={{ color: '#6B7280' }}>
                {fmt.n(resident.households)}세대 균등 분배
              </span>
              <span className="num" style={{ fontWeight: 700, color: '#047857' }}>
                ÷ {fmt.n(resident.households)} ={' '}
                {fmt.won(resident.monthlySubsidyKrw)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chain proof card */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Pill tone="indigo">FR-S-007</Pill>
              <span style={{ fontSize: 11.5, color: '#9AA0AB' }}>
                Hyperledger Fabric · LevelDB state DB
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
              블록체인 증빙 — 변조 불가
            </div>
          </div>
          <Btn
            variant="secondary"
            size="sm"
            icon={Icons.Chain}
            onClick={() => setChainOpen((v) => !v)}
          >
            {chainOpen ? '증빙 닫기' : '증빙 열기'}
          </Btn>
        </div>

        <button
          onClick={() => setChainOpen((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 14px',
            background: '#F4F5F7',
            borderRadius: 12,
            width: '100%',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>tx_id</span>
          <span className="mono" style={{ fontSize: 13, color: '#4F46E5', fontWeight: 700 }}>
            {txId}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9AA0AB' }}>
            클릭하여 상세 보기
          </span>
        </button>

        {chainOpen && (
          <div
            style={{
              marginTop: 12,
              padding: 14,
              background: '#0E1116',
              color: '#A7F3D0',
              borderRadius: 12,
              fontFamily: '"Geist Mono", ui-monospace, monospace',
              fontSize: 11.5,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
            className="mono flow-in"
          >
{`block:    #184729
tx_id:    ${txId}
chaincode: lucia.settlement.v1
function: settle.recordPerHousehold
timestamp: 2026-04-30T14:24:18+09:00
inputs:
  building_id: ${resident.buildingId}
  household_id: ${resident.id}
  ratio: ${(resident.groupRatioPct / 100).toFixed(3)}
  per_household_krw: ${resident.monthlySubsidyKrw}
hash:     0xb7c1…ee08 (sha256, prev_hash chained)
endorsers: 3 / 3 ✓
status:   committed`}
          </div>
        )}
      </div>
    </>
  );
}

interface DerivRowProps {
  label: string;
  value: string;
}

function DerivRow({ label, value }: DerivRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#6B7280' }}>{label}</span>
      <span className="num" style={{ fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}
