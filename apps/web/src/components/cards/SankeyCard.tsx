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

// Vertical-mode node shape — same fields but w replaces h as the primary
// flow-magnitude dimension (width is proportional to flow size, height is fixed).
interface SankeyNodeV {
  x: number;  // left edge
  y: number;  // top edge
  w: number;  // width (proportional to flow magnitude)
  h: number;  // height (fixed bar thickness)
  label: string;
  val: string;
  color: string;
}

// ─── Horizontal curve helper ─────────────────────────────────────────────────
// Connects right edge of node A to left edge of node B.
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

// ─── Vertical curve helper ────────────────────────────────────────────────────
// Connects bottom edge of node A to top edge of node B.
// ax/bx: horizontal offset within the source/target node
// aw/bw: slice width within the source/target node
function curveV(
  a: SankeyNodeV,
  b: SankeyNodeV,
  ax = 0,
  bx = 0,
  aw: number | null = null,
  bw: number | null = null,
): string {
  const y1 = a.y + a.h;       // bottom of source
  const y2 = b.y;              // top of target
  const cy = (y1 + y2) / 2;
  const xL1 = a.x + ax;
  const xR1 = a.x + ax + (aw ?? a.w);
  const xL2 = b.x + bx;
  const xR2 = b.x + bx + (bw ?? b.w);

  return (
    `M ${xL1} ${y1} ` +
    `C ${xL1} ${cy}, ${xL2} ${cy}, ${xL2} ${y2} ` +
    `L ${xR2} ${y2} ` +
    `C ${xR2} ${cy}, ${xR1} ${cy}, ${xR1} ${y1} Z`
  );
}

export interface SankeyCardData {
  totalRevenue?: string;
  totalHouseholds?: string;
}

interface SankeyCardProps {
  data?: SankeyCardData;
}

// ─── Horizontal layout constants ──────────────────────────────────────────────

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

// ─── Vertical layout constants ────────────────────────────────────────────────
// viewBox: 0 0 360 760
// Row positions (y):  src=20, rev=160, mid=320, dst=490..680
// Node thickness (h): 28px for src/rev/mid nodes, 22px for dst nodes
// Width is proportional to flow magnitude (same ratios as horizontal h values).
//
// Available width per row: 280px (x=40..320), gap between nodes: 8px
//
// src: full 280px wide — one block
// rev: two side-by-side blocks. Original h ratio: SMP=70, REC=100 → total 170
//   SMP_w = round(70/170 * 280) = 115, REC_w = 280 - 8 - 115 = 157
//   (gap 8 between them)
// mid: three side-by-side blocks. Original h: 70/30/100 → total 200
//   주거비_w = round(70/200 * 272) = 95  (272 = 280 - 2*8 gaps)
//   O&M_w   = round(30/200 * 272) = 41
//   SPC_w   = 272 - 95 - 41 = 136
// dst: six blocks stacked vertically (each row 22h, 6px gap)
//   proportional widths from original h: 30/12/28/16/14/95 → total 195
//   total available: 280px, with NO gaps between dst (they're thin bars)
//   dst[0]_w = round(30/195 * 280) = 43
//   dst[1]_w = round(12/195 * 280) = 17
//   dst[2]_w = round(28/195 * 280) = 40
//   dst[3]_w = round(16/195 * 280) = 23
//   dst[4]_w = round(14/195 * 280) = 20
//   dst[5]_w = 280 - 43 - 17 - 40 - 23 - 20 = 137
//   Arrange dst horizontally in a single row at y=490, labels below each bar.

const VW = 360;
const VH = 620;

const srcV: SankeyNodeV = { x: 40, y: 20,  w: 280, h: 28, label: '발전수익',       val: '32.4M원', color: '#0E1116' };

// Fixed-length tuples — preserves noUncheckedIndexedAccess discipline
const revV: readonly [SankeyNodeV, SankeyNodeV] = [
  { x: 40,  y: 160, w: 115, h: 28, label: 'SMP 매출', val: '19.4M원', color: '#10B981' },
  { x: 163, y: 160, w: 157, h: 28, label: 'REC 매출', val: '13.0M원', color: '#06B6A2' },
];

const midV: readonly [SankeyNodeV, SankeyNodeV, SankeyNodeV] = [
  { x: 40,  y: 320, w: 95,  h: 28, label: '주거비 환원 41%', val: '13.3M원', color: '#10B981' },
  { x: 143, y: 320, w: 41,  h: 28, label: 'O&M·SaaS 9%',    val: '2.9M원',  color: '#F59E0B' },
  { x: 192, y: 320, w: 136, h: 28, label: 'SPC 적립 50%',   val: '16.2M원', color: '#4F46E5' },
];

