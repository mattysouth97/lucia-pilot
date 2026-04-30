# PRODUCT — Lucia 정산 플랫폼 (LH 매입임대 햇빛발전소)

## Register

**product** — design serves the operations of LH analysts and ESG executives. Design is in service of the data, the workflow, and the audit trail. The product is not a marketing surface; it is an instrument.

## Users

Three audiences, all viewing the same surface at different cadences:

1. **LH ESG 본사 분석가 (primary)**
   김지호 처장–type. Senior, time-pressed, watches the dashboard during business hours on a 27" desk monitor in office light. Cares about settlement integrity, anomaly count, and the audit trail link to the chain. Reads Korean. Will sit in the M+3 demo and decide whether the pilot is fundable to scale.

2. **운영팀 (operator)**
   On-call when an anomaly fires. Needs to find a building, see its event log, jump to the chain tx_id, and either dismiss or escalate. Speed matters; chrome is in the way.

3. **입주민 (resident, separate `/portal/:user_id` route)**
   Checks subsidy once a month. Different surface, same visual register.

The reference user for the dashboard register is the **analyst**: dense data, audit-grade typography, no decoration that would survive a screenshot in an executive deck.

## Product purpose

Lucia automates per-building kWh settlement, SMP/REC revenue allocation, and blockchain-anchored audit trails for the LH 울진 매입임대 116-동 (3 MW) solar pilot. M+3 demo to LH 본사 ESG 경영실 is the critical path. The platform must scale to 9,354 buildings without architectural change.

This is a **settlement instrument** — not a marketing dashboard, not a SaaS metrics product, not a fintech app. The design must convey audit-grade precision and Hyperledger-anchored trust. Numbers are the hero; chrome is the enemy.

## Tone

- Direct, ledger-honest, Korean-warm. The greeting line ("안녕하세요, 김지호 처장님") stays — it humanizes a settlement engine without softening its precision.
- Numerics speak first. Labels are small. Decoration is rare.
- "감사 보고서", "변조 시도 데모", "정산엔진 정상" — formal Korean operations vocabulary throughout. No casual glyphs, no SaaS emoji.

## Anti-references

These are explicit. If the dashboard starts to feel like one of these, it has drifted.

- **SaaS-cream dashboards** (Linear, Vercel, Notion analytics, generic shadcn). Soft gradients, blur, hero-metric-template. Lucia is not a B2B funnel.
- **Crypto-trader neon** (Phantom, Robinhood, post-2021 dark dashboards). Lucia handles regulated public funds; visual flash undercuts trust.
- **The hero-metric template.** Big number, small label, tiny green delta, curved sparkline, repeated five times across. SaaS cliché.
- **Identical card grids with colored icon tiles.** Each KPI tile getting its own gradient color (emerald / indigo / rose / amber) is decorative noise; it implies the metrics belong to different "categories" when they don't.
- **Glassmorphism, gradient text, side-stripe borders, pulsing dots everywhere, rounded-9999 everything.** All present in the current build to varying degrees. All going.
- **Eampark / crypto-yield aesthetic exactly as-is.** The reference image is a *style direction*, not a copy target. Lucia is settlement, not yield. The lessons to keep: monumental tabular numerals, black topbar, monochrome surfaces, single accent. The lessons to leave: invest/transfer/withdraw verbs, balance-as-hero, crypto vibe.

## Strategic principles

1. **The number is the hero.** When a screen is screenshotted into the LH executive deck, the metric must read first, the label second, the chrome last (or not at all). Tabular figures, generous size, tight tracking.

2. **One accent, one register.** Settlement-green (#10B981 family) is the only saturated color. It carries: live status, positive deltas, primary actions. Everything else is ink-on-white. Drop indigo, sky, amber, rose as KPI accents — keep them only for semantic state where they earn their place (rose = anomaly severity, amber = warning, never as decoration).

3. **Audit-grade, not editorial.** This is a Hyperledger-anchored settlement instrument. Information density is correct; whitespace bloat reads as "marketing site." But: density without rhythm is a wall of text. Use scale contrast (display nums 40–48px vs. labels 11–12px) and 1px dividers, not card chrome.

4. **Korean type comes first.** Pretendard Variable for UI, Geist Mono for figures. Korean mass-paragraph readability sets the line-length cap. Manrope is reserved for occasional Latin display in headers; do not let it leak into body text.

5. **Light theme by default.** Office light, daytime business hours, executive monitor. The reference image's outer dark frame is its photograph — the actual product surface inside is white. Lucia matches that.

6. **Black topbar.** A single dark band carries the navigation and identity. Inside the application surface, the eye sees pure white and dense data — the topbar is a hard horizon line, not a soft pill-laden chrome row.

## Brand

The Lucia mark is a single dark wedge (not a gradient lightning bolt). The product is named for clarity (lux). The visual identity is the absence of visual identity — *typography behaving precisely* is the brand.
