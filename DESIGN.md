# DESIGN — Lucia 정산 플랫폼

Tokens and component conventions. Implementation lives in `apps/web/src/index.css` and the inline `style={{}}` patterns documented in `apps/web/CLAUDE.md`. No Tailwind, no styled-components — that is an ADR-0005 decision and stays.

## Color

OKLCH-tuned hex values. Neutrals are tinted faintly toward the brand green hue (oklch chroma 0.005) so #fff and #000 never appear literally.

### Page surface

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FBFBFA` | Page background. Faintly warm-neutral, not pure white. |
| `--panel` | `#FFFFFF` | Card / surface white. |
| `--ink` | `#0A0C0F` | Primary text and topbar fill. Near-black, not `#000`. |
| `--ink-2` | `#1F232A` | Secondary text, axis labels, mono numerals on light. |
| `--muted` | `#5C6470` | Tertiary text, units, helper copy. |
| `--muted-2` | `#8A93A0` | Quaternary — chart axis ticks, faintest helper. |
| `--line` | `#E8EAEE` | Divider, default border. 1px hairline. |
| `--line-2` | `#D5D9DF` | Stronger border for input states / hover. |
| `--chip` | `#F1F2F4` | Subtle chip / inline tag background. |

### Accent — single saturated green only

| Token | Value | Use |
|---|---|---|
| `--accent` | `#10B981` | The one accent. Live status dot, positive delta, primary CTA, hero highlight. |
| `--accent-ink` | `#047857` | Accent text on white surface (positive delta, "정상"). |
| `--accent-soft` | `#ECFDF5` | Subtle accent fill — used sparingly, never as a card-wide background. |

### Semantic state — earn their place, do not decorate

| Token | Value | Use |
|---|---|---|
| `--rose` | `#E11D48` | Anomaly severity, error, tamper rejection. |
| `--rose-soft` | `#FFF1F3` | Anomaly chip background. Sparingly. |
| `--amber` | `#D97706` | Warning state. |
| `--amber-soft` | `#FFF4E0` | Warning chip background. |

Rose and amber must NEVER appear as a KPI tile background or icon tint just to vary the row visually. They appear when there is a state to express, never as decoration.

### Removed / deprecated (do not use)

- Indigo, sky, teal as KPI accents. Drop. Replaced by ink-on-white.
- Multi-stop gradient on logo, avatar, primary buttons. Drop.
- Radial gradient blobs in app shell background. Drop.

## Typography

| Family | Source | Use |
|---|---|---|
| Pretendard Variable | Korean UI | Body, labels, all Korean text. |
| Geist Mono | mono numerals | Every number that is data — KPIs, axes, mono columns, build hashes. `font-feature-settings: "tnum"`. |
| Manrope | Latin display | Permitted only for occasional Latin headlines. Do not use for body. |

### Scale (desktop)

Hierarchy by scale + weight contrast (≥1.25 ratio between steps).

| Role | Size / line-height | Weight | Tracking |
|---|---|---|---|
| Display metric (hero KPI) | 44–56 / 1 | 700 | -0.04em |
| KPI metric (StatsRow) | 36–40 / 1 | 700 | -0.035em |
| Card title | 20 / 1.2 | 700 | -0.025em |
| Hero header | 28–32 / 1.15 | 700 | -0.03em |
| Section label | 12.5 / 1.4 | 600 | -0.005em + uppercase 0.04em on overlines only |
| Body | 13.5–14 / 1.5 | 500 | -0.005em |
| Helper / unit | 11–12 / 1.4 | 500 | 0 |
| Chip / pill | 11.5 / 1.4 | 600 | -0.005em |

Body line-length capped at 65–75ch. Korean paragraphs cap at 60–70 characters which falls inside the same window.

### Numerals

Every numeric value is **mono + tabular-nums**. The `.num` utility applies `font-variant-numeric: tabular-nums`; combined with Geist Mono it gives column-aligned figures that read like a ledger. This is non-negotiable — settlement = ledger.

## Layout & elevation

### Surfaces

- **No box-shadow on cards.** A 1px `--line` border is sufficient. Hover state adds 1px stronger border (`--line-2`), no shadow shift.
- **Card radius: 4px.** Not 18, not 12. Audit-grade tightness. Pure-rectangle (radius 0) is fine for table-shaped surfaces; 4 is the soft default.
- **Card padding:** 20px on the body, 24–28 on hero / wide cards. The mobile down-shift to 16 stays.