// dst nodes arranged horizontally (widths proportional to flow magnitude)
// x positions are cumulative: 40, 40+43=83, 83+17=100, 100+40=140, 140+23=163, 163+20=183
const dstV: readonly [SankeyNodeV, SankeyNodeV, SankeyNodeV, SankeyNodeV, SankeyNodeV, SankeyNodeV] = [
  { x: 40,  y: 490, w: 43,  h: 22, label: 'LH 매입임대 (1,643세대)', val: '8.5M원',  color: '#10B981' },
  { x: 83,  y: 490, w: 17,  h: 22, label: '국민임대 (280)',          val: '1.5M원',  color: '#34D399' },
  { x: 100, y: 490, w: 40,  h: 22, label: '에너지소외 (916)',        val: '3.3M원',  color: '#06B6A2' },
  { x: 140, y: 490, w: 23,  h: 22, label: 'TheKIE SaaS',            val: '1.7M원',  color: '#F59E0B' },
  { x: 163, y: 490, w: 20,  h: 22, label: 'O&M 운영',               val: '1.2M원',  color: '#FBBF24' },
  { x: 183, y: 490, w: 137, h: 22, label: 'SPC 자본 적립',          val: '16.2M원', color: '#4F46E5' },
];

// Gradient colors indexed by flow group (same as horizontal)
const FLOW_COLORS = ['#10B981', '#F59E0B', '#4F46E5', '#06B6A2', '#34D399'];

