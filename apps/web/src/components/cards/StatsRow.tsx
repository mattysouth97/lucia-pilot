// StatsRow — 5 KPI tiles across the top of the dashboard.
// FR-M-001 · demo numbers hardcoded from LUCIA_DATA prototype.
//
// Per DESIGN.md: the parent `.grid-stats` is the single bordered surface
// (one card frame containing five tiles divided by 1px hairlines). Per-tile
// chrome and per-tile color tints are deliberately dropped — see
// PRODUCT.md anti-references "identical card grids with colored icon tiles".

import type { ReactNode } from 'react';

import { Icons } from '@/components/Icons';
import { Stat, Spark } from '@/components/atoms';

interface StatItem {
  label: string;
  value: string;
  unit: string;
  delta: number;
  deltaLabel?: string;
  icon: ReactNode;
  spark: number[];
}

export interface StatsRowData {
  todayKwh?: string;
  monthRevenue?: string;
  monthSubsidy?: string;
  recAccrued?: string;
  anomalyCount?: string;
}

interface StatsRowProps {
  data?: StatsRowData;
}

const DEFAULT_ITEMS: StatItem[] = [
  {
    label: '오늘 발전량',
    value: '11,852',
    unit: 'kWh',
    delta: 4.2,
    icon: Icons.Sun,
    spark: [820, 1040, 1180, 1520, 1680, 1620, 1480, 1240, 920, 540, 210, 32],
  },
  {
    label: '누적 정산 매출 (4월)',
    value: '32,356,400',
    unit: '원',
    delta: 8.7,
    icon: Icons.Coin,
    spark: [62, 68, 71, 79, 84, 88, 91, 95, 100, 108, 113, 119],
  },
  {
    label: '주거비 환원 (월)',
    value: '13,266,360',
    unit: '원',
    delta: 6.1,
    icon: Icons.Home,
    spark: [40, 44, 48, 52, 58, 64, 68, 72, 78, 84, 92, 98],
  },
  {
    label: 'REC 적립',
    value: '1,422.4',
    unit: 'REC',
    delta: 3.4,
    icon: Icons.Spark,
    spark: [12, 18, 24, 32, 41, 52, 64, 78, 92, 108, 124, 142],
  },
  {
    label: '이상 감지',
    value: '3',
    unit: '건',
    delta: -1.2,
    deltaLabel: '양호',
    icon: Icons.Bell,
    spark: [5, 4, 6, 4, 3, 5, 4, 3, 2, 4, 3, 3],
  },
];

export function StatsRow({ data }: StatsRowProps) {
  const items: StatItem[] = DEFAULT_ITEMS.map((it, i) => {
    if (!data) return it;
    const overrides: Partial<StatItem>[] = [
      data.todayKwh != null ? { value: data.todayKwh } : {},
      data.monthRevenue != null ? { value: data.monthRevenue } : {},
      data.monthSubsidy != null ? { value: data.monthSubsidy } : {},
      data.recAccrued != null ? { value: data.recAccrued } : {},
      data.anomalyCount != null ? { value: data.anomalyCount } : {},
    ];
    return { ...it, ...overrides[i] };
  });

  return (
    <div className="grid-stats">
      {items.map((it, i) => {
        const sparkColor =
          it.delta >= 0 ? 'var(--accent)' : 'var(--rose)';
        return (
          <div
            key={i}
            className="flow-in"
            style={{
              padding: '20px 22px',
              animationDelay: `${i * 50}ms`,
              minWidth: 0,
            }}
          >
            <Stat
              label={it.label}
              value={it.value}
              unit={it.unit}
              delta={it.delta}
              deltaLabel={it.deltaLabel}
              icon={it.icon}
            />
            <div style={{ marginTop: 14 }}>
              <Spark data={it.spark} color={sparkColor} w={150} h={26} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