### Spacing rhythm

Vary, never uniform. The dashboard alternates dense rows (StatsRow, BuildingsCard) with breathing rows (GenerationCard hero). 12-16-24-32-48 step, not a flat 16-everywhere.

### Topbar

The topbar is a hard horizon line. **`--ink` fill, white text.** Logo is a single white wedge mark on the dark bar (no gradient). Tabs are text-only with a 2px white underline indicator on active. Search field is a 1px white-ink-line input on the dark bar. Avatar is a flat 28px square (4px radius), single-color initial, no gradient.

### App shell

`--bg` fills the page. **No radial-gradient blobs**, no decorative scene behind cards. The shell is a uniform surface and gets out of the way.

## Components

### Btn

| Variant | bg | fg | border | radius |
|---|---|---|---|---|
| primary | `--ink` | white | `--ink` | 6 |
| secondary | white | `--ink` | `--line-2` | 6 |
| ghost | transparent | `--ink-2` | transparent | 6 |
| accent | `--accent` | white | `--accent` | 6 |

Buttons are rectangles with 6px radius, not pills. Hover: secondary → bg `--chip`, primary → bg `--ink-2`.

### Pill (chip)

Pills carry status, not labels. Reduce to three tones in active rotation:

| Tone | bg | fg | dot |
|---|---|---|---|
| neutral | `--chip` | `--ink-2` | `--muted-2` |
| accent | `--accent-soft` | `--accent-ink` | `--accent` |
| rose | `--rose-soft` | `--rose` | `--rose` |

Indigo / sky / amber / ink kept available but not used by default. Pills become 4px-radius rectangles, not 999.

### Stat

- **Drop the 38px gradient icon tile.** Optional 14px stroke icon at left in `--ink-2`.
- Label: 12.5 / 600 / `--muted`.
- Value: **mono, tabular, 36–40px / 700 / -0.035em / `--ink`**.
- Unit: 12 / 500 / `--muted-2`, baseline-aligned to value.
- Delta: 12 / 600 — `--accent-ink` for positive, `--rose` for negative. No background pill.

### Spark

Single-color, no gradient fill, 1.5px stroke. Color is `--ink-2` for neutral series, `--accent` only when the metric is the accent metric. No multi-stop tints.

### Charts (Recharts)

- Grid: horizontal-only at `--line` (`#E8EAEE`). No vertical grid.
- Axes: no axis line, no tick line, ticks at 11px `--muted-2`.
- Series: primary in `--accent`, comparison in `--muted-2` dashed, no fill gradient on accent.
- Tooltip: 4px radius, 1px `--line-2` border, no shadow, mono body.

## Motion

- `flow-in` (translateY 8 → 0, opacity 0 → 1, 380ms ease-out cubic-bezier(0.2, 0.8, 0.2, 1)) stays for entrance.
- `pulse-dot` retired — a single static dot reads as "live" without the ring expansion.
- No bounce, no elastic, no animated layout properties.

## Absolute bans (matched against this design)

Already pruned by the rules above. Redundant guarantees:

- ❌ Side-stripe colored borders.
- ❌ Gradient text.
- ❌ Glassmorphism / blurred panels.
- ❌ Hero-metric template (single big number, gradient delta, repeated five times).
- ❌ Identical colored card grids.
- ❌ Modal as first thought (existing modals stay; no new ones unless the inline alternative is genuinely worse).

## Implementation map

| Token / decision | File |
|---|---|
| All color & type tokens | `apps/web/src/index.css` |
| `.card`, `.mono`, `.num`, `.flow-in`, `.pulse-dot` | `apps/web/src/index.css` |
| `Btn` variants | `apps/web/src/components/atoms/Btn.tsx` |
| `Pill` tones | `apps/web/src/components/atoms/Pill.tsx` |
| `Stat` layout | `apps/web/src/components/atoms/Stat.tsx` |
| `Spark` color rules | `apps/web/src/components/atoms/Spark.tsx` |
| Topbar / black bar | `apps/web/src/components/layout/Topbar.tsx` |
| App shell / no blob | `apps/web/src/components/AppShell.tsx` |
| Hero header | `apps/web/src/routes/Dashboard.tsx` |
| Reference card composition | `apps/web/src/components/cards/GenerationCard.tsx` |