export function SankeyCard({ data }: SankeyCardProps) {
  const totalRevenue    = data?.totalRevenue    ?? '총 32,356,400원';
  const totalHouseholds = data?.totalHouseholds ?? '2,839세대';

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
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

      {/* ── Horizontal SVG (desktop ≥768px) ─────────────────────────────── */}
      <div className="sankey-horizontal-only card-scroll-x" style={{ overflow: 'auto' }}>
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

      {/* ── Vertical SVG (mobile <768px) ─────────────────────────────────── */}
      <div className="sankey-vertical-only">
        <svg width="100%" height="auto" viewBox={`0 0 ${VW} ${VH}`} style={{ display: 'block', maxWidth: '100%' }}>
          <defs>
            {FLOW_COLORS.map((cl, i) => (
              <linearGradient key={i} id={`flowv-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%"   stopColor={cl} stopOpacity={0.18} />
                <stop offset="100%" stopColor={cl} stopOpacity={0.32} />
              </linearGradient>
            ))}
          </defs>

          {/* ── Flows: srcV → revV ────────────────────────────── */}
          {/* src left half (w=140) → revV[0] SMP (w=115) */}
          <path d={curveV(srcV, revV[0], 0, 0, 140, revV[0].w)} fill="url(#flowv-0)" />
          {/* src right half (w=140) → revV[1] REC (w=157) */}
          <path d={curveV(srcV, revV[1], 140, 0, 140, revV[1].w)} fill="url(#flowv-3)" />

          {/* ── Flows: revV → midV ────────────────────────────── */}
          {/* revV[0] SMP (115) splits: 49→주거비, 66→SPC */}
          <path d={curveV(revV[0], midV[0], 0,  0,  49, 49)} fill="url(#flowv-0)" />
          <path d={curveV(revV[0], midV[2], 49, 0,  66, 66)} fill="url(#flowv-2)" />
          {/* revV[1] REC (157) splits: 46→주거비, 41→O&M, 70→SPC */}
          <path d={curveV(revV[1], midV[0], 0,  49, 46, 46)} fill="url(#flowv-0)" />
          <path d={curveV(revV[1], midV[1], 46, 0,  41, 41)} fill="url(#flowv-1)" />
          <path d={curveV(revV[1], midV[2], 87, 66, 70, 70)} fill="url(#flowv-2)" />

          {/* ── Flows: midV → dstV ────────────────────────────── */}
          {/* midV[0] 주거비환원 (95) → dst[0] LH(43), dst[1] 국민(17), dst[2] 에소(40) — with small rounding remainder: 43+17+40=100, cap at 95 */}
          <path d={curveV(midV[0], dstV[0], 0,  0,  40, dstV[0].w)} fill="url(#flowv-0)" />
          <path d={curveV(midV[0], dstV[1], 40, 0,  17, dstV[1].w)} fill="url(#flowv-4)" />
          <path d={curveV(midV[0], dstV[2], 57, 0,  38, dstV[2].w)} fill="url(#flowv-3)" />
          {/* midV[1] O&M (41) → dst[3] SaaS(23), dst[4] O&M(20) */}
          <path d={curveV(midV[1], dstV[3], 0,  0,  23, dstV[3].w)} fill="url(#flowv-1)" />
          <path d={curveV(midV[1], dstV[4], 23, 0,  18, dstV[4].w)} fill="url(#flowv-1)" />
          {/* midV[2] SPC적립 (136) → dst[5] SPC(137) */}
          <path d={curveV(midV[2], dstV[5], 0,  0,  136, dstV[5].w)} fill="url(#flowv-2)" />

          {/* ── src node ─────────────────────────────────────────── */}
          <rect x={srcV.x} y={srcV.y} width={srcV.w} height={srcV.h} rx={6} fill={srcV.color} />
          <text x={srcV.x + srcV.w / 2} y={srcV.y + srcV.h / 2 - 2}
            fill="#fff" fontSize={12} fontWeight={700} letterSpacing="-0.02em"
            textAnchor="middle"
          >{srcV.label}</text>
          <text x={srcV.x + srcV.w / 2} y={srcV.y + srcV.h / 2 + 12}
            fill="#fff" fontSize={10} opacity={0.75} fontWeight={500}
            textAnchor="middle"
          >{srcV.val}</text>

          {/* ── rev nodes ────────────────────────────────────────── */}
          {revV.map((n, i) => (
            <g key={`rv-${i}`}>
              <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={5} fill={n.color} />
              <text x={n.x + n.w / 2} y={n.y + n.h / 2 - 2}
                fill="#fff" fontSize={10} fontWeight={700} letterSpacing="-0.02em"
                textAnchor="middle"
              >{n.label}</text>
              <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 11}
                fill="#fff" fontSize={9} opacity={0.75} fontWeight={500}
                textAnchor="middle"
              >{n.val}</text>
            </g>
          ))}

          {/* ── mid nodes ────────────────────────────────────────── */}
          {midV.map((n, i) => {
            const labelFontSize = n.label.length > 8 ? 8 : 9;
            return (
              <g key={`mv-${i}`}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={5} fill={n.color} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 - 2}
                  fill="#fff" fontSize={labelFontSize} fontWeight={700} letterSpacing="-0.02em"
                  textAnchor="middle"
                >{n.label}</text>
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 11}
                  fill="#fff" fontSize={8.5} opacity={0.75} fontWeight={500}
                  textAnchor="middle"
                >{n.val}</text>
              </g>
            );
          })}

          {/* ── dst nodes + labels below ─────────────────────────── */}
          {dstV.map((n, i) => {
            // Split label at opening parenthesis so long labels wrap onto two lines
            const parenIdx = n.label.indexOf('(');
            const labelLine1 = parenIdx > 0 ? n.label.slice(0, parenIdx).trimEnd() : n.label;
            const labelLine2 = parenIdx > 0 ? n.label.slice(parenIdx) : null;
            const cx = n.x + n.w / 2;
            const labelY = n.y + n.h + 8;
            return (
              <g key={`dv-${i}`}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={3} fill={n.color} />
                {/* label rotated -55° centered under the bar; two-line for labels with parens */}
                <text
                  x={cx}
                  y={labelY}
                  fill="#0E1116"
                  fontSize={8}
                  fontWeight={600}
                  letterSpacing="-0.01em"
                  textAnchor="middle"
                  transform={`rotate(-65, ${cx}, ${labelY})`}
                >
                  <tspan x={cx} dy="0">{labelLine1}</tspan>
                  {labelLine2 && <tspan x={cx} dy="11">{labelLine2}</tspan>}
                </text>
                <text
                  x={cx}
                  y={n.y + n.h + 82}
                  fill="#6B7280"
                  fontSize={8}
                  fontWeight={500}
                  textAnchor="middle"
                >{n.val}</text>
              </g>
            );
          })}

          {/* ── Row labels (left side) ────────────────────────────── */}
          <text x={32} y={srcV.y + srcV.h / 2 + 4}  fill="#9CA3AF" fontSize={8} textAnchor="end">발전</text>
          <text x={32} y={revV[0].y + revV[0].h / 2 + 4} fill="#9CA3AF" fontSize={8} textAnchor="end">수익원</text>
          <text x={32} y={midV[0].y + midV[0].h / 2 + 4} fill="#9CA3AF" fontSize={8} textAnchor="end">배분</text>
          <text x={32} y={dstV[0].y + dstV[0].h / 2 + 4} fill="#9CA3AF" fontSize={8} textAnchor="end">수령</text>
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
        flexWrap: 'wrap',
        gap: 4,
      }}>
        <span>모든 분배는 블록체인에 영구 기록 · LH 감사 자동 대응</span>
        <span className="num" style={{ color: '#0E1116', fontWeight: 700 }}>
          {totalRevenue} / {totalHouseholds}
        </span>
      </div>
    </div>
  );
}
