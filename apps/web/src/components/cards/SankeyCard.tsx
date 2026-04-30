// SankeyCard — Hand-rolled SVG Sankey flow diagram
// FR-M-006 · 발전수익 분배 흐름 시각화

import { Icons } from '@/components/Icons';
import { Pill, Btn } from '@/components/atoms';

interface SankeyNode {
  x: number;
  y: number;
  h: number;
  label: string;
  val: string;
  color: string;
}

// Curved-path helper — port of prototype curve() function
// Connects right edge of node A to left edge of node B
// ay/by: vertical offset within the source/target node
// ah/bh: slice height within the source/target node
function curve(
  a: SankeyNode,
  b: SankeyNode,
  ay = 0,
  by = 0,
  ah: number | null = null,
  bh: number | null = null,
): string {
  const nodeWidth = 140;
  const x1 = a.x + nodeWidth;
  const x2 = b.x;
  const cx = (x1 + x2) / 2;
  const yTop1 = a.y + ay;
  const yBot1 = a.y + ay + (ah ?? a.h);
  const yTop2 = b.y + by;
  const yBot2 = b.y + by + (bh ?? b.h);

  return (
    `M ${x1} ${yTop1} ` +
    `C ${cx} ${yTop1}, ${cx} ${yTop2}, ${x2} ${yTop2} ` +
    `L ${x2} ${yBot2} ` +
    `C ${cx} ${yBot2}, ${cx} ${yBot1}, ${x1} ${yBot1} Z`
  );
}

export interface SankeyCardData {
  totalRevenue?: string;
  totalHouseholds?: string;
}

interface SankeyCardProps {
  data?: SankeyCardData;
}

const W = 920;
const H = 280;

// Node definitions — all coordinates match the prototype exactly
const src: SankeyNode = { x: 0,   y: 90,  h: 100, label: '발전수익',       val: '32.4M원', color: '#0E1116' };

// Tuples (fixed-length) so positional access (rev[0], dst[5], etc.) is typed
// as SankeyNode rather than SankeyNode | undefined under noUncheckedIndexedAccess.
const rev: readonly [SankeyNode, SankeyNode] = [
  { x: 180, y: 50,  h: 70,  label: 'SMP 매출', val: '19.4M원', color: '#10B981' },
  { x: 180, y: 140, h: 100, label: 'REC 매출', val: '13.0M원', color: '#06B6A2' },
];

const mid: readonly [SankeyNode, SankeyNode, SankeyNode] = [
  { x: 400, y: 30,  h: 70,  label: '주거비 환원 41%', val: '13.3M원', color: '#10B981' },
  { x: 400, y: 120, h: 30,  label: 'O&M·SaaS 9%',    val: '2.9M원',  color: '#F59E0B' },
  { x: 400, y: 165, h: 100, label: 'SPC 적립 50%',   val: '16.2M원', color: '#4F46E5' },
];

const dst: readonly [SankeyNode, SankeyNode, SankeyNode, SankeyNode, SankeyNode, SankeyNode] = [
  { x: 720, y: 10,  h: 30,  label: 'LH 매입임대 (1,643세대)', val: '8.5M원',  color: '#10B981' },
  { x: 720, y: 50,  h: 12,  label: '국민임대 (280)',          val: '1.5M원',  color: '#34D399' },
  { x: 720, y: 70,  h: 28,  label: '에너지소외 (916)',        val: '3.3M원',  color: '#06B6A2' },
  { x: 720, y: 110, h: 16,  label: 'TheKIE SaaS',            val: '1.7M원',  color: '#F59E0B' },
  { x: 720, y: 140, h: 14,  label: 'O&M 운영',               val: '1.2M원',  color: '#FBBF24' },
  { x: 720, y: 170, h: 95,  label: 'SPC 자본 적립',          val: '16.2M원', color: '#4F46E5' },
];

// Gradient colors indexed by flow group
const FLOW_COLORS = ['#10B981', '#F59E0B', '#4F46E5', '#06B6A2', '#34D399'];

