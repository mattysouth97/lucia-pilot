// FR-M-007 — 입주민 포털 (Demo Step 5 satisfier).
//
// Mock token auth: user_id from URL maps to a hardcoded resident in MOCK_RESIDENTS.
// Engine endpoint /api/portal/:user_id replaces this in B9.x.

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Icons } from '@/components/Icons';
import { Pill, Btn, fmt } from '@/components/atoms';

interface BuildingContribution {
  code: string;
  name: string;
  contribPct: number;
  amountKrw: number;
}

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
  buildingContributions: readonly BuildingContribution[];
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
    buildingContributions: [
      { code: 'ULJN-001', name: '울진 1단지 옥상', contribPct: 31.4, amountKrw: 2016 },
      { code: 'ULJN-002', name: '울진 2단지 옥상', contribPct: 23.1, amountKrw: 1483 },
      { code: 'ULJN-003', name: '울진 3단지 옥상', contribPct: 18.7, amountKrw: 1200 },
      { code: 'ULJN-007', name: '울진 7단지 옥상', contribPct: 15.2, amountKrw: 976 },
      { code: 'ULJN-012', name: '울진 12단지 옥상', contribPct: 11.6, amountKrw: 745 },
    ] as const,
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
    buildingContributions: [
      { code: 'YESN-014', name: '예산 14단지 옥상', contribPct: 42.3, amountKrw: 3139 },
      { code: 'YESN-015', name: '예산 15단지 옥상', contribPct: 27.8, amountKrw: 2063 },
      { code: 'YESN-016', name: '예산 16단지 옥상', contribPct: 18.4, amountKrw: 1365 },
      { code: 'YESN-022', name: '예산 22단지 옥상', contribPct: 11.5, amountKrw: 853 },
    ] as const,
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
    buildingContributions: [
      { code: 'BSAN-042', name: '봉산 42단지 옥상', contribPct: 36.2, amountKrw: 6587 },
      { code: 'BSAN-043', name: '봉산 43단지 옥상', contribPct: 28.5, amountKrw: 5186 },
      { code: 'BSAN-047', name: '봉산 47단지 옥상', contribPct: 19.8, amountKrw: 3603 },
      { code: 'BSAN-051', name: '봉산 51단지 옥상', contribPct: 9.7, amountKrw: 1765 },
      { code: 'BSAN-058', name: '봉산 58단지 옥상', contribPct: 5.8, amountKrw: 1054 },
    ] as const,
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

      {/* 산정 근거 — building × share % breakdown */}
      <div className="card" style={{ padding: 22, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 14, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          산정 근거 — 발전소별 기여도
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th style={{ textAlign: 'left', fontWeight: 600, color: '#6B7280', paddingBottom: 8, fontSize: 11.5 }}>발전소</th>
              <th style={{ textAlign: 'right', fontWeight: 600, color: '#6B7280', paddingBottom: 8, fontSize: 11.5 }}>기여도</th>
              <th style={{ textAlign: 'right', fontWeight: 600, color: '#6B7280', paddingBottom: 8, fontSize: 11.5 }}>정산 금액</th>
            </tr>
          </thead>
          <tbody>
            {resident.buildingContributions.map((c) => (
              <tr key={c.code} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '9px 0', verticalAlign: 'middle' }}>
                  <span className="mono" style={{ fontSize: 11.5, color: '#4F46E5', fontWeight: 700, marginRight: 6 }}>{c.code}</span>
                  <span style={{ color: '#6B7280', fontSize: 12.5 }}>{c.name}</span>
                </td>
                <td style={{ padding: '9px 0', textAlign: 'right', verticalAlign: 'middle' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 5, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${c.contribPct}%`, height: '100%', background: 'var(--accent)', borderRadius: 999 }} />
                    </div>
                    <span className="num" style={{ fontSize: 12.5, fontWeight: 600, color: '#0E1116', minWidth: 38, textAlign: 'right' }}>{c.contribPct}%</span>
                  </div>
                </td>
                <td style={{ padding: '9px 0', textAlign: 'right', verticalAlign: 'middle' }}>
                  <span className="num" style={{ fontWeight: 600 }}>{fmt.won(c.amountKrw)}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{ paddingTop: 10, color: '#6B7280', fontSize: 12.5, fontWeight: 600 }}>합계</td>
              <td style={{ paddingTop: 10, textAlign: 'right' }}>
                <span className="num" style={{ fontWeight: 700, color: '#047857', fontSize: 13 }}>{fmt.won(resident.monthlySubsidyKrw)}</span>
              </td>
            </tr>
          </tfoot>
        </table>
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