export function SankeyCard({ data }: SankeyCardProps) {
  const totalRevenue    = data?.totalRevenue    ?? '총 32,356,400원';
  const totalHouseholds = data?.totalHouseholds ?? '2,839세대';

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Pill tone="indigo">FR-M-006</Pill>
            <Pill tone="green" dot>가상공유거래 ★</Pill>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>
            발전수익 분배 흐름 (2026.04 누적)
          </div>
          <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 3 }}>
            1 kWh의 가치가 5개 주체로 분배되는 가상공유거래 시각화
          </div>
        </div>
        <Btn variant="secondary" size="sm" icon={Icons.Filter}>월별 비교</Btn>
      </div>

      {/* SVG Sankey */}
      <div className="card-scroll-x" style={{ overflow: 'auto' }}>
        <svg width="100%" height="auto" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', minWidth: 600 }}>
          <defs>
            {FLOW_COLORS.map((cl, i) => (
              <linearGradient key={i} id={`flow-${i}`} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%"   stopColor={cl} stopOpacity={0.18} />
                <stop offset="100%" stopColor={cl} stopOpacity={0.32} />
              </linearGradient>
            ))}
          </defs>

          {/* Flows: src → rev */}
          <path d={curve(src, rev[0], 0,  0, 50, rev[0].h)} fill="url(#flow-0)" />
          <path d={curve(src, rev[1], 50, 0, 50, rev[1].h)} fill="url(#flow-3)" />

          {/* Flows: rev → mid */}
          <path d={curve(rev[0], mid[0], 0,  0,  30, 30)} fill="url(#flow-0)" />
          <path d={curve(rev[0], mid[2], 30, 0,  40, 50)} fill="url(#flow-2)" />
          <path d={curve(rev[1], mid[0], 0,  30, 40, 40)} fill="url(#flow-0)" />
          <path d={curve(rev[1], mid[1], 40, 0,  30, 30)} fill="url(#flow-1)" />
          <path d={curve(rev[1], mid[2], 70, 50, 30, 50)} fill="url(#flow-2)" />

          {/* Flows: mid → dst */}
          <path d={curve(mid[0], dst[0], 0,  0,  30,         dst[0].h)} fill="url(#flow-0)" />
          <path d={curve(mid[0], dst[1], 30, 0,  12,         dst[1].h)} fill="url(#flow-4)" />
          <path d={curve(mid[0], dst[2], 42, 0,  28,         dst[2].h)} fill="url(#flow-3)" />
          <path d={curve(mid[1], dst[3], 0,  0,  mid[1].h,   dst[3].h)} fill="url(#flow-1)" />
          <path d={curve(mid[2], dst[4], 0,  0,  14,         dst[4].h)} fill="url(#flow-2)" />
          <path d={curve(mid[2], dst[5], 14, 0,  86,         dst[5].h)} fill="url(#flow-2)" />

          {/* Nodes */}
          {[[src], rev, mid, dst].map((col, ci) =>
            col.map((n, ni) => {
              const isDst = ci === 3;
              const rectW = isDst ? 6 : 140;
              return (
                <g key={`${ci}-${ni}`}>
                  <rect x={n.x} y={n.y} width={rectW} height={n.h} rx={isDst ? 3 : 8} fill={n.color} />
                  {!isDst && (
                    <>
                      <text
                        x={n.x + 12} y={n.y + n.h / 2 - 2}
                        fill="#fff" fontSize={11} fontWeight={700} letterSpacing="-0.02em"
                      >
                        {n.label}
                      </text>
                      <text
                        x={n.x + 12} y={n.y + n.h / 2 + 13}
                        fill="#fff" fontSize={10} opacity={0.7} fontWeight={500}
                      >
                        {n.val}
                      </text>
                    </>
                  )}
                  {isDst && (
                    <>
                      <text
                        x={n.x + 14} y={n.y + n.h / 2 - 1}
                        fill="#0E1116" fontSize={11} fontWeight={600} letterSpacing="-0.01em"
                      >
                        {n.label}
                      </text>
                      <text
                        x={n.x + 14} y={n.y + n.h / 2 + 12}
                        fill="#6B7280" fontSize={10} fontWeight={500}
                      >
                        {n.val}
                      </text>
                    </>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Bottom strip */}
      <div style={{
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px dashed var(--line-2)',
        fontSize: 11.5,
        color: '#6B7280',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>모든 분배는 블록체인에 영구 기록 · LH 감사 자동 대응</span>
        <span className="num" style={{ color: '#0E1116', fontWeight: 700 }}>
          {totalRevenue} / {totalHouseholds}
        </span>
      </div>
    </div>
  );
}
